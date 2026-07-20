import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from scipy.spatial.distance import euclidean, braycurtis
from sklearn.cluster import KMeans
from typing import Dict, List, Any

class MicrobiomeAnalyzer:
    def __init__(self):
        self.otu_table = None
        self.metadata = None

    def load_data(self, otu_table: pd.DataFrame, metadata: pd.DataFrame = None):
        self.otu_table = otu_table
        self.metadata = metadata

    def calculate_alpha_diversity(self, method: str = "shannon") -> pd.Series:
        if self.otu_table is None:
            raise ValueError("OTU table not loaded")
        
        def shannon_diversity(row):
            row = row[row > 0]
            if len(row) == 0:
                return 0
            p = row / row.sum()
            return -np.sum(p * np.log(p))
        
        def simpson_diversity(row):
            row = row[row > 0]
            if len(row) == 0:
                return 0
            p = row / row.sum()
            return 1 - np.sum(p ** 2)
        
        def chao1_estimator(row):
            row = row[row > 0]
            n1 = sum(row == 1)
            n2 = sum(row == 2)
            if n2 == 0:
                return len(row)
            return len(row) + (n1 * (n1 - 1)) / (2 * (n2 + 1))
        
        if method == "shannon":
            return self.otu_table.apply(shannon_diversity, axis=1)
        elif method == "simpson":
            return self.otu_table.apply(simpson_diversity, axis=1)
        elif method == "chao1":
            return self.otu_table.apply(chao1_estimator, axis=1)
        else:
            raise ValueError(f"Unknown alpha diversity method: {method}")

    def calculate_beta_diversity(self, method: str = "braycurtis") -> np.ndarray:
        if self.otu_table is None:
            raise ValueError("OTU table not loaded")
        
        samples = self.otu_table.index
        n_samples = len(samples)
        distance_matrix = np.zeros((n_samples, n_samples))
        
        for i in range(n_samples):
            for j in range(i + 1, n_samples):
                if method == "braycurtis":
                    dist = braycurtis(self.otu_table.iloc[i], self.otu_table.iloc[j])
                elif method == "euclidean":
                    dist = euclidean(self.otu_table.iloc[i], self.otu_table.iloc[j])
                else:
                    raise ValueError(f"Unknown beta diversity method: {method}")
                distance_matrix[i, j] = dist
                distance_matrix[j, i] = dist
        
        return distance_matrix

    def pcoa_analysis(self, distance_matrix: np.ndarray = None, n_components: int = 3) -> Dict[str, Any]:
        if distance_matrix is None:
            distance_matrix = self.calculate_beta_diversity()
        
        pca = PCA(n_components=n_components)
        pcoa_results = pca.fit_transform(distance_matrix)
        
        explained_variance = pca.explained_variance_ratio_
        
        return {
            "coordinates": pcoa_results,
            "explained_variance": explained_variance,
            "total_explained": np.sum(explained_variance),
            "sample_names": self.otu_table.index.tolist()
        }

    def differential_abundance_analysis(self, group1_samples: List[str], group2_samples: List[str]) -> pd.DataFrame:
        if self.otu_table is None:
            raise ValueError("OTU table not loaded")
        
        group1 = self.otu_table.loc[group1_samples]
        group2 = self.otu_table.loc[group2_samples]
        
        results = []
        for taxon in self.otu_table.columns:
            g1_mean = group1[taxon].mean()
            g2_mean = group2[taxon].mean()
            g1_std = group1[taxon].std() if len(group1) > 1 else 0
            g2_std = group2[taxon].std() if len(group2) > 1 else 0
            
            fold_change = g2_mean / g1_mean if g1_mean > 0 else np.inf
            diff = g2_mean - g1_mean
            
            results.append({
                "taxon": taxon,
                "group1_mean": g1_mean,
                "group2_mean": g2_mean,
                "fold_change": fold_change,
                "difference": diff,
                "significant": abs(fold_change) > 2 or abs(diff) > 0.05
            })
        
        return pd.DataFrame(results).sort_values("fold_change", ascending=False)

    def clustering_analysis(self, n_clusters: int = 3) -> Dict[str, Any]:
        if self.otu_table is None:
            raise ValueError("OTU table not loaded")
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(self.otu_table)
        
        cluster_assignments = pd.DataFrame({
            "sample": self.otu_table.index,
            "cluster": clusters
        })
        
        return {
            "cluster_assignments": cluster_assignments,
            "cluster_centers": kmeans.cluster_centers_,
            "inertia": kmeans.inertia_
        }

    def health_score(self) -> pd.Series:
        if self.otu_table is None:
            raise ValueError("OTU table not loaded")
        
        beneficial_taxa = ["Bifidobacterium", "Lactobacillus", "Faecalibacterium", "Akkermansia", "Roseburia"]
        pathogenic_taxa = ["Escherichia", "Enterococcus", "Staphylococcus", "Clostridium"]
        
        def calculate_score(row):
            beneficial_score = 0
            pathogenic_score = 0
            
            for taxon in beneficial_taxa:
                for col in row.index:
                    if taxon.lower() in col.lower():
                        beneficial_score += row[col]
            
            for taxon in pathogenic_taxa:
                for col in row.index:
                    if taxon.lower() in col.lower():
                        pathogenic_score += row[col]
            
            total = beneficial_score + pathogenic_score
            if total == 0:
                return 0.5
            return beneficial_score / total
        
        return self.otu_table.apply(calculate_score, axis=1)

def analyze_microbiome_data(microbiome_data: List[Dict[str, Any]], user_id: str = None) -> Dict[str, Any]:
    if not microbiome_data:
        return {"error": "No microbiome data provided"}
    
    df = pd.DataFrame(microbiome_data)
    
    if "sample_id" not in df.columns:
        df["sample_id"] = [f"sample_{i}" for i in range(len(df))]
    
    if "taxon_name" not in df.columns or "relative_abundance" not in df.columns:
        return {"error": "Missing required columns: taxon_name or relative_abundance"}
    
    otu_table = df.pivot(index="sample_id", columns="taxon_name", values="relative_abundance").fillna(0)
    
    analyzer = MicrobiomeAnalyzer()
    analyzer.load_data(otu_table)
    
    alpha_div = analyzer.calculate_alpha_diversity("shannon")
    beta_div = analyzer.calculate_beta_diversity("braycurtis")
    pcoa = analyzer.pcoa_analysis(beta_div)
    health_scores = analyzer.health_score()
    
    return {
        "alpha_diversity": {
            "shannon": alpha_div.to_dict()
        },
        "beta_diversity": {
            "method": "braycurtis",
            "matrix_shape": beta_div.shape
        },
        "pcoa": {
            "coordinates": pcoa["coordinates"].tolist(),
            "explained_variance": pcoa["explained_variance"].tolist(),
            "total_explained": float(pcoa["total_explained"]),
            "sample_names": pcoa["sample_names"]
        },
        "health_scores": health_scores.to_dict(),
        "summary": {
            "total_samples": len(otu_table),
            "total_taxa": len(otu_table.columns),
            "average_alpha_diversity": float(alpha_div.mean()),
            "average_health_score": float(health_scores.mean())
        }
    }