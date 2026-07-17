'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { microbiomeAPI } from '@/lib/api';
import { Microscope, Upload, Leaf, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function MicrobiomePage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ taxon_name: '', taxon_level: 'genus', relative_abundance: '', health_score: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try { const res = await microbiomeAPI.getUserData(); setData(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setUploading(true);
    try {
      await microbiomeAPI.upload([{
        taxon_name: form.taxon_name,
        taxon_level: form.taxon_level,
        relative_abundance: parseFloat(form.relative_abundance),
        health_score: form.health_score ? parseFloat(form.health_score) : undefined,
      }]);
      setForm({ taxon_name: '', taxon_level: 'genus', relative_abundance: '', health_score: '' });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try { const res = await microbiomeAPI.analyze(); setAnalysis(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pieOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: data.slice(0, 10).map(d => ({ value: parseFloat((d.relative_abundance * 100).toFixed(2)), name: d.taxon_name })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-emerald-600" />
            Microbiome Analysis
          </h1>
          <p className="text-slate-600">Track and optimize your gut microbiome composition</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Add Taxon Entry
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Taxon Name</label>
                  <input required value={form.taxon_name} onChange={(e) => setForm({ ...form, taxon_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <select value={form.taxon_level} onChange={(e) => setForm({ ...form, taxon_level: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>kingdom</option><option>phylum</option><option>class</option><option>order</option><option>family</option><option>genus</option><option>species</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relative Abundance</label>
                  <input type="number" step="0.0001" required value={form.relative_abundance} onChange={(e) => setForm({ ...form, relative_abundance: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Health Score</label>
                  <input type="number" step="0.001" value={form.health_score} onChange={(e) => setForm({ ...form, health_score: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-2.5 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />} Add Entry
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Composition</h2>
              <button onClick={handleAnalyze} className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors">Analyze</button>
            </div>
            {data.length > 0 ? (
              <ReactECharts option={pieOption} style={{ height: 280 }} />
            ) : (
              <p className="text-sm text-slate-500 py-12 text-center">No microbiome data yet.</p>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Shannon Diversity</p>
                <p className="text-2xl font-bold text-slate-900">{analysis.diversity_index}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Health Assessment</p>
                <p className={`text-lg font-bold ${analysis.health_assessment === 'Healthy' ? 'text-emerald-600' : analysis.health_assessment === 'Moderate' ? 'text-amber-600' : 'text-red-600'}`}>{analysis.health_assessment}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Top Taxa</p>
                <p className="text-sm font-medium text-slate-900">{analysis.top_taxa.map(t => t.name).slice(0, 3).join(', ')}</p>
              </div>
            </div>
            {analysis.dietary_suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600" />Dietary Suggestions</h3>
                {analysis.dietary_suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {s}
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
