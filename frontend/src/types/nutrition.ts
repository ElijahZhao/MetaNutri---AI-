/**
 * Nutrition domain types: foods, recommendations and deficiency alerts.
 * Shapes mirror backend/app/schemas/food.py, schemas/recommendation.py and
 * backend/app/api/nutrition_alerts.py.
 */

export interface Food {
  id: string;
  food_name: string;
  category: string | null;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  vitamins: Record<string, number> | null;
  minerals: Record<string, number> | null;
  glycemic_index: number | null;
  glycemic_load: number | null;
  created_at: string;
}

export interface FoodSearchResult {
  query: string;
  results: Food[];
  total: number;
}

export interface FoodScore {
  food_id: string;
  food_name: string;
  score: number;
  explanation: string;
}

export interface FoodScoreRequest {
  food_id: string;
}

/** One entry inside `Recommendation.food_items`. */
export interface RecommendationFoodItem {
  name: string;
  calories?: number;
  [key: string]: unknown;
}

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_type: string | null;
  food_items: RecommendationFoodItem[] | null;
  nutrient_targets: Record<string, number> | null;
  confidence_score: number | null;
  explanation: string | null;
  created_at: string;
}

export interface MealPlanRequest {
  meal_type?: string;
  calorie_target?: number;
}

export type AlertSeverity = 'high' | 'moderate' | 'low';

export interface NutrientAlert {
  nutrient: string;
  current_value: number;
  reference_value: number;
  percentage: number;
  severity: AlertSeverity;
  emoji: string;
  suggestions: string[];
}

/**
 * `GET /api/nutrition-alerts/deficiencies`.
 * Returns `status: 'no_data'` (with an empty `alerts` array) when the user has
 * no meal plans yet, so consumers must check `status` before reading the rest.
 */
export interface DeficiencyReport {
  status: 'success' | 'no_data';
  overall_score: number | null;
  alerts: NutrientAlert[];
  top_priorities: NutrientAlert[];
  overall_assessment?: string;
  analysis_period?: string;
  high_risk_count?: number;
  moderate_risk_count?: number;
  message?: string;
}

/** `GET /api/nutrition-alerts/summary`. */
export interface NutritionSummary {
  status: 'success' | 'no_data';
  recent_meals_count?: number;
  average_calories_per_meal?: number;
  last_updated?: string | null;
  recommendation?: string;
  message?: string;
}
