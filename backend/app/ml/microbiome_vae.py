import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import os

class MicrobiomeVAE(nn.Module):
    """
    Variational Autoencoder for microbiome latent space learning.
    """
    def __init__(self, input_dim=100, latent_dim=16, hidden_dim=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)

        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim),
            nn.Softmax(dim=-1),
        )

    def encode(self, x):
        h = self.encoder(x)
        return self.fc_mu(h), self.fc_logvar(h)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z):
        return self.decoder(z)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar


class MicrobiomeOptimizer:
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = MicrobiomeVAE().to(self.device)
        self.model.eval()
        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))

    def encode_profile(self, abundance_vector):
        with torch.no_grad():
            x = torch.tensor([abundance_vector], dtype=torch.float32).to(self.device)
            mu, logvar = self.model.encode(x)
            return mu.cpu().numpy()[0]

    def suggest_diet(self, current_profile, target_improvement=0.1):
        """
        Simplified RL-based diet suggestion using latent space optimization.
        """
        latent = self.encode_profile(current_profile)
        # In a full implementation, this would use a trained policy network
        suggestions = []
        if target_improvement > 0:
            suggestions.append("Increase fiber intake to boost beneficial bacteria")
            suggestions.append("Add fermented foods daily")
            suggestions.append("Reduce refined sugar consumption")
        return {
            'current_latent': latent.tolist(),
            'suggestions': suggestions,
            'predicted_improvement': target_improvement,
        }


_vae_model = None

def get_vae_model() -> MicrobiomeOptimizer:
    global _vae_model
    if _vae_model is None:
        model_dir = os.path.join(os.path.dirname(__file__), 'weights')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, 'microbiome_vae.pt')
        _vae_model = MicrobiomeOptimizer(model_path=model_path)
    return _vae_model
