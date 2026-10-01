/**
 * Prediction / risk domain types.
 * Shapes mirror the response models in backend/app/api/predict.py.
 */

export interface RiskAssessment {
  user_id: string;
  overall_risk_score: number;
  diabetes_risk: number;
  obesity_risk: number;
  cardiovascular_risk: number;
  suggestions: string[];
  confidence: number;
}

export interface GlucoseCurvePoint {
  time: number;
  glucose: number;
}

export interface GlucosePredictionRequest {
  user_id: string;
  food_ids: string[];
  portion_sizes?: number[];
}

export interface GlucosePrediction {
  user_id: string;
  predicted_glucose_curve: GlucoseCurvePoint[];
  peak_glucose: number;
  time_to_peak: number;
  aic_score: number;
  interpretation: string;
}

export interface NutrientAbsorptionRequest {
  user_id: string;
  nutrient: string;
  amount_mg: number;
}

export interface NutrientAbsorptionPrediction {
  user_id: string;
  nutrient: string;
  absorption_rate: number;
  bioavailability_score: number;
  recommendation: string;
  feature_contributions: Record<string, number>;
}
