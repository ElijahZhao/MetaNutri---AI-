'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { Activity, Loader2 } from 'lucide-react';
import type { ApiErrorLike, AuthResult } from '@/types';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  // True only once a submit has been pending long enough to look like a cold
  // start rather than normal latency, so we do not flash the hint on every login.
  const [slowLoading, setSlowLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setSlowLoading(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  const loginSchema = z.object({
    username: z.string().min(3, t.validation.username).max(20, t.validation.username),
    password: z.string().min(8, t.validation.password),
  });

  const registerSchema = z.object({
    username: z.string().min(3, t.validation.username).max(20, t.validation.username),
    email: z.string().email(t.validation.email),
    password: z.string().min(8, t.validation.password),
  });

  const schema = isLogin ? loginSchema : registerSchema;

  type FormValues = { username: string; email: string; password: string };

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    mode: 'onBlur',
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      let result: AuthResult;
      if (isLogin) {
        result = await login(data.username, data.password);
      } else {
        result = await register(data.username, data.email, data.password);
      }

      if (result.success) {
        toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error((err as ApiErrorLike).userMessage || t.error);
    } finally {
      setLoading(false);
      setSlowLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-300'
    }`;

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-2xl mb-2">
          <Activity className="w-7 h-7" aria-hidden="true" />
          MetaNutri
        </div>
        <p className="text-slate-600">AI Precision Nutrition Platform</p>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {isLogin ? t.welcomeBack : t.createAccount}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.username}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...registerField('username')}
              placeholder="Enter your username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className={inputClass(!!errors.username)}
            />
            {errors.username && (
              <p id="username-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...registerField('email')}
                placeholder="Enter your email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              {...registerField('password')}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClass(!!errors.password)}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          {isLogin && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                {t.forgotPassword}
              </Link>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isLogin ? t.signIn : t.signUp}
          </button>
          {slowLoading && (
            <p role="status" aria-live="polite" className="mt-3 text-center text-xs text-slate-500">
              {t.serverWaking}
            </p>
          )}
        </form>
        <div className="mt-5 text-center text-sm text-slate-600">
          {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors ml-1"
          >
            {isLogin ? t.signUp : t.signIn}
          </button>
        </div>
      </div>
    </>
  );
}
