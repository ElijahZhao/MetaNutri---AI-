'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { Activity, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();
  const { t, language } = useLanguage();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.username || !form.password) {
      toast.error(language === 'en' ? 'Please fill all required fields' : '请填写所有必填项');
      setLoading(false);
      return;
    }

    if (!isLogin && !form.email) {
      toast.error(language === 'en' ? 'Email is required' : '请输入邮箱');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(form.username, form.password);
      } else {
        result = await register(form.username, form.email, form.password);
      }

      if (result.success) {
        toast.success(language === 'en' ? 'Login successful!' : '登录成功！');
        router.push('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(err.userMessage || (language === 'en' ? 'Something went wrong' : '发生错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-2xl mb-2">
            <Activity className="w-7 h-7" />
            MetaNutri
          </div>
          <p className="text-slate-600">{language === 'en' ? 'AI Precision Nutrition Platform' : 'AI 精准营养平台'}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {isLogin ? t.welcomeBack : t.createAccount}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.username}</label>
              <input
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder={language === 'en' ? 'Enter your username' : '输入用户名'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.email}</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder={language === 'en' ? 'Enter your email' : '输入邮箱'}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.password}</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder={language === 'en' ? 'Enter your password' : '输入密码'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? t.signIn : t.signUp}
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-slate-600">
            {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
            <button
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
