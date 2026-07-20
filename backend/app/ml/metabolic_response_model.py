import torch
import torch.nn as nn
import numpy as np
import os

class MetabolicResponseModel(nn.Module):
    """
    Multi-modal metabolic response prediction model.
    Inputs: user features, genomic features, microbiome features, food features
    Outputs: glucose response, insulin response, nutrient absorption efficiency
    """
    def __init__(
        self,
        user_feature_dim=4,
        genomic_feature_dim=128,
        microbiome_feature_dim=256,
        food_feature_dim=64,
        hidden_dim=256,
        num_heads=4,
        num_transformer_layers=2,
    ):
        super().__init__()
        self.user_encoder = nn.Sequential(
            nn.Linear(user_feature_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
        )
        self.genomic_encoder = nn.Sequential(
            nn.Linear(genomic_feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
        )
        self.microbiome_encoder = nn.Sequential(
            nn.Linear(microbiome_feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
        )
        self.food_encoder = nn.Sequential(
            nn.Linear(food_feature_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
        )

        self.fusion_dim = 64 + 128 + 128 + 64
        self.attention = nn.MultiheadAttention(self.fusion_dim, num_heads, batch_first=True)
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=self.fusion_dim, nhead=num_heads, dim_feedforward=hidden_dim, batch_first=True),
            num_layers=num_transformer_layers,
        )

        self.predictor = nn.Sequential(
            nn.Linear(self.fusion_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 3),  # glucose, insulin, absorption
        )

    def forward(self, user_features, genomic_features, microbiome_features, food_features):
        u = self.user_encoder(user_features)
        g = self.genomic_encoder(genomic_features)
        m = self.microbiome_encoder(microbiome_features)
        f = self.food_encoder(food_features)

        fused = torch.cat([u, g, m, f], dim=-1).unsqueeze(1)
        attn_out, _ = self.attention(fused, fused, fused)
        trans_out = self.transformer(attn_out)
        pooled = trans_out.squeeze(1)
        return self.predictor(pooled)


class MetabolicResponsePredictor:
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = MetabolicResponseModel().to(self.device)
        self.model.eval()

        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            # Initialize with reasonable defaults for demo inference
            pass

    def predict(self, user_dict, food_dict):
        """
        user_dict: {age, gender_encoded, bmi, activity_level_encoded}
        food_dict: {calories, protein, fat, carbs, fiber, gi}
        """
        with torch.no_grad():
            user_vec = torch.tensor([
                [user_dict.get('age', 30) / 100,
                 user_dict.get('gender', 0),
                 user_dict.get('bmi', 22) / 40,
                 user_dict.get('activity', 1) / 3]
            ], dtype=torch.float32).to(self.device)

            # Simulated genomic/microbiome embeddings (would come from real data)
            genomic_vec = torch.randn(1, 128).to(self.device) * 0.1
            microbiome_vec = torch.randn(1, 256).to(self.device) * 0.1

            food_vec = torch.tensor([
                [food_dict.get('calories', 200) / 1000,
                 food_dict.get('protein', 10) / 50,
                 food_dict.get('fat', 10) / 50,
                 food_dict.get('carbs', 30) / 100,
                 food_dict.get('fiber', 5) / 20,
                 food_dict.get('gi', 50) / 100]
            ], dtype=torch.float32).to(self.device)

            output = self.model(user_vec, genomic_vec, microbiome_vec, food_vec)
            glucose, insulin, absorption = output[0].cpu().numpy()

            return {
                'glucose_response': float(np.clip(glucose * 100 + 90, 70, 250)),
                'insulin_response': float(np.clip(insulin * 50 + 20, 5, 150)),
                'absorption_efficiency': float(np.clip(absorption * 0.5 + 0.5, 0.1, 1.0)),
            }


# Singleton instance
_predictor = None

def get_predictor() -> MetabolicResponsePredictor:
    global _predictor
    if _predictor is None:
        model_dir = os.path.join(os.path.dirname(__file__), 'weights')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, 'metabolic_response.pt')
        _predictor = MetabolicResponsePredictor(model_path=model_path)
    return _predictor
