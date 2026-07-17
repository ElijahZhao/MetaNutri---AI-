import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.food import FoodNutrition


FOOD_SEEDS = [
    {"food_name": "Oatmeal", "category": "Grains", "calories_kcal": 68, "protein_g": 2.4, "fat_g": 1.4, "carbs_g": 12.0, "fiber_g": 1.7, "vitamins": {"B1": 0.08}, "minerals": {"iron": 0.9}, "glycemic_index": 55, "glycemic_load": 9},
    {"food_name": "Chicken Breast", "category": "Meat", "calories_kcal": 165, "protein_g": 31.0, "fat_g": 3.6, "carbs_g": 0, "fiber_g": 0, "vitamins": {"B6": 0.6}, "minerals": {"zinc": 1.0}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Salmon", "category": "Seafood", "calories_kcal": 208, "protein_g": 20.0, "fat_g": 13.0, "carbs_g": 0, "fiber_g": 0, "vitamins": {"D": 11.0}, "minerals": {"selenium": 36.5}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Broccoli", "category": "Vegetables", "calories_kcal": 34, "protein_g": 2.8, "fat_g": 0.4, "carbs_g": 7.0, "fiber_g": 2.6, "vitamins": {"C": 89.2}, "minerals": {"potassium": 316}, "glycemic_index": 10, "glycemic_load": 1},
    {"food_name": "Brown Rice", "category": "Grains", "calories_kcal": 111, "protein_g": 2.6, "fat_g": 0.9, "carbs_g": 23.0, "fiber_g": 1.8, "vitamins": {"B3": 1.5}, "minerals": {"magnesium": 43}, "glycemic_index": 50, "glycemic_load": 16},
    {"food_name": "Greek Yogurt", "category": "Dairy", "calories_kcal": 59, "protein_g": 10.0, "fat_g": 0.4, "carbs_g": 3.6, "fiber_g": 0, "vitamins": {"B12": 0.8}, "minerals": {"calcium": 110}, "glycemic_index": 11, "glycemic_load": 2},
    {"food_name": "Almonds", "category": "Nuts", "calories_kcal": 579, "protein_g": 21.0, "fat_g": 50.0, "carbs_g": 22.0, "fiber_g": 12.5, "vitamins": {"E": 25.6}, "minerals": {"magnesium": 270}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Avocado", "category": "Fruits", "calories_kcal": 160, "protein_g": 2.0, "fat_g": 15.0, "carbs_g": 9.0, "fiber_g": 7.0, "vitamins": {"K": 21.0}, "minerals": {"potassium": 485}, "glycemic_index": 15, "glycemic_load": 3},
    {"food_name": "Sweet Potato", "category": "Vegetables", "calories_kcal": 86, "protein_g": 1.6, "fat_g": 0.1, "carbs_g": 20.0, "fiber_g": 3.0, "vitamins": {"A": 14187}, "minerals": {"potassium": 337}, "glycemic_index": 63, "glycemic_load": 17},
    {"food_name": "Eggs", "category": "Dairy", "calories_kcal": 155, "protein_g": 13.0, "fat_g": 11.0, "carbs_g": 1.1, "fiber_g": 0, "vitamins": {"B12": 1.1}, "minerals": {"selenium": 30.7}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Spinach", "category": "Vegetables", "calories_kcal": 23, "protein_g": 2.9, "fat_g": 0.4, "carbs_g": 3.6, "fiber_g": 2.2, "vitamins": {"K": 483}, "minerals": {"iron": 2.7}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Blueberries", "category": "Fruits", "calories_kcal": 57, "protein_g": 0.7, "fat_g": 0.3, "carbs_g": 14.0, "fiber_g": 2.4, "vitamins": {"C": 9.7}, "minerals": {"manganese": 0.3}, "glycemic_index": 53, "glycemic_load": 8},
    {"food_name": "Quinoa", "category": "Grains", "calories_kcal": 120, "protein_g": 4.4, "fat_g": 1.9, "carbs_g": 21.0, "fiber_g": 2.8, "vitamins": {"B2": 0.11}, "minerals": {"magnesium": 64}, "glycemic_index": 53, "glycemic_load": 13},
    {"food_name": "Lentils", "category": "Legumes", "calories_kcal": 116, "protein_g": 9.0, "fat_g": 0.4, "carbs_g": 20.0, "fiber_g": 7.9, "vitamins": {"B9": 181}, "minerals": {"iron": 3.3}, "glycemic_index": 32, "glycemic_load": 7},
    {"food_name": "Olive Oil", "category": "Fats", "calories_kcal": 884, "protein_g": 0, "fat_g": 100.0, "carbs_g": 0, "fiber_g": 0, "vitamins": {"E": 14.4}, "minerals": {}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Tuna", "category": "Seafood", "calories_kcal": 132, "protein_g": 28.0, "fat_g": 1.0, "carbs_g": 0, "fiber_g": 0, "vitamins": {"B12": 2.1}, "minerals": {"selenium": 80.4}, "glycemic_index": 0, "glycemic_load": 0},
    {"food_name": "Apple", "category": "Fruits", "calories_kcal": 52, "protein_g": 0.3, "fat_g": 0.2, "carbs_g": 14.0, "fiber_g": 2.4, "vitamins": {"C": 4.6}, "minerals": {"potassium": 107}, "glycemic_index": 36, "glycemic_load": 5},
    {"food_name": "Carrots", "category": "Vegetables", "calories_kcal": 41, "protein_g": 0.9, "fat_g": 0.2, "carbs_g": 10.0, "fiber_g": 2.8, "vitamins": {"A": 8350}, "minerals": {"potassium": 320}, "glycemic_index": 39, "glycemic_load": 3},
    {"food_name": "Banana", "category": "Fruits", "calories_kcal": 89, "protein_g": 1.1, "fat_g": 0.3, "carbs_g": 23.0, "fiber_g": 2.6, "vitamins": {"B6": 0.4}, "minerals": {"potassium": 358}, "glycemic_index": 51, "glycemic_load": 13},
    {"food_name": "Cottage Cheese", "category": "Dairy", "calories_kcal": 98, "protein_g": 11.0, "fat_g": 4.3, "carbs_g": 3.4, "fiber_g": 0, "vitamins": {"B12": 0.4}, "minerals": {"calcium": 83}, "glycemic_index": 10, "glycemic_load": 1},
]


async def seed_foods():
    async with AsyncSessionLocal() as session:
        for food_data in FOOD_SEEDS:
            result = await session.execute(select(FoodNutrition).where(FoodNutrition.food_name == food_data["food_name"]))
            if not result.scalar_one_or_none():
                session.add(FoodNutrition(**food_data))
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed_foods())
