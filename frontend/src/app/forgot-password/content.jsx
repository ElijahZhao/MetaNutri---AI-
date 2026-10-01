'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Activity, Loader2, ArrowLeft, Mail, CheckCircle2, KeyRound, Copy } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetting, setResetting] = useState(false);

  const emailSchema = z.object({
    email: z.string().email(t.validation.email),
  });

  const passwordSchema = z.object({
    newPassword: z.string().min(8, t.validation.passwordShort || 'At least 8 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t.validation.passwordMismatch || 'Passwords do not match',
    path: ['confirmPassword'],
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmitEmail = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(data.email);
      setResetToken(res.data?.reset_token || '');
      toast.success(t.resetLinkSent);
      setSent(true);
    } catch (err) {
      toast.error(err.userMessage || t.resetLinkFailed);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    if (!resetToken) {
      toast.error(t.resetLinkFailed);
      return;
    }
    setResetting(true);
    try {
      await authAPI.resetPassword(resetToken, data.newPassword);
      toast.success(t.passwordChanged);
      setTimeout(() => router.push('/login'), 800);
    } catch (err) {
      toast.error(err.userMessage || t.resetLinkFailed);
    } finally {
      setResetting(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(resetToken);
      toast.success(t.resetTokenCopied || 'Reset token copied');
    } catch {
      toast.error(t.resetTokenCopyFailed || 'Failed to copy token');
    }
  };

  const pwdErrors = passwordForm.formState.errors;

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
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{t.resetLinkSent}</h2>
                <p className="text-slate-600 text-sm">{t.forgotPasswordSubtitle}</p>
              </div>

              {resetToken && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      {t.resetTokenLabel || 'Your reset token'}
                    </span>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <code className="block text-xs text-slate-700 break-all bg-white border border-slate-200 rounded-lg p-3">
                    {resetToken}
                  </code>
                  <p className="mt-2 text-xs text-slate-400">{t.resetTokenHint || 'Use this token below to set a new password.'}</p>
                </div>
              )}

              {resetToken && (
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.newPassword}</label>
                    <input
                      type="password"
                      {...passwordForm.register('newPassword')}
                      placeholder={t.enterNewPassword}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        pwdErrors.newPassword ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {pwdErrors.newPassword && <p className="mt-1 text-xs text-red-500">{pwdErrors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.confirmPassword}</label>
                    <input
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      placeholder={t.enterConfirmPassword}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        pwdErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {pwdErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{pwdErrors.confirmPassword.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="w-full py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                  >
                    {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {t.resetPassword || 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{t.forgotPasswordTitle}</h2>
              <p className="text-slate-600 text-sm mb-6">{t.forgotPasswordSubtitle}</p>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    {...emailForm.register('email')}
                    placeholder={t.enterEmail || 'Enter your email'}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      emailForm.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {emailForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{emailForm.formState.errors.email.message}</p>}
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