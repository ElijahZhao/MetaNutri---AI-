'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { Activity, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();
  const { t } = useLanguage();

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

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
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
      toast.error(err.userMessage || t.error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-300'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-2xl mb-2">
            <Activity className="w-7 h-7" />
            MetaNutri
          </div>
          <p className="text-slate-600">{t.aiPrecision || 'AI Precision Nutrition Platform'}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {isLogin ? t.welcomeBack : t.createAccount}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.username}</label>
              <input
                type="text"
                {...registerField('username')}
                placeholder={t.enterUsername || 'Enter your username'}
                className={inputClass(!!errors.username)}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.email}</label>
                <input
                  type="email"
                  {...registerField('email')}
                  placeholder={t.enterEmail || 'Enter your email'}
                  className={inputClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.password}</label>
              <input
                type="password"
                {...registerField('password')}
                placeholder={t.enterPassword || 'Enter your password'}
                className={inputClass(!!errors.password)}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? t.signIn : t.signUp}
            </button>
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
      </div>
    </div>
  );
}
