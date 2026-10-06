"""Deterministic feature-contribution helpers used by the live prediction API.

Only the proportional-attribution explainer below is wired into the API. The
former ``SHAPExplainer`` / ``LIMEExplainer`` prototypes were removed: no
endpoint referenced either of them, and ``LIMEExplainer`` fabricated its
attributions with ``np.random.uniform`` — an "explainer" that returned noise.
"""
from typing import Any, Dict


class FeatureContributionExplainer:
    """Proportional attribution: each feature carries the share of the output
    that matches its share of the input mass."""

    def calculate_contributions(
        self, input_data: Dict[str, float], model_output: float
    ) -> Dict[str, Any]:
        total_weight = sum(input_data.values())
        if total_weight <= 0:
            total_weight = 1

        contributions = {}
        for feature, value in input_data.items():
            contributions[feature] = {
                "value": value,
                "contribution": (value / total_weight) * model_output,
                "percentage": (value / total_weight) * 100,
            }

        # Rank by magnitude so the most influential feature comes first.
        ranked = sorted(
            contributions.items(),
            key=lambda item: abs(item[1]["contribution"]),
            reverse=True,
        )

        # Group by the *sign of the contribution*, not by a fixed-size slice.
        # The previous `sorted_contributions[-3:]` labelled the three smallest
        # entries "negative" even when every contribution was positive, so an
        # all-positive input produced a bogus "main negative factors" line.
        # Magnitude ordering means the most negative contribution sorts first.
        positives = {k: v for k, v in ranked if v["contribution"] > 0}
        negatives = {k: v for k, v in ranked if v["contribution"] < 0}

        return {
            "predicted_value": model_output,
            "total_contribution": sum(v["contribution"] for _, v in ranked),
            "contributions": dict(ranked),
            "top_positive": dict(list(positives.items())[:3]),
            "top_negative": dict(list(negatives.items())[:3]),
        }


def explain_metabolic_prediction(input_data: Dict[str, Any], prediction: float) -> Dict[str, Any]:
    numeric_features = {k: v for k, v in input_data.items() if isinstance(v, (int, float))}

    explainer = FeatureContributionExplainer()
    contribution_result = explainer.calculate_contributions(numeric_features, prediction)

    return {
        "prediction": prediction,
        "contribution_analysis": contribution_result,
        "interpretation": generate_interpretation(contribution_result),
        "confidence": calculate_confidence(input_data),
    }


def generate_interpretation(contribution_result: Dict[str, Any]) -> str:
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
        parts.append("预测结果接近基准值")

    return "。".join(parts)


def calculate_confidence(input_data: Dict[str, Any]) -> float:
    # Guard the divisor: an empty feature dict used to raise ZeroDivisionError.
    if not input_data:
        return 0.6
    valid_features = sum(1 for v in input_data.values() if v is not None and v != 0)
    confidence = min(0.95, 0.6 + (valid_features / len(input_data)) * 0.35)
    return round(confidence, 2)
