/**
 * Dataset browsing types.
 * Shapes mirror the payloads built in backend/app/api/datasets.py.
 */

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  url: string;
  count: number;
  status: string;
}

/** `GET /api/datasets` — the endpoint wraps the list in an envelope. */
export interface DatasetList {
  datasets: Dataset[];
  total: number;
}

export interface TianchiDataset {
  id: string;
  name: string;
  category: string;
  size: string;
  description: string;
  url: string;
}

export interface DatasetStats {
  database: {
    food_database: { total_foods: number; categories: string[] };
    microbiome: { user_taxa_count: number; reference_taxa_count: number };
    metabolomics: {
      user_metabolites_count: number;
      reference_metabolites_count: number;
      user_pathways_count: number;
    };
    gene_nutrition: { interactions_count: number };
  };
  files: Record<string, unknown>;
}

export interface TianchiDatasetList {
  message: string;
  bioinformatics_datasets: TianchiDataset[];
  next_steps: string[];
}
