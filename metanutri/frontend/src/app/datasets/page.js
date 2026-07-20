'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { datasetAPI } from '@/lib/api';
import {
  Database,
  Download,
  Upload,
  CheckCircle,
  Circle,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
  Package,
  FlaskConical,
  Leaf,
  Activity,
  BookOpen,
  FileJson,
  Globe,
} from 'lucide-react';

const categoryIcons = {
  nutrition: Leaf,
  metabolic: FlaskConical,
  microbiome: Activity,
  metabolomics: FlaskConical,
  genetics: BookOpen,
  clinical: Package,
};

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700',
  not_downloaded: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState(null);
  const [tianchiDatasets, setTianchiDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDataset, setLoadingDataset] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [datasetsRes, statsRes, tianchiRes] = await Promise.all([
        datasetAPI.list(),
        datasetAPI.stats(),
        datasetAPI.tianchiList(),
      ]);
      setDatasets(datasetsRes.data.datasets);
      setStats(statsRes.data);
      setTianchiDatasets(tianchiRes.data.bioinformatics_datasets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (datasetId) => {
    setLoadingDataset(datasetId);
    try {
      await datasetAPI.download(datasetId);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDataset(null);
    }
  };

  const handleImport = async (datasetId) => {
    setLoadingDataset(datasetId);
    try {
      await datasetAPI.import(datasetId);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDataset(null);
    }
  };

  const handleDownloadAll = async () => {
    setLoading(true);
    try {
      await datasetAPI.downloadAll();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter((ds) =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Dataset Management</h1>
          <p className="text-slate-600">Manage public and external datasets for MetaNutri</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Food Database</p>
                  <p className="text-xl font-bold text-slate-900">{stats.database.food_database.total_foods}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Microbiome Taxa</p>
                  <p className="text-xl font-bold text-slate-900">{stats.database.microbiome.user_taxa_count}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Metabolites</p>
                  <p className="text-xl font-bold text-slate-900">{stats.database.metabolomics.user_metabolites_count}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gene Interactions</p>
                  <p className="text-xl font-bold text-slate-900">{stats.database.gene_nutrition.interactions_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'local'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Local Datasets
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tianchi')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tianchi'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              TianChi Datasets
            </span>
          </button>
        </div>

        {activeTab === 'local' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                />
              </div>
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset) => {
                const Icon = categoryIcons[dataset.category] || Database;
                return (
                  <div
                    key={dataset.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          dataset.status === 'available' ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${dataset.status === 'available' ? 'text-emerald-600' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{dataset.name}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[dataset.status]}`}>
                            {dataset.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {dataset.url && (
                        <a
                          href={dataset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{dataset.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FileJson className="w-3 h-3" />
                        {dataset.count} records
                      </span>
                      <span>Source: {dataset.source}</span>
                    </div>
                    <div className="flex gap-2">
                      {dataset.status !== 'available' ? (
                        <button
                          onClick={() => handleDownload(dataset.id)}
                          disabled={loadingDataset === dataset.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {loadingDataset === dataset.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => handleImport(dataset.id)}
                          disabled={loadingDataset === dataset.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {loadingDataset === dataset.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Import
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'tianchi' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Alibaba Cloud TianChi Integration</h3>
                <p className="text-sm text-slate-600">Access public bioinformatics datasets from TianChi</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Access Requirements</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Full access to TianChi datasets requires an Alibaba Cloud account with AK/SK credentials.
                    Some datasets require student verification or competition registration.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-amber-700">
                    <li>1. Register on TianChi: https://tianchi.aliyun.com</li>
                    <li>2. Complete student verification (free access)</li>
                    <li>3. Apply for dataset access or join relevant competitions</li>
                    <li>4. Configure AK/SK credentials in MetaNutri settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-slate-900 mb-4">Available Bioinformatics Datasets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tianchiDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-slate-900">{dataset.name}</h5>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs mt-1">
                        {dataset.category}
                      </span>
                    </div>
                    <a
                      href={dataset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{dataset.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>Size: {dataset.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
