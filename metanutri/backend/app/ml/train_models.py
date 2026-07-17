"""
Training script for MetaNutri AI models.
In a production environment, this would train on real multi-omics datasets.
For demonstration, it creates synthetic data and trains the model architectures.
"""
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import os
from app.ml.metabolic_response_model import MetabolicResponseModel
from app.ml.gene_nutrition_model import GeneNutritionGNN
from app.ml.microbiome_vae import MicrobiomeVAE

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'weights')
os.makedirs(MODEL_DIR, exist_ok=True)


def train_metabolic_response_model(epochs=50):
    print("Training MetabolicResponseModel...")
    model = MetabolicResponseModel()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.MSELoss()

    for epoch in range(epochs):
        model.train()
        user = torch.randn(32, 4)
        genomic = torch.randn(32, 128)
        microbiome = torch.randn(32, 256)
        food = torch.randn(32, 64)
        target = torch.randn(32, 3) * 0.5 + 0.5

        optimizer.zero_grad()
        pred = model(user, genomic, microbiome, food)
        loss = criterion(pred, target)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")

    path = os.path.join(MODEL_DIR, 'metabolic_response.pt')
    torch.save(model.state_dict(), path)
    print(f"Saved to {path}")


def train_gene_nutrition_model(epochs=50):
    print("Training GeneNutritionGNN...")
    model = GeneNutritionGNN()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.BCELoss()

    for epoch in range(epochs):
        model.train()
        g = torch.randint(0, 50, (32, 5))
        n = torch.randint(0, 30, (32, 3))
        m = torch.randint(0, 40, (32, 2))
        target = torch.rand(32, 1)

        optimizer.zero_grad()
        pred = model(g, n, m)
        loss = criterion(pred, target)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")

    path = os.path.join(MODEL_DIR, 'gene_nutrition.pt')
    torch.save(model.state_dict(), path)
    print(f"Saved to {path}")


def train_microbiome_vae(epochs=50):
    print("Training MicrobiomeVAE...")
    model = MicrobiomeVAE(input_dim=100)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    for epoch in range(epochs):
        model.train()
        x = torch.rand(32, 100)
        x = x / x.sum(dim=-1, keepdim=True)

        optimizer.zero_grad()
        recon, mu, logvar = model(x)
        recon_loss = nn.functional.mse_loss(recon, x)
        kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp()) / x.size(0)
        loss = recon_loss + 0.01 * kl_loss
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")

    path = os.path.join(MODEL_DIR, 'microbiome_vae.pt')
    torch.save(model.state_dict(), path)
    print(f"Saved to {path}")


def train_all():
    train_metabolic_response_model()
    train_gene_nutrition_model()
    train_microbiome_vae()
    print("All models trained and saved.")


if __name__ == '__main__':
    train_all()
