from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
import random
import numpy as np

from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/predict", tags=["predict"])


class GlucoseResponseRequest(BaseModel):
    user_id: UUID
    food_ids: List[UUID]
    portion_sizes: Optional[List[float]] = None


class GlucoseResponseResponse(BaseModel):
    user_id: UUID
    predicted_glucose_curve: List[dict]
    peak_glucose: float
    time_to_peak: int
    aic_score: float


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


class RiskAssessmentResponse(BaseModel):
    user_id: UUID
    overall_risk_score: float
    diabetes_risk: float
    obesity_risk: float
    cardiovascular_risk: float
    suggestions: List[str]


@router.post("/glucose-response", response_model=GlucoseResponseResponse)
async def predict_glucose_response(
    req: GlucoseResponseRequest,
    current_user: User = Depends(get_current_active_user)
):
    # Simulated metabolic model
    t = np.linspace(0, 120, 25)
    peak = random.uniform(120, 180)
    time_peak = random.randint(30, 60)
    curve = peak * np.exp(-((t - time_peak) ** 2) / (2 * (20 ** 2))) + random.uniform(70, 90)
    curve = np.maximum(curve, 70)

    glucose_curve = [{"time": int(ti), "glucose": float(gi)} for ti, gi in zip(t, curve)]

    return GlucoseResponseResponse(
        user_id=current_user.id,
        predicted_glucose_curve=glucose_curve,
        peak_glucose=float(peak),
        time_to_peak=time_peak,
        aic_score=round(random.uniform(4.5, 7.5), 2)
    )


@router.post("/nutrient-absorption", response_model=NutrientAbsorptionResponse)
async def predict_nutrient_absorption(
    req: NutrientAbsorptionRequest,
    current_user: User = Depends(get_current_active_user)
):
    absorption = random.uniform(0.3, 0.95)
    bioavail = absorption * 100

    recommendation = (
        "High bioavailability. Good absorption expected."
        if absorption > 0.7 else
        "Moderate absorption. Consider co-ingesting with vitamin C or fats."
        if absorption > 0.5 else
        "Low absorption predicted. Consider supplementation or fortified foods."
    )

    return NutrientAbsorptionResponse(
        user_id=current_user.id,
        nutrient=req.nutrient,
        absorption_rate=round(absorption, 3),
        bioavailability_score=round(bioavail, 1),
        recommendation=recommendation
    )


@router.get("/risk-assessment", response_model=RiskAssessmentResponse)
async def risk_assessment(
    current_user: User = Depends(get_current_active_user)
):
    diabetes = random.uniform(0.1, 0.8)
    obesity = random.uniform(0.1, 0.7)
    cardio = random.uniform(0.1, 0.6)
    overall = (diabetes + obesity + cardio) / 3

    suggestions = []
    if diabetes > 0.5:
        suggestions.append("Reduce refined carbohydrate intake and monitor blood glucose regularly.")
    if obesity > 0.5:
        suggestions.append("Implement caloric deficit and increase physical activity.")
    if cardio > 0.5:
        suggestions.append("Prioritize omega-3 rich foods and reduce sodium intake.")
    if not suggestions:
        suggestions.append("Maintain current healthy lifestyle and regular checkups.")

    return RiskAssessmentResponse(
        user_id=current_user.id,
        overall_risk_score=round(overall, 2),
        diabetes_risk=round(diabetes, 2),
        obesity_risk=round(obesity, 2),
        cardiovascular_risk=round(cardio, 2),
        suggestions=suggestions
    )
