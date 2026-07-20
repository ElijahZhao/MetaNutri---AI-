"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'metanutri-language';

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
};

const translations = {
  en: {
    title: 'Build Your Metabolic Digital Twin',
    subtitle: 'Integrate genomic, microbiome, and metabolomic data to unlock personalized nutrition insights. Powered by deep learning for accurate metabolic response predictions.',
    tagline: 'AI Precision Nutrition',
    tagline2: 'Metabolic Digital Twin',
    tagline3: 'Multi-Omics Integration',
    cta1: 'Start Your Journey',
    cta2: 'View Dashboard',
    whyTitle: 'Why MetaNutri',
    whySubtitle: 'Cutting-edge technology meets personalized nutrition for optimal health outcomes',
    feature1Title: 'Multi-Omics Integration',
    feature1Desc: 'Combine genomic, microbiome, and metabolic data for a holistic view of your nutrition needs.',
    feature2Title: 'Deep Learning Models',
    feature2Desc: 'Predict metabolic responses to foods using state-of-the-art neural networks and attention mechanisms.',
    feature3Title: 'Precision Recommendations',
    feature3Desc: 'Receive tailored dietary suggestions backed by scientific evidence and your unique biology.',
    feature4Title: 'Privacy & Security',
    feature4Desc: 'Your health data is encrypted and stored securely. Complete control over your personal information.',
    feature5Title: 'Real-Time Analysis',
    feature5Desc: 'Get instant insights from your data with optimized AI models and cached results.',
    feature6Title: 'Continuous Learning',
    feature6Desc: 'The AI models continuously improve with new data, adapting to your evolving health needs.',
    ctaSectionTitle: 'Ready to Transform Your Nutrition?',
    ctaSectionSubtitle: 'Join thousands of users who are using AI to optimize their health through personalized nutrition',
    ctaFree: 'Get Started Free',
    ctaExplore: 'Explore Datasets',
    getStarted: 'Get Started',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    welcomeBack: 'Welcome back',
    createAccount: 'Create account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    nutritionDashboard: 'Nutrition Dashboard',
    personalizedOverview: 'Your personalized metabolic overview',
    healthScore: 'Health Score',
    riskProfile: 'Risk Profile',
    bodyMetrics: 'Body Metrics',
    recentRecommendations: 'Recent Recommendations',
    age: 'Age',
    height: 'Height',
    weight: 'Weight',
    bmi: 'BMI',
    activity: 'Activity',
    completeProfile: 'Complete your profile to see metrics.',
    noRecommendations: 'No recommendations yet. Generate a meal plan to get started.',
    genomicData: 'Genomic Data',
    microbiome: 'Microbiome',
    metabolomics: 'Metabolomics',
    diversityIndex: 'Diversity Index',
    activePathways: 'Active Pathways',
    addData: 'Add data to see analysis',
    userProfile: 'User Profile',
    manageHealthInfo: 'Manage your health information',
    healthProfile: 'Health Profile',
    updateHealthInfo: 'Update your personal health information',
    activityLevel: 'Activity Level',
    dietaryGoals: 'Dietary Goals',
    dietaryRestrictions: 'Dietary Restrictions',
    saveProfile: 'Save Profile',
    reset: 'Reset',
    saved: 'Saved!',
    bmiCalculation: 'BMI Calculation',
    underweight: 'Underweight',
    normal: 'Normal',
    overweight: 'Overweight',
    obese: 'Obese',
    selectGender: 'Select gender',
    selectActivity: 'Select activity level',
    canvas: 'Canvas',
    canvasMode: 'Canvas Mode',
    switchToChinese: 'Switch to Chinese',
    switchToEnglish: 'Switch to English',
  },
  zh: {
    title: '构建您的代谢数字孪生',
    subtitle: '整合基因组、微生物组和代谢组数据，解锁个性化营养洞察。基于深度学习实现精准的代谢反应预测。',
    tagline: 'AI 精准营养',
    tagline2: '代谢数字孪生',
    tagline3: '多组学整合',
    cta1: '开始您的旅程',
    cta2: '查看仪表盘',
    whyTitle: '为什么选择 MetaNutri',
    whySubtitle: '前沿技术与个性化营养的完美结合，助力最佳健康成果',
    feature1Title: '多组学整合',
    feature1Desc: '结合基因组、微生物组和代谢数据，全面了解您的营养需求。',
    feature2Title: '深度学习模型',
    feature2Desc: '使用最先进的神经网络和注意力机制预测食物的代谢反应。',
    feature3Title: '精准推荐',
    feature3Desc: '获得基于科学证据和您独特生物学特征的个性化膳食建议。',
    feature4Title: '隐私与安全',
    feature4Desc: '您的健康数据经过加密并安全存储。完全掌控您的个人信息。',
    feature5Title: '实时分析',
    feature5Desc: '通过优化的 AI 模型和缓存结果，即时获取数据洞察。',
    feature6Title: '持续学习',
    feature6Desc: 'AI 模型通过新数据不断改进，适应您不断变化的健康需求。',
    ctaSectionTitle: '准备好改变您的营养方式了吗？',
    ctaSectionSubtitle: '加入数千名用户的行列，使用 AI 通过个性化营养优化健康',
    ctaFree: '免费开始',
    ctaExplore: '探索数据集',
    getStarted: '开始使用',
    login: '登录',
    logout: '退出登录',
    dashboard: '仪表盘',
    welcomeBack: '欢迎回来',
    createAccount: '创建账户',
    username: '用户名',
    email: '邮箱',
    password: '密码',
    signIn: '登录',
    signUp: '注册',
    dontHaveAccount: '还没有账户？',
    alreadyHaveAccount: '已有账户？',
    nutritionDashboard: '营养仪表盘',
    personalizedOverview: '您的个性化代谢概览',
    healthScore: '健康评分',
    riskProfile: '风险评估',
    bodyMetrics: '身体指标',
    recentRecommendations: '近期推荐',
    age: '年龄',
    height: '身高',
    weight: '体重',
    bmi: 'BMI',
    activity: '活动量',
    completeProfile: '完成个人资料以查看指标。',
    noRecommendations: '暂无推荐。生成膳食计划开始使用。',
    genomicData: '基因组数据',
    microbiome: '微生物组',
    metabolomics: '代谢组',
    diversityIndex: '多样性指数',
    activePathways: '活性通路',
    addData: '添加数据以查看分析',
    userProfile: '用户资料',
    manageHealthInfo: '管理您的健康信息',
    healthProfile: '健康档案',
    updateHealthInfo: '更新您的个人健康信息',
    activityLevel: '活动水平',
    dietaryGoals: '膳食目标',
    dietaryRestrictions: '饮食限制',
    saveProfile: '保存资料',
    reset: '重置',
    saved: '已保存！',
    bmiCalculation: 'BMI 计算',
    underweight: '偏瘦',
    normal: '正常',
    overweight: '超重',
    obese: '肥胖',
    selectGender: '选择性别',
    selectActivity: '选择活动水平',
    canvas: '画布',
    canvasMode: '画布模式',
    switchToChinese: '切换到中文',
    switchToEnglish: '切换到英文',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
