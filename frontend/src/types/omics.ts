/**
 * Multi-omics domain types (genomic / microbiome / metabolomics).
 * Shapes mirror backend/app/schemas/genomic.py, schemas/microbiome.py and
 * backend/app/api/metabolomics.py.
 */

/* ----------------------------- Genomic ----------------------------- */

export interface GenomicEntry {
  id: string;
  user_id: string;
  gene_name: string;
  snp_id: string | null;
  genotype: string | null;
  effect_score: number | null;
  trait_description: string | null;
  created_at: string;
}

export type GenomicEntryInput = Omit<GenomicEntry, 'id' | 'user_id' | 'created_at'>;

export interface GenomicAnalysis {
  user_id: string;
  total_snps: number;
  key_genes: string[];
  nutrition_risks: Array<Record<string, unknown>>;
}

/* ---------------------------- Microbiome --------------------------- */

export interface MicrobiomeEntry {
  id: string;
  user_id: string;
  taxon_name: string;
  taxon_level: string | null;
  relative_abundance: number | null;
  health_score: number | null;
  sample_date: string | null;
  created_at: string;
}

export type MicrobiomeEntryInput = Omit<MicrobiomeEntry, 'id' | 'user_id' | 'created_at'>;

export interface MicrobiomeAnalysis {
  user_id: string;
  diversity_index: number;
  top_taxa: Array<Record<string, unknown>>;
  health_assessment: string;
  dietary_suggestions: string[];
}

/* --------------------------- Metabolomics -------------------------- */

export interface MetabolomicsEntry {
  id: string;
  metabolite_name: string;
  pathway_name: string | null;
  concentration: number;
  unit: string | null;
  z_score: number | null;
  significance: number | null;
  sample_date: string | null;
  created_at: string;
}

export type MetabolomicsEntryInput = Omit<MetabolomicsEntry, 'id' | 'created_at'>;

/** `POST /api/metabolomics/analysis`. */
export interface MetabolomicsAnalysis {
  total_metabolites: number;
  pathways: Array<{
    name: string;
    metabolite_count: number;
    enrichment_score: number;
    p_value: number;
  }>;
  summary: {
    upregulated: number;
    downregulated: number;
    normal: number;
  };
  insights: string[];
}
