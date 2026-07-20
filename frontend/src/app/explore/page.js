'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { foodAPI, recommendationAPI } from '@/lib/api';
import { Search, Compass, Star, Filter, ChevronDown, Leaf, Flame, Droplets, Wheat, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function ExplorePage() {
  const router = useRouter();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodScore, setFoodScore] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minProtein: '',
    maxCalories: '',
    highFiber: false,
    lowGI: false,
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchFoods();
  }, [router]);

  const fetchFoods = async () => {
    try {
      const res = await foodAPI.search('');
      const allFoods = res.data.results || [];
      setFoods(allFoods);
      const cats = [...new Set(allFoods.map(f => f.category).filter(Boolean))];
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await foodAPI.search(query);
      setFoods(res.data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scoreFood = async (food) => {
    try {
      const res = await recommendationAPI.foodScore({ user_id: 'me', food_id: food.id });
      setFoodScore(res.data);
      setSelectedFood(food);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredFoods = foods.filter((food) => {
    if (selectedCategory !== 'all' && food.category !== selectedCategory) return false;
    if (filters.minProtein && (food.protein_g || 0) < parseFloat(filters.minProtein)) return false;
    if (filters.maxCalories && (food.calories_kcal || 0) > parseFloat(filters.maxCalories)) return false;
    if (filters.highFiber && (food.fiber_g || 0) < 5) return false;
    if (filters.lowGI && (food.glycemic_index || 100) > 55) return false;
    return true;
  });

  const nutritionRadarOption = selectedFood ? {
    radar: {
      indicator: [
        { name: 'Protein', max: 30 },
        { name: 'Fiber', max: 15 },
        { name: 'Low Sugar', max: 100 },
        { name: 'Low Fat', max: 100 },
        { name: 'Vitamins', max: 100 },
        { name: 'Minerals', max: 100 },
      ],
      radius: '65%',
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          Math.min((selectedFood.protein_g || 0) / 30 * 100, 100),
          Math.min((selectedFood.fiber_g || 0) / 15 * 100, 100),
          Math.max(0, 100 - (selectedFood.carbs_g || 0)),
          Math.max(0, 100 - (selectedFood.fat_g || 0)),
          selectedFood.vitamins ? 70 : 30,
          selectedFood.minerals ? 70 : 30,
        ],
        name: selectedFood.food_name,
        areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
        lineStyle: { color: '#10b981' },
        itemStyle: { color: '#10b981' },
      }],
    }],
  } : null;

  const getCategoryColor = (category) => {
    const colors = {
      'Fruits': 'bg-red-100 text-red-700',
      'Vegetables': 'bg-green-100 text-green-700',
      'Meat': 'bg-amber-100 text-amber-700',
      'Seafood': 'bg-blue-100 text-blue-700',
      'Dairy': 'bg-purple-100 text-purple-700',
      'Grains': 'bg-yellow-100 text-yellow-700',
      'Legumes': 'bg-emerald-100 text-emerald-700',
      'Nuts': 'bg-orange-100 text-orange-700',
      'Beverages': 'bg-cyan-100 text-cyan-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Food Explorer
          </h1>
          <p className="text-slate-600">Discover and evaluate foods for your personalized nutrition plan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <form onSubmit={searchFoods} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search foods..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Search
                </button>
              </form>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Min Protein (g)</label>
                    <input
                      type="number"
                      value={filters.minProtein}
                      onChange={(e) => setFilters({ ...filters, minProtein: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Max Calories</label>
                    <input
                      type="number"
                      value={filters.maxCalories}
                      onChange={(e) => setFilters({ ...filters, maxCalories: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="highFiber"
                      checked={filters.highFiber}
                      onChange={(e) => setFilters({ ...filters, highFiber: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="highFiber" className="text-sm text-slate-700">High Fiber (&gt;5g)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lowGI"
                      checked={filters.lowGI}
                      onChange={(e) => setFilters({ ...filters, lowGI: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="lowGI" className="text-sm text-slate-700">Low GI (&lt;55)</label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => scoreFood(food)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedFood?.id === food.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{food.food_name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getCategoryColor(food.category)}`}>
                          {food.category || 'Unknown'}
                        </span>
                      </div>
                      {foodScore?.food_id === food.id && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-amber-600">{foodScore.score}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {food.calories_kcal || 0} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <Wheat className="w-3 h-3" />
                        P:{food.protein_g || 0}g
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        F:{food.fat_g || 0}g
                      </span>
                      <span className="flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        C:{food.carbs_g || 0}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedFood && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Nutrition Profile</h2>
                <ReactECharts option={nutritionRadarOption} style={{ height: 280 }} />
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Calories</span>
                    <span className="font-medium">{selectedFood.calories_kcal} kcal/100g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Protein</span>
                    <span className="font-medium">{selectedFood.protein_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fat</span>
                    <span className="font-medium">{selectedFood.fat_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Carbs</span>
                    <span className="font-medium">{selectedFood.carbs_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fiber</span>
                    <span className="font-medium">{selectedFood.fiber_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Glycemic Index</span>
                    <span className="font-medium">{selectedFood.glycemic_index || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {foodScore && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Personalized Score
                </h2>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-emerald-600">{foodScore.score}</p>
                  <p className="text-sm text-slate-500">/100</p>
                </div>
                <p className="text-sm text-slate-600">{foodScore.explanation}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Nutrition Tips
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>• High fiber foods (&gt;5g) support gut health</p>
                <p>• Low GI foods (&lt;55) help maintain stable blood sugar</p>
                <p>• Protein-rich foods support muscle maintenance</p>
                <p>• Balanced macros are key for metabolic health</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
