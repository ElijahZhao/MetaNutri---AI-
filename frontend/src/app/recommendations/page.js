'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { recommendationAPI, foodAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'react-hot-toast';
import { Utensils, Search, Star, Loader2, Sparkles } from 'lucide-react';

function RecommendationsContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [recs, setRecs] = useState([]);
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [foodScore, setFoodScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchRecs();
  }, [router, isAuthenticated]);

  const fetchRecs = async () => {
    try { 
      const res = await recommendationAPI.getPersonalized(); 
      setRecs(res.data); 
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Failed to load recommendations');
    }
  };

  const searchFoods = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try { 
      const res = await foodAPI.search(query); 
      setFoods(res.data.results); 
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Search failed');
    } finally { setLoading(false); }
  };

  const scoreFood = async (foodId, foodName) => {
    try {
      const res = await recommendationAPI.foodScore({ user_id: 'me', food_id: foodId });
      setFoodScore(res.data);
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Failed to score food');
    }
  };

  const generateMeal = async () => {
    setGenerating(true);
    try { 
      await recommendationAPI.mealPlan({}); 
      fetchRecs(); 
      toast.success('Meal plan generated successfully!');
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Failed to generate meal plan');
    } finally { setGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600" />
            Recommendations
          </h1>
          <p className="text-slate-600">Search foods, score them, and generate meal plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Food Search
            </h2>
            <form onSubmit={searchFoods} className="flex gap-2 mb-4">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search foods..." className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {foods.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{f.food_name}</p>
                    <p className="text-xs text-slate-500">{f.calories_kcal} kcal | P:{f.protein_g} F:{f.fat_g} C:{f.carbs_g}</p>
                  </div>
                  <button onClick={() => scoreFood(f.id, f.food_name)} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors">
                    Score
                  </button>
                </div>
              ))}
            </div>
            {foodScore && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">{foodScore.food_name}</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{foodScore.score}</p>
                <p className="text-sm text-emerald-700">{foodScore.explanation}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Meal Plans
              </h2>
              <button onClick={generateMeal} disabled={generating} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-60">
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                Generate
              </button>
            </div>
            {recs.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recs.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-slate-800 capitalize">{rec.recommendation_type?.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-500">{rec.confidence_score ? `${(rec.confidence_score * 100).toFixed(0)}%` : ''}</span>
                    </div>
                    {rec.food_items && rec.food_items.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {rec.food_items.map((item, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700">{item.name}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-600">{rec.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-12 text-center">No meal plans yet. Generate one to get started.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <ErrorBoundary>
      <RecommendationsContent />
    </ErrorBoundary>
  );
}
