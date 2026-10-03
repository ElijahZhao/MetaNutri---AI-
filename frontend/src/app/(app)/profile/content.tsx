'use client';
import { useState, useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorBoundary from '@/components/ErrorBoundary';
import { userAPI } from '@/lib/api';
import { useProfile, useUpdateProfile } from '@/lib/hooks';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { User, Heart, Activity, Scale, Ruler, Calendar, Check, Loader2, Key } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { buildProfileOptions, BMI_THRESHOLDS } from '@/constants';
import type { ApiErrorLike, UserProfile, UserProfileUpdate } from '@/types';

/**
 * The API stores dietary flags as `{ <key>: true }` (see the `dietary_goals` /
 * `dietary_restrictions` JSONB columns), while the form works with the list of
 * selected keys. These two helpers convert between the two representations.
 */
const selectedKeys = (flags?: Record<string, boolean> | null): string[] =>
  Object.keys(flags ?? {}).filter((key) => flags?.[key]);

const flagsFromKeys = (keys: string[]): Record<string, boolean> =>
  Object.fromEntries(keys.map((key) => [key, true]));

const buildProfileForm = (
  profile?: UserProfile | null
): {
  age: number | '';
  gender: string;
  height_cm: number | '';
  weight_kg: number | '';
  activity_level: string;
  dietary_goals: string[];
  dietary_restrictions: string[];
} => ({
  age: profile?.age || '',
  gender: profile?.gender || '',
  height_cm: profile?.height_cm || '',
  weight_kg: profile?.weight_kg || '',
  activity_level: profile?.activity_level || '',
  dietary_goals: selectedKeys(profile?.dietary_goals),
  dietary_restrictions: selectedKeys(profile?.dietary_restrictions),
});

function ProfileContent() {
  const { t } = useLanguage();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const schema = z.object({
    age: z.coerce
      .number()
      .min(1, t.validation.age)
      .max(120, t.validation.age)
      .optional()
      .or(z.literal('')),
    gender: z.string().optional(),
    height_cm: z.coerce
      .number()
      .min(50, t.validation.height)
      .max(250, t.validation.height)
      .optional()
      .or(z.literal('')),
    weight_kg: z.coerce
      .number()
      .min(20, t.validation.weight)
      .max(300, t.validation.weight)
      .optional()
      .or(z.literal('')),
    activity_level: z.string().optional(),
    dietary_goals: z.array(z.string()).default([]),
    dietary_restrictions: z.array(z.string()).default([]),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
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
    if (profileQuery.data) {
      reset(buildProfileForm(profileQuery.data));
    }
  }, [profileQuery.data, reset]);

  useEffect(() => {
    if (profileQuery.error) {
      console.error(profileQuery.error);
      toast.error((profileQuery.error as ApiErrorLike).userMessage || t.loadFailed);
    }
  }, [profileQuery.error]);

  const onSubmit = async (data: FormValues) => {
    try {
      // The API expects `dietary_goals` / `dietary_restrictions` as objects
      // (`{ key: true }`), not arrays — sending the raw arrays made every save
      // fail validation with a 422.
      const submitData: UserProfileUpdate = {
        dietary_goals: flagsFromKeys(data.dietary_goals),
        dietary_restrictions: flagsFromKeys(data.dietary_restrictions),
      };
      if (data.gender) submitData.gender = data.gender;
      if (data.activity_level) submitData.activity_level = data.activity_level;
      if (data.age !== '') submitData.age = Number(data.age);
      if (data.height_cm !== '') submitData.height_cm = Number(data.height_cm);
      if (data.weight_kg !== '') submitData.weight_kg = Number(data.weight_kg);

      await updateProfile.mutateAsync(submitData);
      toast.success(t.saveSuccess);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error((err as ApiErrorLike).userMessage || t.saveFailed);
    }
  };

  const {
    gender: genderOptions,
    activity: activityOptions,
    goals: goalOptions,
    restrictions: restrictionOptions,
  } = useMemo(() => buildProfileOptions(t), [t]);

  const toggleArrayItem = (field: 'dietary_goals' | 'dietary_restrictions', value: string) => {
    const current = formValues[field] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next, { shouldDirty: true });
  };

  const calculateBMI = useMemo(() => {
    const h = parseFloat(String(formValues.height_cm));
    const w = parseFloat(String(formValues.weight_kg));
    if (h && w) {
      return (w / (h / 100) ** 2).toFixed(1);
    }
    return '--';
  }, [formValues.height_cm, formValues.weight_kg]);

  const getBMICategory = useMemo(() => {
    const bmi = parseFloat(calculateBMI);
    if (isNaN(bmi)) return { text: 'N/A', color: 'text-slate-600' };
    if (bmi < BMI_THRESHOLDS.underweight) return { text: t.underweight, color: 'text-blue-600' };
    if (bmi < BMI_THRESHOLDS.normal) return { text: t.normal, color: 'text-emerald-600' };
    if (bmi < BMI_THRESHOLDS.overweight) return { text: t.overweight, color: 'text-amber-600' };
    return { text: t.obese, color: 'text-red-600' };
  }, [calculateBMI, t]);

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'
    }`;

  if (profileQuery.isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Activity className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-500">{t.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {t.age}
                  </label>
                  <input
                    id="age"
                    type="number"
                    {...register('age')}
                    aria-invalid={!!errors.age}
                    aria-describedby={errors.age ? 'age-error' : undefined}
                    className={inputClass(!!errors.age)}
                    placeholder={t.enterAge}
                  />
                  {errors.age && (
                    <p id="age-error" className="mt-1 text-xs text-red-500">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {t.genderLabel}
                  </label>
                  <select
                    id="gender"
                    {...register('gender')}
                    aria-invalid={!!errors.gender}
                    className={inputClass(!!errors.gender)}
                  >
                    <option value="">{t.selectGender}</option>
                    {genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="height_cm"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    <Ruler className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {t.height} (cm)
                  </label>
                  <input
                    id="height_cm"
                    type="number"
                    {...register('height_cm')}
                    aria-invalid={!!errors.height_cm}
                    aria-describedby={errors.height_cm ? 'height-error' : undefined}
                    className={inputClass(!!errors.height_cm)}
                    placeholder={t.enterHeight}
                  />
                  {errors.height_cm && (
                    <p id="height-error" className="mt-1 text-xs text-red-500">
                      {errors.height_cm.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="weight_kg"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    <Scale className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {t.weight} (kg)
                  </label>
                  <input
                    id="weight_kg"
                    type="number"
                    {...register('weight_kg')}
                    aria-invalid={!!errors.weight_kg}
                    aria-describedby={errors.weight_kg ? 'weight-error' : undefined}
                    className={inputClass(!!errors.weight_kg)}
                    placeholder={t.enterWeight}
                  />
                  {errors.weight_kg && (
                    <p id="weight-error" className="mt-1 text-xs text-red-500">
                      {errors.weight_kg.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="activity_level"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    <Activity className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    {t.activityLevel}
                  </label>
                  <select
                    id="activity_level"
                    {...register('activity_level')}
                    aria-invalid={!!errors.activity_level}
                    className={inputClass(!!errors.activity_level)}
                  >
                    <option value="">{t.selectActivity}</option>
                    {activityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
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
                      {(formValues.dietary_goals || []).includes(goal.value) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t.dietaryRestrictions}
                </h3>
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
                      {(formValues.dietary_restrictions || []).includes(restriction.value) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
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
                  onClick={() => reset(buildProfileForm(profileQuery.data))}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  {t.reset}
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-6">
          <ChangePasswordCard />
        </ScrollReveal>
      </main>
    </>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}

function ChangePasswordCard() {
  const { t } = useLanguage();

  const passwordSchema = z
    .object({
      oldPassword: z.string().min(8, t.validation.password),
      newPassword: z.string().min(8, t.validation.password),
      confirmPassword: z.string().min(8, t.validation.password),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t.passwordMismatch,
      path: ['confirmPassword'],
    });

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema) as Resolver<PasswordFormValues>,
    mode: 'onBlur',
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async (data: PasswordFormValues) => {
    try {
      await userAPI.changePassword(data.oldPassword, data.newPassword);
      toast.success(t.passwordChanged);
      resetPwd();
    } catch (err) {
      toast.error((err as ApiErrorLike).userMessage || t.passwordChangeFailed);
    }
  };

  const pwdInputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'
    }`;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t.changePassword}</h2>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmitPwd(onChangePassword)} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.oldPassword}</label>
          <input
            type="password"
            {...registerPwd('oldPassword')}
            placeholder={t.enterOldPassword}
            className={pwdInputClass(!!pwdErrors.oldPassword)}
          />
          {pwdErrors.oldPassword && (
            <p className="mt-1 text-xs text-red-500">{pwdErrors.oldPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.newPassword}</label>
          <input
            type="password"
            {...registerPwd('newPassword')}
            placeholder={t.enterNewPassword}
            className={pwdInputClass(!!pwdErrors.newPassword)}
          />
          {pwdErrors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{pwdErrors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t.confirmPassword}
          </label>
          <input
            type="password"
            {...registerPwd('confirmPassword')}
            placeholder={t.enterConfirmPassword}
            className={pwdInputClass(!!pwdErrors.confirmPassword)}
          />
          {pwdErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{pwdErrors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pwdSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pwdSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.changePassword}
        </button>
      </form>
    </div>
  );
}
