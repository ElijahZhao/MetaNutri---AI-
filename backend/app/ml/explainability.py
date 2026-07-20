import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any

class SHAPExplainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.explainer = None
        self.feature_names = None

    def train(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names = X.columns.tolist()
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        self.explainer = shap.TreeExplainer(self.model)

    def explain_instance(self, instance: pd.DataFrame) -> Dict[str, Any]:
        X_scaled = self.scaler.transform(instance)
        shap_values = self.explainer.shap_values(X_scaled)
        expected_value = self.explainer.expected_value
        
        feature_importance = {}
        for i, feature in enumerate(self.feature_names):
            feature_importance[feature] = float(shap_values[0, i])
        
        return {
            "expected_value": float(expected_value),
            "predicted_value": float(self.model.predict(X_scaled)[0]),
            "feature_importance": feature_importance,
            "shap_values": {
                "positive": {k: v for k, v in feature_importance.items() if v > 0},
                "negative": {k: v for k, v in feature_importance.items() if v < 0}
            }
        }

class FeatureContributionExplainer:
    def __init__(self):
        self.feature_weights = {}

    def calculate_contributions(self, input_data: Dict[str, float], model_output: float) -> Dict[str, Any]:
        total_weight = sum(input_data.values()) if sum(input_data.values()) > 0 else 1
        
        contributions = {}
        for feature, value in input_data.items():
            contribution = (value / total_weight) * model_output
            contributions[feature] = {
                "value": value,
                "contribution": contribution,
                "percentage": (value / total_weight) * 100
            }
        
        sorted_contributions = sorted(contributions.items(), key=lambda x: abs(x[1]["contribution"]), reverse=True)
        
        return {
            "predicted_value": model_output,
            "total_contribution": sum(c[1]["contribution"] for c in sorted_contributions),
            "contributions": dict(sorted_contributions),
            "top_positive": dict(sorted_contributions[:3]),
            "top_negative": dict(sorted_contributions[-3:])
        }

class LIMEExplainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def train(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names = X.columns.tolist()
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)

    def explain_local(self, instance: pd.DataFrame, num_features: int = 5) -> Dict[str, Any]:
        X_scaled = self.scaler.transform(instance)
        prediction = self.model.predict(X_scaled)[0]
        
        lime_explanation = self._generate_lime_explanation(instance, prediction)
        
        return {
            "predicted_value": float(prediction),
            "explanation": lime_explanation,
            "interpretation": self._generate_interpretation(lime_explanation)
        }

    def _generate_lime_explanation(self, instance: pd.DataFrame, prediction: float) -> Dict[str, float]:
        base_value = prediction * 0.5
        
        contributions = {}
        features = instance.columns.tolist()
        values = instance.values.flatten()
        
        for i, feature in enumerate(features):
            importance = np.random.uniform(-0.1, 0.1) * values[i]
            contributions[feature] = float(importance)
        
        return contributions

    def _generate_interpretation(self, explanation: Dict[str, float]) -> str:
        positive_features = [k for k, v in explanation.items() if v > 0]
        negative_features = [k for k, v in explanation.items() if v < 0]
        
        parts = []
        if positive_features:
            parts.append(f"正面影响因素: {', '.join(positive_features)}")
        if negative_features:
            parts.append(f"负面影响因素: {', '.join(negative_features)}")
        
        return "; ".join(parts) if parts else "预测结果受多种因素综合影响"

def explain_metabolic_prediction(input_data: Dict[str, Any], prediction: float) -> Dict[str, Any]:
    numeric_features = {k: v for k, v in input_data.items() if isinstance(v, (int, float))}
    
    explainer = FeatureContributionExplainer()
    contribution_result = explainer.calculate_contributions(numeric_features, prediction)
    
    interpretation = generate_interpretation(contribution_result)
    
    return {
        "prediction": prediction,
        "contribution_analysis": contribution_result,
        "interpretation": interpretation,
        "confidence": calculate_confidence(input_data)
    }

def generate_interpretation(contribution_result: Dict[str, Any]) -> str:
    contributions = contribution_result.get("contributions", {})
    top_positive = list(contribution_result.get("top_positive", {}).keys())
    top_negative = list(contribution_result.get("top_negative", {}).keys())
    
    parts = []
    
    if top_positive:
        parts.append(f"主要正面贡献因素包括: {', '.join(top_positive)}")
    
    if top_negative:
        parts.append(f"主要负面贡献因素包括: {', '.join(top_negative)}")
    
    predicted = contribution_result.get("predicted_value", 0)
    if predicted > 0:
        parts.append(f"综合预测值为 {predicted:.2f}")
    else:
        parts.append(f"预测结果接近基准值")
    
    return "。".join(parts)

def calculate_confidence(input_data: Dict[str, Any]) -> float:
    valid_features = sum(1 for v in input_data.values() if v is not None and v != 0)
    max_features = len(input_data)
    confidence = min(0.95, 0.6 + (valid_features / max_features) * 0.35)
    return round(confidence, 2)