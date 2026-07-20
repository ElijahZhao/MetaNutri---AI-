'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { metabolomicsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'react-hot-toast';
import { FlaskConical, Upload, TrendingUp, TrendingDown, Activity, Loader2, Trash2, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function MetabolomicsContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    metabolite_name: '',
    pathway_name: '',
    concentration: '',
    unit: 'μM',
    z_score: '',
    significance: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router, isAuthenticated]);

  const fetchData = async () => {
    try {
      const [dataRes, analysisRes] = await Promise.all([
        metabolomicsAPI.getUserData(),
        metabolomicsAPI.analyze(),
      ]);
      setData(dataRes.data || []);
      setAnalysis(analysisRes.data);
    } catch (e) {
      console.error(e);
      toast.error(e.userMessage || 'Failed to load metabolomics data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await metabolomicsAPI.upload([{
        metabolite_name: form.metabolite_name,
        pathway_name: form.pathway_name || undefined,
        concentration: parseFloat(form.concentration),
        unit: form.unit,
        z_score: form.z_score ? parseFloat(form.z_score) : undefined,
        significance: form.significance ? parseFloat(form.significance) : undefined,
      }]);
      toast.success('Metabolite entry added successfully!');
      setForm({
        metabolite_name: '',
        pathway_name: '',
        concentration: '',
        unit: 'μM',
        z_score: '',
        significance: '',
      });
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error(e.userMessage || 'Failed to add metabolite entry');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await metabolomicsAPI.delete(id);
      toast.success('Entry deleted successfully!');
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error(e.userMessage || 'Failed to delete entry');
    }
  };

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data.slice(0, 10).map(d => d.metabolite_name), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Z-Score' },
    series: [{
      data: data.slice(0, 10).map(d => d.z_score || 0),
      type: 'bar',
      itemStyle: {
        color: (params) => params.value > 1 ? '#ef4444' : params.value < -1 ? '#3b82f6' : '#10b981',
      },
    }],
  };

  const pathwayOption = analysis && analysis.pathways && analysis.pathways.length > 0 ? {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: analysis.pathways.map(p => ({ value: p.metabolite_count, name: p.name })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            Metabolomics Data
          </h1>
          <p className="text-slate-600">Track and analyze your metabolite profiles across key pathways</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Add Metabolite Entry
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Metabolite Name</label>
                  <input
                    required
                    value={form.metabolite_name}
                    onChange={(e) => setForm({ ...form, metabolite_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Glucose, Lactate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pathway</label>
                  <input
                    value={form.pathway_name}
                    onChange={(e) => setForm({ ...form, pathway_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Glycolysis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Concentration</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.concentration}
                    onChange={(e) => setForm({ ...form, concentration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>μM</option>
                    <option>mM</option>
                    <option>ng/mL</option>
                    <option>mg/dL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Z-Score</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.z_score}
                    onChange={(e) => setForm({ ...form, z_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Significance (p-value)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.significance}
                    onChange={(e) => setForm({ ...form, significance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Entry
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Z-Score Distribution
            </h2>
            {data.length > 0 ? (
              <ReactECharts option={barOption} style={{ height: 280 }} />
            ) : (
              <p className="text-sm text-slate-500 py-12 text-center">No metabolomics data yet.</p>
            )}
          </div>
        </div>

        {analysis && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total Metabolites</p>
                <p className="text-2xl font-bold text-slate-900">{analysis.total_metabolites}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-slate-500">Upregulated</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{analysis.summary?.upregulated || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-slate-500">Downregulated</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{analysis.summary?.downregulated || 0}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-slate-500">Normal</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{analysis.summary?.normal || 0}</p>
              </div>
            </div>

            {analysis.insights && analysis.insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700">Key Insights</h3>
                {analysis.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {analysis?.pathways?.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pathway Enrichment</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReactECharts option={pathwayOption} style={{ height: 280 }} />
              <div className="space-y-2">
                {analysis.pathways.slice(0, 5).map((pathway, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                    <span className="font-medium text-slate-700">{pathway.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{pathway.metabolite_count} metabolites</span>
                      <span className="text-xs text-emerald-600">p={pathway.p_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Metabolite Data ({data.length})</h2>
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Metabolite</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pathway</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Concentration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Z-Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.metabolite_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.pathway_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {item.concentration} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.z_score?.toFixed(2) || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {item.z_score > 1 ? (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Upregulated</span>
                        ) : item.z_score < -1 ? (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Downregulated</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No metabolomics data yet. Add your first entry above.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MetabolomicsPage() {
  return (
    <ErrorBoundary>
      <MetabolomicsContent />
    </ErrorBoundary>
  );
}