import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import os

class GeneNutritionGNN(nn.Module):
    """
    Graph Neural Network modeling gene-nutrient-metabolite interactions.
    Nodes: genes, nutrients, metabolites
    Edges: regulatory and metabolic relationships
    """
    def __init__(self, num_genes=50, num_nutrients=30, num_metabolites=40, hidden_dim=64):
        super().__init__()
        self.gene_embed = nn.Embedding(num_genes, hidden_dim)
        self.nutrient_embed = nn.Embedding(num_nutrients, hidden_dim)
        self.metabolite_embed = nn.Embedding(num_metabolites, hidden_dim)

        self.gcn1 = nn.Linear(hidden_dim, hidden_dim)
        self.gcn2 = nn.Linear(hidden_dim, hidden_dim)

        self.scorer = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid(),
        )

    def forward(self, gene_ids, nutrient_ids, metabolite_ids, adjacency=None):
        g = self.gene_embed(gene_ids)
        n = self.nutrient_embed(nutrient_ids)
        m = self.metabolite_embed(metabolite_ids)

        if adjacency is not None:
            g = F.relu(self.gcn1(torch.matmul(adjacency, g)))
            g = self.gcn2(torch.matmul(adjacency, g))

        pooled_g = g.mean(dim=1)
        pooled_n = n.mean(dim=1)
        pooled_m = m.mean(dim=1)

        combined = torch.cat([pooled_g, pooled_n, pooled_m], dim=-1)
        return self.scorer(combined)


class GeneNutritionInteractionModel:
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = GeneNutritionGNN().to(self.device)
        self.model.eval()
        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))

    def score_interaction(self, gene_indices, nutrient_indices):
        with torch.no_grad():
            g = torch.tensor([gene_indices], dtype=torch.long).to(self.device)
            n = torch.tensor([nutrient_indices], dtype=torch.long).to(self.device)
            m = torch.tensor([[0]], dtype=torch.long).to(self.device)
            score = self.model(g, n, m)
            return float(score.item())


_gnn_model = None

def get_gnn_model() -> GeneNutritionInteractionModel:
    global _gnn_model
    if _gnn_model is None:
        model_dir = os.path.join(os.path.dirname(__file__), 'weights')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, 'gene_nutrition.pt')
        _gnn_model = GeneNutritionInteractionModel(model_path=model_path)
    return _gnn_model
