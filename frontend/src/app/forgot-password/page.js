'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Activity, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().email(t.validation.email),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      toast.success(t.resetLinkSent);
      setSent(true);
    } catch (err) {
      toast.error(err.userMessage || t.resetLinkFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-2xl mb-2">
            <Activity className="w-7 h-7" />
            MetaNutri
          </Link>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t.backToLogin}
          </Link>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{t.resetLinkSent}</h2>
              <p className="text-slate-600 text-sm">
                {t.forgotPasswordSubtitle}
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{t.forgotPasswordTitle}</h2>
              <p className="text-slate-600 text-sm mb-6">{t.forgotPasswordSubtitle}</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder={t.enterEmail || 'Enter your email'}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.sendResetLink}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
