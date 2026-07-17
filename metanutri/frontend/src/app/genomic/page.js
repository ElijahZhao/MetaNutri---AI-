'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { genomicAPI } from '@/lib/api';
import { Dna, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function GenomicPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ gene_name: '', snp_id: '', genotype: '', effect_score: '', trait_description: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await genomicAPI.getUserData();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = [{
        gene_name: form.gene_name,
        snp_id: form.snp_id || undefined,
        genotype: form.genotype || undefined,
        effect_score: form.effect_score ? parseFloat(form.effect_score) : undefined,
        trait_description: form.trait_description || undefined,
      }];
      await genomicAPI.upload(payload);
      setForm({ gene_name: '', snp_id: '', genotype: '', effect_score: '', trait_description: '' });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await genomicAPI.analyze();
      setAnalysis(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Dna className="w-6 h-6 text-emerald-600" />
            Genomic Data
          </h1>
          <p className="text-slate-600">Manage and analyze your nutrition-related genetic variants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Add Genomic Entry
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gene Name</label>
                  <input required value={form.gene_name} onChange={(e) => setForm({ ...form, gene_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SNP ID</label>
                  <input value={form.snp_id} onChange={(e) => setForm({ ...form, snp_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Genotype</label>
                  <input value={form.genotype} onChange={(e) => setForm({ ...form, genotype: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Effect Score</label>
                  <input type="number" step="0.001" value={form.effect_score} onChange={(e) => setForm({ ...form, effect_score: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trait Description</label>
                <textarea value={form.trait_description} onChange={(e) => setForm({ ...form, trait_description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} />
              </div>
              <button type="submit" disabled={uploading} className="w-full py-2.5 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Entry
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Your Variants ({data.length})</h2>
              <button onClick={handleAnalyze} className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors">
                Run Analysis
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
            ) : data.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-slate-800">{d.gene_name}</span>
                      <span className="text-xs text-slate-500">{d.snp_id}</span>
                    </div>
                    <div className="text-slate-600 mt-1">Genotype: {d.genotype || 'N/A'} | Score: {d.effect_score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No genomic data yet. Add your first entry above.</p>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total SNPs</p>
                <p className="text-2xl font-bold text-slate-900">{analysis.total_snps}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Key Genes</p>
                <p className="text-lg font-medium text-slate-900">{analysis.key_genes.join(', ')}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Nutrition Risks</p>
                <p className="text-2xl font-bold text-red-600">{analysis.nutrition_risks.length}</p>
              </div>
            </div>
            {analysis.nutrition_risks.length > 0 && (
              <div className="mt-4 space-y-2">
                {analysis.nutrition_risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{r.gene} ({r.snp})</span>: {r.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
