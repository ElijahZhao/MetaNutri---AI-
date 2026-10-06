'use client';
import { useState } from 'react';
import { recommendationAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Utensils, Check, RefreshCw, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { toast } from 'react-hot-toast';
import type { ApiErrorLike, Recommendation } from '@/types';

interface PlanItem {
  name: string;
  calories: number;
  protein: number;
  category?: string;
}

export default function MealPlanPage() {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // The backend returns a single plan with a flat `food_items` list; render it
  // as-is instead of inventing per-meal grouping it never sends.
  const items: PlanItem[] = (plan?.food_items ?? []).map((it) => ({
    name: it.name,
    calories: Number(it.calories ?? 0) || 0,
    protein: Number(it.protein ?? 0) || 0,
    category: typeof it.category === 'string' ? it.category : undefined,
  }));

  const totalCalories = items.reduce((sum, it) => sum + it.calories, 0);
  const totalProtein = items.reduce((sum, it) => sum + it.protein, 0);

  const targets = plan?.nutrient_targets ?? {};
  const calorieTarget = Number(targets.calories ?? 0) || 0;
  const proteinTarget = Number(targets.target_protein_g ?? 0) || 0;

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const res = await recommendationAPI.mealPlan({});
      setPlan(res.data);
      setSelected([]);
    } catch (err) {
      toast.error((err as ApiErrorLike).userMessage || t.mealPlan.generateFailed);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const percent = (value: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  const totals = [
    {
      label: t.mealPlan.calories,
      value: totalCalories,
      target: calorieTarget,
      unit: 'kcal',
      bar: 'bg-red-500',
    },
    {
      label: t.mealPlan.protein,
      value: totalProtein,
      target: proteinTarget,
      unit: 'g',
      bar: 'bg-blue-500',
    },
  ];

  return (
    <>
      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.mealPlan.title}</h1>
              <p className="text-slate-600">{t.mealPlan.subtitle}</p>
            </div>
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {loading ? t.mealPlan.generating : t.mealPlan.generate}
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{t.mealPlan.recommendedFoods}</h2>
                      <p className="text-sm text-indigo-100">
                        {items.length > 0
                          ? `${items.length} ${t.mealPlan.itemsSelected}`
                          : t.mealPlan.planHint}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {items.map((food, i) => {
                        const key = `${food.name}-${i}`;
                        const isSelected = selected.includes(key);
                        return (
                          <div
                            key={key}
                            onClick={() => toggleItem(key)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{food.name}</h3>
                                {food.category && (
                                  <p className="text-sm text-slate-500">{food.category}</p>
                                )}
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-100 rounded-lg p-2 text-center">
                                <p className="font-bold text-slate-700">
                                  {food.calories ? Math.round(food.calories) : '--'}
                                </p>
                                <p className="text-slate-500">kcal</p>
                              </div>
                              <div className="bg-slate-100 rounded-lg p-2 text-center">
                                <p className="font-bold text-slate-700">
                                  {food.protein ? Math.round(food.protein) : '--'}
                                </p>
                                <p className="text-slate-500">g</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Utensils className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>{t.mealPlan.emptyHint}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">{t.mealPlan.todaysTotals}</h3>
                {plan ? (
                  <div className="space-y-4">
                    {totals.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">{item.label}</span>
                          <span className="font-semibold text-slate-900">
                            {Math.round(item.value)}
                            {item.target > 0 ? ` / ${Math.round(item.target)}` : ''} {item.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.bar}`}
                            style={{ width: `${percent(item.value, item.target)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{t.mealPlan.totalsEmpty}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.mealPlan.mealSummary}</h3>
                    <p className="text-sm text-emerald-100">{t.mealPlan.summarySubtitle}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>{t.mealPlan.selectedItems}</span>
                    <span className="font-bold">
                      {selected.length}/{items.length}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>{t.mealPlan.totalCalories}</span>
                    <span className="font-bold">{Math.round(totalCalories)} kcal</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{t.mealPlan.totalProtein}</span>
                    <span className="font-bold">{Math.round(totalProtein)} g</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </>
  );
}
