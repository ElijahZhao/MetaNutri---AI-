'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { recommendationAPI, foodAPI } from '@/lib/api';
import { Utensils, Coffee, Sunrise, Sunset, Moon, Plus, Check, RefreshCw, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function MealPlanPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const res = await recommendationAPI.generateMealPlan({});
      setMealPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = (mealId) => {
    setSelectedMeals(prev => 
      prev.includes(mealId) ? prev.filter(id => id !== mealId) : [...prev, mealId]
    );
  };

  const nutrientChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Calories', 'Protein', 'Carbs', 'Fat'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Calories', type: 'bar', stack: 'total', itemStyle: { color: '#ef4444' }, data: [350, 550, 500, 200] },
      { name: 'Protein', type: 'bar', stack: 'total', itemStyle: { color: '#3b82f6' }, data: [20, 30, 25, 10] },
      { name: 'Carbs', type: 'bar', stack: 'total', itemStyle: { color: '#f59e0b' }, data: [50, 60, 55, 25] },
      { name: 'Fat', type: 'bar', stack: 'total', itemStyle: { color: '#10b981' }, data: [10, 15, 12, 5] },
    ],
  };

  const meals = [
    { id: 'breakfast', name: 'Breakfast', icon: Sunrise, time: '7:00 - 9:00 AM' },
    { id: 'lunch', name: 'Lunch', icon: Utensils, time: '12:00 - 2:00 PM' },
    { id: 'dinner', name: 'Dinner', icon: Sunset, time: '6:00 - 8:00 PM' },
    { id: 'snack', name: 'Snack', icon: Coffee, time: '3:00 - 4:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Meal Plan</h1>
              <p className="text-slate-600">Personalized dietary recommendations</p>
            </div>
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {meals.map((mealType, index) => (
                <div
                  key={mealType.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <mealType.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{mealType.name}</h2>
                        <p className="text-sm text-indigo-100">{mealType.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mealPlan && mealPlan[mealType.id] && mealPlan[mealType.id].map((food, i) => (
                        <div
                          key={food.id || i}
                          onClick={() => toggleMeal(`${mealType.id}-${i}`)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedMeals.includes(`${mealType.id}-${i}`)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{food.name}</h3>
                              <p className="text-sm text-slate-500">{food.portion}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedMeals.includes(`${mealType.id}-${i}`)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-300'
                            }`}>
                              {selectedMeals.includes(`${mealType.id}-${i}`) && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-slate-100 rounded-lg p-2 text-center">
                              <p className="font-bold text-slate-700">{food.calories || '--'}</p>
                              <p className="text-slate-500">kcal</p>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-2 text-center">
                              <p className="font-bold text-slate-700">{food.protein || '--'}</p>
                              <p className="text-slate-500">g protein</p>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-2 text-center">
                              <p className="font-bold text-slate-700">{food.carbs || '--'}</p>
                              <p className="text-slate-500">g carbs</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!mealPlan || !mealPlan[mealType.id]) && (
                        <div className="col-span-2 text-center py-8 text-slate-500">
                          <Utensils className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>Click "Generate Plan" to get personalized recommendations</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Daily Nutrient Targets</h3>
                <ReactECharts option={nutrientChartOption} style={{ height: 250 }} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Today's Totals</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Calories</span>
                      <span className="font-semibold text-slate-900">1,600 / 2,000 kcal</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Protein</span>
                      <span className="font-semibold text-slate-900">85 / 90g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Carbs</span>
                      <span className="font-semibold text-slate-900">190 / 250g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Fat</span>
                      <span className="font-semibold text-slate-900">42 / 65g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Meal Summary</h3>
                    <p className="text-sm text-emerald-100">Based on your profile</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span>Selected Meals</span><span className="font-bold">{selectedMeals.length}/8</span></p>
                  <p className="flex justify-between"><span>Estimated Calories</span><span className="font-bold">1,600 kcal</span></p>
                  <p className="flex justify-between"><span>Nutrition Score</span><span className="font-bold">8.5/10</span></p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}