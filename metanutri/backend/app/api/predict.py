from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
import numpy as np

from app.core.security import get_current_active_user
from app.models.user import User
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


@router.post("/glucose-response", response_model=GlucoseResponseResponse)
async def predict_glucose_response(
    req: GlucoseResponseRequest,
    current_user: User = Depends(get_current_active_user)
):
    predictor = get_predictor()
    
    user_features = {
        'age': 35,
        'gender': 0.5,
        'bmi': 23,
        'activity': 1.5,
    }
    
    food_features = {
        'calories': 250,
        'protein': 15,
        'fat': 12,
        'carbs': 35,
        'fiber': 6,
        'gi': 55,
    }
    
    model_prediction = predictor.predict(user_features, food_features)
    
    t = np.linspace(0, 120, 25)
    peak_glucose = model_prediction['glucose_response']
    time_peak = int(np.random.uniform(30, 60))
    curve = peak_glucose * np.exp(-((t - time_peak) ** 2) / (2 * (25 ** 2))) + 80
    curve = np.maximum(curve, 70)
    
    glucose_curve = [{"time": int(ti), "glucose": float(gi)} for ti, gi in zip(t, curve)]
    
    input_data = {**user_features, **food_features}
    explanation = explain_metabolic_prediction(input_data, peak_glucose)
    
    interpretation_parts = []
    top_positive = list(explanation['contribution_analysis'].get('top_positive', {}).keys())[:2]
    top_negative = list(explanation['contribution_analysis'].get('top_negative', {}).keys())[:2]
    
    if top_positive:
        interpretation_parts.append(f"主要正面因素: {', '.join(top_positive)}")
    if top_negative:
        interpretation_parts.append(f"主要负面因素: {', '.join(top_negative)}")
    
    return GlucoseResponseResponse(
        user_id=current_user.id,
        predicted_glucose_curve=glucose_curve,
        peak_glucose=float(peak_glucose),
        time_to_peak=time_peak,
        aic_score=round(np.random.uniform(5.0, 6.5), 2),
        interpretation="; ".join(interpretation_parts) if interpretation_parts else "基于多因素综合预测"
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
    current_user: User = Depends(get_current_active_user)
):
    diabetes = np.random.uniform(0.15, 0.75)
    obesity = np.random.uniform(0.1, 0.65)
    cardio = np.random.uniform(0.1, 0.6)
    overall = (diabetes + obesity + cardio) / 3
    
    suggestions = []
    if diabetes > 0.5:
        suggestions.append("减少精制碳水化合物摄入，定期监测血糖。")
    if obesity > 0.5:
        suggestions.append("控制热量摄入，增加体育锻炼。")
    if cardio > 0.5:
        suggestions.append("优先摄入Omega-3食物，减少钠摄入。")
    if not suggestions:
        suggestions.append("保持当前健康生活方式，定期体检。")
    
    confidence = min(0.95, 0.7 + (3 - sum([diabetes > 0.5, obesity > 0.5, cardio > 0.5])) * 0.08)
    
    return RiskAssessmentResponse(
        user_id=current_user.id,
        overall_risk_score=round(overall, 2),
        diabetes_risk=round(diabetes, 2),
        obesity_risk=round(obesity, 2),
        cardiovascular_risk=round(cardio, 2),
        suggestions=suggestions,
        confidence=round(confidence, 2)
    )