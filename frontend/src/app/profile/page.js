'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { User, Heart, Activity, Scale, Ruler, Calendar, Check, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

function ProfileContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const schema = z.object({
    age: z.coerce.number().min(1, t.validation.age).max(120, t.validation.age).optional().or(z.literal('')),
    gender: z.string().optional(),
    height_cm: z.coerce.number().min(50, t.validation.height).max(250, t.validation.height).optional().or(z.literal('')),
    weight_kg: z.coerce.number().min(20, t.validation.weight).max(300, t.validation.weight).optional().or(z.literal('')),
    activity_level: z.string().optional(),
    dietary_goals: z.array(z.string()).default([]),
    dietary_restrictions: z.array(z.string()).default([]),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      age: '',
      gender: '',
      height_cm: '',
      weight_kg: '',
      activity_level: '',
      dietary_goals: [],
      dietary_restrictions: [],
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [router, isAuthenticated]);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      if (res.data) {
        reset({
          age: res.data.age || '',
          gender: res.data.gender || '',
          height_cm: res.data.height_cm || '',
          weight_kg: res.data.weight_kg || '',
          activity_level: res.data.activity_level || '',
          dietary_goals: res.data.dietary_goals || [],
          dietary_restrictions: res.data.dietary_restrictions || [],
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.userMessage || t.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const submitData = { ...data };
      if (submitData.age === '') delete submitData.age;
      if (submitData.height_cm === '') delete submitData.height_cm;
      if (submitData.weight_kg === '') delete submitData.weight_kg;
      await userAPI.updateProfile(submitData);
      toast.success(t.saveSuccess);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.userMessage || t.saveFailed);
    }
  };

  const goalOptions = [
    { value: 'Weight Loss', label: t.goals.weightLoss },
    { value: 'Muscle Gain', label: t.goals.muscleGain },
    { value: 'Maintenance', label: t.goals.maintenance },
    { value: 'Improve Energy', label: t.goals.improveEnergy },
    { value: 'Better Sleep', label: t.goals.betterSleep },
  ];
  const restrictionOptions = [
    { value: 'Gluten Free', label: t.restrictions.glutenFree },
    { value: 'Dairy Free', label: t.restrictions.dairyFree },
    { value: 'Vegetarian', label: t.restrictions.vegetarian },
    { value: 'Vegan', label: t.restrictions.vegan },
    { value: 'Nut Free', label: t.restrictions.nutFree },
    { value: 'Low Carb', label: t.restrictions.lowCarb },
    { value: 'Low Sugar', label: t.restrictions.lowSugar },
  ];
  const activityOptions = [
    { value: 'sedentary', label: t.activity.sedentary },
    { value: 'light', label: t.activity.light },
    { value: 'moderate', label: t.activity.moderate },
    { value: 'active', label: t.activity.active },
    { value: 'very_active', label: t.activity.veryActive },
  ];

  const toggleArrayItem = (field, value) => {
    const current = formValues[field] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next, { shouldDirty: true });
  };

  const calculateBMI = useMemo(() => {
    const h = parseFloat(formValues.height_cm);
    const w = parseFloat(formValues.weight_kg);
    if (h && w) {
      return (w / ((h / 100) ** 2)).toFixed(1);
    }
    return '--';
  }, [formValues.height_cm, formValues.weight_kg]);

  const getBMICategory = useMemo(() => {
    const bmi = parseFloat(calculateBMI);
    if (isNaN(bmi)) return { text: 'N/A', color: 'text-slate-600' };
    if (bmi < 18.5) return { text: t.underweight, color: 'text-blue-600' };
    if (bmi < 25) return { text: t.normal, color: 'text-emerald-600' };
    if (bmi < 30) return { text: t.overweight, color: 'text-amber-600' };
    return { text: t.obese, color: 'text-red-600' };
  }, [calculateBMI, t]);

  const inputClass = (hasError) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'
    }`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Activity className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{t.userProfile}</h1>
            <p className="text-slate-600">{t.manageHealthInfo}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t.healthProfile}</h2>
                  <p className="text-emerald-100">{t.updateHealthInfo}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t.age}
                  </label>
                  <input
                    type="number"
                    {...register('age')}
                    className={inputClass(!!errors.age)}
                    placeholder={t.enterAge}
                  />
                  {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" />
                    {t.gender}
                  </label>
                  <select
                    {...register('gender')}
                    className={inputClass(!!errors.gender)}
                  >
                    <option value="">{t.selectGender}</option>
                    <option value="male">{t.gender.male}</option>
                    <option value="female">{t.gender.female}</option>
                    <option value="other">{t.gender.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Ruler className="w-4 h-4 inline mr-1" />
                    {t.height} (cm)
                  </label>
                  <input
                    type="number"
                    {...register('height_cm')}
                    className={inputClass(!!errors.height_cm)}
                    placeholder={t.enterHeight}
                  />
                  {errors.height_cm && <p className="mt-1 text-xs text-red-500">{errors.height_cm.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Scale className="w-4 h-4 inline mr-1" />
                    {t.weight} (kg)
                  </label>
                  <input
                    type="number"
                    {...register('weight_kg')}
                    className={inputClass(!!errors.weight_kg)}
                    placeholder={t.enterWeight}
                  />
                  {errors.weight_kg && <p className="mt-1 text-xs text-red-500">{errors.weight_kg.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-1" />
                    {t.activityLevel}
                  </label>
                  <select
                    {...register('activity_level')}
                    className={inputClass(!!errors.activity_level)}
                  >
                    <option value="">{t.selectActivity}</option>
                    {activityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.dietaryGoals}</h3>
                <div className="flex flex-wrap gap-3">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => toggleArrayItem('dietary_goals', goal.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        (formValues.dietary_goals || []).includes(goal.value)
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {(formValues.dietary_goals || []).includes(goal.value) && <Check className="w-4 h-4 inline mr-1" />}
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.dietaryRestrictions}</h3>
                <div className="flex flex-wrap gap-3">
                  {restrictionOptions.map((restriction) => (
                    <button
                      key={restriction.value}
                      type="button"
                      onClick={() => toggleArrayItem('dietary_restrictions', restriction.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        (formValues.dietary_restrictions || []).includes(restriction.value)
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {(formValues.dietary_restrictions || []).includes(restriction.value) && <Check className="w-4 h-4 inline mr-1" />}
                      {restriction.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">{t.bmiCalculation}</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{calculateBMI}</p>
                      <p className={`text-sm font-medium ${getBMICategory.color}`}>
                        {getBMICategory.text}
                      </p>
                    </div>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500"
                        style={{ width: `${Math.min(parseFloat(calculateBMI) * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saved ? <Check className="w-5 h-5" /> : null}
                  {saved ? t.saved : t.saveProfile}
                </button>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  {t.reset}
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
