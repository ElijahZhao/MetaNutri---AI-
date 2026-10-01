from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.food import FoodNutrition
from app.models.profile import UserProfile
from app.ml.metabolic_response_model import get_predictor
from app.ml.explainability import explain_metabolic_prediction, FeatureContributionExplainer

router = APIRouter(prefix="/api/predict", tags=["predict"])


class GlucoseResponseRequest(BaseModel):
    user_id: UUID
    food_ids: List[UUID] = []
    portion_sizes: Optional[List[float]] = None


class GlucoseResponseResponse(BaseModel):
    user_id: UUID
    predicted_glucose_curve: List[dict]
    peak_glucose: float
    time_to_peak: int
    aic_score: float
    interpretation: str


class NutrientAbsorptionRequest(BaseModel):
    user_id: UUID
    nutrient: str
    amount_mg: float


class NutrientAbsorptionResponse(BaseModel):
    user_id: UUID
    nutrient: str
    absorption_rate: float
    bioavailability_score: float
    recommendation: str
    feature_contributions: dict


class RiskAssessmentResponse(BaseModel):
    user_id: UUID
    overall_risk_score: float
    diabetes_risk: float
    obesity_risk: float
    cardiovascular_risk: float
    suggestions: List[str]
    confidence: float


def _profile_features(profile: Optional[UserProfile]) -> dict:
    feats = {"age": 35, "gender": 0.5, "bmi": 23.0, "activity": 1.5}
    if not profile:
        return feats
    if profile.age:
        feats["age"] = float(profile.age)
    if profile.gender:
        feats["gender"] = 1.0 if profile.gender.lower().startswith(("m", "n")) else 0.0
    if profile.height_cm and profile.weight_kg:
        h = float(profile.height_cm) / 100.0
        if h > 0:
            feats["bmi"] = round(float(profile.weight_kg) / (h * h), 1)
    activity_map = {"sedentary": 1.2, "light": 1.4, "moderate": 1.6, "active": 1.8, "very_active": 2.0}
    feats["activity"] = activity_map.get((profile.activity_level or "").lower(), 1.5)
    return feats


def _food_features(foods: List[FoodNutrition]) -> dict:
    if not foods:
        return {"calories": 250, "protein": 15, "fat": 12, "carbs": 35, "fiber": 6, "gi": 55}
    n = len(foods)
    def avg(field, default):
        vals = [float(getattr(f, field)) for f in foods if getattr(f, field) is not None]
        return (sum(vals) / len(vals)) if vals else default
    return {
        "calories": avg("calories_kcal", 250),
        "protein": avg("protein_g", 15),
        "fat": avg("fat_g", 12),
        "carbs": avg("carbs_g", 35),
        "fiber": avg("fiber_g", 6),
        "gi": avg("glycemic_index", 55),
    }


def _predict_glucose_response(user_f: dict, food_f: dict) -> dict:
    """Deterministic, data-driven glucose response from real features.

    Returns a dict with `glucose_response` (peak mmol/L-ish value) and
    `aic_score`, both derived purely from the user profile and the actual
    foods consumed. No randomness, no untrained-model inference.
    """
    age = user_f["age"]
    bmi = user_f["bmi"]
    activity = user_f["activity"]

    carbs = float(food_f["carbs"])
    gi = float(food_f["gi"])
    fiber = float(food_f["fiber"])
    calories = float(food_f["calories"])
    fat = float(food_f["fat"])
    protein = float(food_f["protein"])

    # Glycemic load of the selected foods (single serving this meal).
    gly_load = max(0.0, carbs * gi / 100.0)

    # Fasting baseline glucose from the profile (mg/dL). Activity lowers it.
    fasting = 88 + max(0, age - 25) * 0.25 + max(0, bmi - 22) * 0.8 - (activity - 1.2) * 8

    # Postprandial excursion: carbs & high-GI raise it, fiber/protein/fat blunt it.
    excursion = gly_load * 1.6 - fiber * 1.5 - protein * 0.3 - fat * 0.25 + (calories / 2000) * 3
    excursion = float(np.clip(excursion, 10, 120))

    # The reported peak is the actual maximum of the curve below (fasting + excursion).
    peak = round(float(np.clip(fasting + excursion, 90, 250)), 2)

    # Area increment matching the same inputs (deterministic).
    aic_score = round(float(np.log1p(gly_load) * 32 + carbs * 0.6 + fiber * 2.0 + max(0, fasting - 90) * 0.4), 2)

    return {"glucose_response": peak, "fasting": round(fasting, 2), "aic_score": aic_score}


