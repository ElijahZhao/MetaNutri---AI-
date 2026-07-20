from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.food import FoodNutrition
from app.models.recommendation import NutritionRecommendation

router = APIRouter(prefix="/api/nutrition-alerts", tags=["nutrition-alerts"])

# Reference daily values for key nutrients
REFERENCE_VALUES = {
    "calories": 2000,
    "protein": 50,
    "fiber": 25,
    "vitamin_c": 90,
    "vitamin_d": 20,
    "calcium": 1000,
    "iron": 18,
    "omega3": 1.5,
    "folate": 400,
    "vitamin_b12": 2.4,
}


@router.get("/deficiencies")
async def get_nutrient_deficiencies(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze user's recent food intake and identify potential nutrient deficiencies"""
    
    # Get recent recommendations/food items
    result = await db.execute(
        select(NutritionRecommendation)
        .where(NutritionRecommendation.user_id == current_user.id)
        .order_by(NutritionRecommendation.created_at.desc())
        .limit(10)
    )
    recommendations = result.scalars().all()
    
    if not recommendations:
        return {
            "status": "no_data",
            "message": "No food intake data available. Generate meal plans to get deficiency alerts.",
            "alerts": [],
            "overall_score": None,
        }
    
    # Calculate aggregated nutrient intake
    aggregated = {
        "calories": 0,
        "protein": 0,
        "fiber": 0,
        "vitamin_c": 0,
        "vitamin_d": 0,
        "calcium": 0,
        "iron": 0,
        "omega3": 0,
        "folate": 0,
        "vitamin_b12": 0,
    }
    
    for rec in recommendations:
        if rec.food_items:
            for item in rec.food_items:
                # Estimate nutrients based on food name
                food_name = item.get("name", "").lower()
                
                # Simple heuristics for nutrient estimation
                if any(x in food_name for x in ["orange", "strawberry", "kiwi", "pepper"]):
                    aggregated["vitamin_c"] += 30
                if any(x in food_name for x in ["salmon", "mackerel", "sardine", "fish"]):
                    aggregated["omega3"] += 0.5
                    aggregated["vitamin_d"] += 5
                if any(x in food_name for x in ["milk", "cheese", "yogurt", "dairy"]):
                    aggregated["calcium"] += 200
                    aggregated["vitamin_b12"] += 0.5
                if any(x in food_name for x in ["spinach", "kale", "broccoli", "leafy"]):
                    aggregated["folate"] += 50
                    aggregated["iron"] += 1
                if any(x in food_name for x in ["meat", "beef", "chicken", "egg"]):
                    aggregated["protein"] += 15
                    aggregated["iron"] += 2
                    aggregated["vitamin_b12"] += 0.8
                if any(x in food_name for x in ["bean", "lentil", "chickpea", "legume"]):
                    aggregated["fiber"] += 5
                    aggregated["protein"] += 8
                    aggregated["folate"] += 30
                if any(x in food_name for x in ["whole grain", "oat", "brown rice", "quinoa"]):
                    aggregated["fiber"] += 3
                    aggregated["folate"] += 10
                
                aggregated["calories"] += item.get("calories", 0)
    
    # Calculate deficiency percentages
    alerts = []
    total_score = 0
    
    for nutrient, ref_value in REFERENCE_VALUES.items():
        current = aggregated.get(nutrient, 0)
        percentage = (current / ref_value) * 100 if ref_value > 0 else 0
        total_score += min(percentage, 100)
        
        if percentage < 50:
            severity = "high"
            emoji = "🔴"
        elif percentage < 80:
            severity = "moderate"
            emoji = "🟡"
        else:
            severity = "low"
            emoji = "🟢"
        
        food_suggestions = {
            "calories": ["Nuts", "Avocado", "Whole grains", "Olive oil"],
            "protein": ["Chicken breast", "Greek yogurt", "Lentils", "Eggs"],
            "fiber": ["Chia seeds", "Broccoli", "Oats", "Apples"],
            "vitamin_c": ["Oranges", "Bell peppers", "Strawberries", "Kiwi"],
            "vitamin_d": ["Salmon", "Fortified milk", "Egg yolks", "Mushrooms"],
            "calcium": ["Cheese", "Yogurt", "Tofu", "Almonds"],
            "iron": ["Spinach", "Red meat", "Lentils", "Pumpkin seeds"],
            "omega3": ["Salmon", "Walnuts", "Flaxseeds", "Chia seeds"],
            "folate": ["Spinach", "Asparagus", "Brussels sprouts", "Avocado"],
            "vitamin_b12": ["Clams", "Beef liver", "Fortified cereals", "Nutritional yeast"],
        }
        
        alerts.append({
            "nutrient": nutrient.replace("_", " ").title(),
            "current_value": round(current, 1),
            "reference_value": ref_value,
            "percentage": round(percentage, 1),
            "severity": severity,
            "emoji": emoji,
            "suggestions": food_suggestions.get(nutrient, ["Consult a nutritionist"]),
        })
    
    # Sort by severity
    severity_order = {"high": 0, "moderate": 1, "low": 2}
    alerts.sort(key=lambda x: severity_order[x["severity"]])
    
    overall_score = round(total_score / len(REFERENCE_VALUES), 1)
    
    high_risk = [a for a in alerts if a["severity"] == "high"]
    moderate_risk = [a for a in alerts if a["severity"] == "moderate"]
    
    return {
        "status": "success",
        "overall_score": overall_score,
        "overall_assessment": "Excellent" if overall_score >= 90 else "Good" if overall_score >= 70 else "Needs Improvement" if overall_score >= 50 else "Critical",
        "analysis_period": "Last 10 meal plans",
        "high_risk_count": len(high_risk),
        "moderate_risk_count": len(moderate_risk),
        "alerts": alerts,
        "top_priorities": high_risk[:3] if high_risk else moderate_risk[:3] if moderate_risk else [],
    }


@router.get("/summary")
async def get_nutrition_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a quick nutrition summary with key metrics"""
    
    result = await db.execute(
        select(NutritionRecommendation)
        .where(NutritionRecommendation.user_id == current_user.id)
        .order_by(NutritionRecommendation.created_at.desc())
        .limit(5)
    )
    recommendations = result.scalars().all()
    
    if not recommendations:
        return {
            "status": "no_data",
            "message": "No nutrition data available yet.",
        }
    
    total_calories = sum(
        sum(f.get("calories", 0) for f in (rec.food_items or []))
        for rec in recommendations
    )
    
    avg_calories = total_calories / len(recommendations) if recommendations else 0
    
    return {
        "status": "success",
        "recent_meals_count": len(recommendations),
        "average_calories_per_meal": round(avg_calories, 0),
        "last_updated": recommendations[0].created_at.isoformat() if recommendations else None,
        "recommendation": "Generate more meal plans for detailed analysis" if len(recommendations) < 3 else "Nutrition data is being tracked",
    }