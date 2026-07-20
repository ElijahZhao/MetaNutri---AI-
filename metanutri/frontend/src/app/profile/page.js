'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { userAPI } from '@/lib/api';
import { User, Heart, Activity, Scale, Ruler, Calendar, Check } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    dietary_goals: [],
    dietary_restrictions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const goalOptions = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Improve Energy', 'Better Sleep'];
  const restrictionOptions = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Nut Free', 'Low Carb', 'Low Sugar'];
  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary (little exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (physical job)' },
  ];

  const toggleGoal = (goal) => {
    setProfile(prev => ({
      ...prev,
      dietary_goals: prev.dietary_goals.includes(goal)
        ? prev.dietary_goals.filter(g => g !== goal)
        : [...prev.dietary_goals, goal]
    }));
  };

  const toggleRestriction = (restriction) => {
    setProfile(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const calculateBMI = () => {
    if (profile.height_cm && profile.weight_kg) {
      return (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1);
    }
    return '--';
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return 'N/A';
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-emerald-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-amber-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  const bmiCategory = getBMICategory();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            <p className="text-slate-600">Manage your health information</p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Health Profile</h2>
                  <p className="text-emerald-100">Update your personal health information</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || '' })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" />
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Ruler className="w-4 h-4 inline mr-1" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height_cm}
                    onChange={(e) => setProfile({ ...profile, height_cm: parseFloat(e.target.value) || '' })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter height in cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Scale className="w-4 h-4 inline mr-1" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight_kg}
                    onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) || '' })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter weight in kg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-1" />
                    Activity Level
                  </label>
                  <select
                    value={profile.activity_level}
                    onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select activity level</option>
                    {activityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Dietary Goals</h3>
                <div className="flex flex-wrap gap-3">
                  {goalOptions.map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        profile.dietary_goals.includes(goal)
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {profile.dietary_goals.includes(goal) && <Check className="w-4 h-4 inline mr-1" />}
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-3">
                  {restrictionOptions.map(restriction => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => toggleRestriction(restriction)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        profile.dietary_restrictions.includes(restriction)
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {profile.dietary_restrictions.includes(restriction) && <Check className="w-4 h-4 inline mr-1" />}
                      {restriction}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">BMI Calculation</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{calculateBMI()}</p>
                      <p className={`text-sm font-medium ${typeof bmiCategory === 'object' ? bmiCategory.color : 'text-slate-600'}`}>
                        {typeof bmiCategory === 'object' ? bmiCategory.text : bmiCategory}
                      </p>
                    </div>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500"
                        style={{ width: `${Math.min(parseFloat(calculateBMI()) * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  {saved ? <Check className="w-5 h-5" /> : null}
                  {saved ? 'Saved!' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}