@router.post("/glucose-response", response_model=GlucoseResponseResponse)
async def predict_glucose_response(
    req: GlucoseResponseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Use the caller's actual foods (falls back to neutral defaults when empty).
    foods = []
    if req.food_ids:
        ids = [str(i) for i in req.food_ids]
        result = await db.execute(select(FoodNutrition).where(FoodNutrition.id.in_(ids)))
        foods = list(result.scalars().all())

    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == str(current_user.id)))
    profile = profile_result.scalar_one_or_none()

    user_features = _profile_features(profile)
    food_features = _food_features(foods)

    model_prediction = _predict_glucose_response(user_features, food_features)
    predicted_peak = float(model_prediction["glucose_response"])
    fasting = float(model_prediction["fasting"])

    t = np.linspace(0, 120, 25)
    # Deterministic peak: high-GI foods peak earlier.
    avg_gi = food_features["gi"]
    time_peak = int(max(20, min(90, round(48 - (avg_gi - 55) * 0.35))))
    # Gaussian bump: starts at the fasting baseline and reaches exactly `predicted_peak`
    # at `time_peak`, so the reported peak equals the curve maximum.
    curve = fasting + (predicted_peak - fasting) * np.exp(-((t - time_peak) ** 2) / (2 * (25 ** 2)))
    curve = np.maximum(curve, 60)

    glucose_curve = [{"time": int(ti), "glucose": float(gi)} for ti, gi in zip(t, curve)]

    input_data = {**user_features, **food_features}
    explanation = explain_metabolic_prediction(input_data, predicted_peak)

    interpretation_parts = []
    top_positive = list(explanation["contribution_analysis"].get("top_positive", {}).keys())[:2]
    top_negative = list(explanation["contribution_analysis"].get("top_negative", {}).keys())[:2]

    if top_positive:
        interpretation_parts.append(f"主要正面因素: {', '.join(top_positive)}")
    if top_negative:
        interpretation_parts.append(f"主要负面因素: {', '.join(top_negative)}")

    return GlucoseResponseResponse(
        user_id=current_user.id,
        predicted_glucose_curve=glucose_curve,
        peak_glucose=predicted_peak,
        time_to_peak=time_peak,
        aic_score=round(float(model_prediction["aic_score"]), 2),
        interpretation="; ".join(interpretation_parts) if interpretation_parts else "基于真实食物与用户画像的综合预测"
    )


@router.post("/nutrient-absorption", response_model=NutrientAbsorptionResponse)
async def predict_nutrient_absorption(
    req: NutrientAbsorptionRequest,
    current_user: User = Depends(get_current_active_user)
):
    nutrient_effects = {
        'Iron': {'base_rate': 0.35, 'variability': 0.2},
        'Calcium': {'base_rate': 0.25, 'variability': 0.15},
        'Vitamin C': {'base_rate': 0.85, 'variability': 0.1},
        'Vitamin D': {'base_rate': 0.65, 'variability': 0.2},
        'Zinc': {'base_rate': 0.45, 'variability': 0.18},
        'Magnesium': {'base_rate': 0.55, 'variability': 0.2},
    }
    
    effect = nutrient_effects.get(req.nutrient, {'base_rate': 0.5, 'variability': 0.2})
    absorption = max(0.1, min(0.95, effect['base_rate'] + np.random.uniform(-effect['variability'], effect['variability'])))
    bioavail = absorption * 100
    
    if absorption > 0.7:
        recommendation = f"{req.nutrient}吸收效率高。建议保持当前摄入量。"
    elif absorption > 0.5:
        recommendation = f"{req.nutrient}吸收效率中等。建议搭配维生素C或脂肪提高吸收。"
    else:
        recommendation = f"{req.nutrient}吸收效率较低。建议考虑补充剂或富含{req.nutrient}的食物。"
    
    input_data = {'amount': req.amount_mg, 'base_rate': effect['base_rate']}
    explainer = FeatureContributionExplainer()
    contributions = explainer.calculate_contributions(input_data, absorption)
    
    return NutrientAbsorptionResponse(
        user_id=current_user.id,
        nutrient=req.nutrient,
        absorption_rate=round(absorption, 3),
        bioavailability_score=round(bioavail, 1),
        recommendation=recommendation,
        feature_contributions=contributions.get('contributions', {})
    )


@router.get("/risk-assessment", response_model=RiskAssessmentResponse)
async def risk_assessment(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == str(current_user.id)))
    profile = profile_result.scalar_one_or_none()

    feats = _profile_features(profile)
    age = feats["age"]
    bmi = feats["bmi"]
    activity = feats["activity"]

    # Simple deterministic logistic-ish risk heuristics based on the profile.
    def clamp_risk(v):
        return round(min(0.85, max(0.08, v)), 2)

    diabetes = clamp_risk(0.05 + (age - 20) * 0.008 + max(0, bmi - 22) * 0.02 + max(0, 1.6 - activity) * 0.1)
    obesity = clamp_risk(0.05 + max(0, bmi - 18.5) * 0.05)
    cardio = clamp_risk(0.04 + (age - 25) * 0.007 + max(0, bmi - 24) * 0.015 + max(0, 1.6 - activity) * 0.08)
    overall = round((diabetes + obesity + cardio) / 3, 2)

    suggestions = []
    if diabetes > 0.45:
        suggestions.append("减少精制碳水化合物摄入，定期监测血糖。")
    if obesity > 0.45:
        suggestions.append("控制热量摄入，增加体育锻炼。")
    if cardio > 0.45:
        suggestions.append("优先摄入Omega-3食物，减少钠摄入。")
    if not suggestions:
        suggestions.append("保持当前健康生活方式，定期体检。")

    high_count = sum([diabetes > 0.45, obesity > 0.45, cardio > 0.45])
    confidence = round(min(0.95, 0.72 + (2 - high_count) * 0.06), 2)

    return RiskAssessmentResponse(
        user_id=current_user.id,
        overall_risk_score=overall,
        diabetes_risk=diabetes,
        obesity_risk=obesity,
        cardiovascular_risk=cardio,
        suggestions=suggestions,
        confidence=confidence
    )