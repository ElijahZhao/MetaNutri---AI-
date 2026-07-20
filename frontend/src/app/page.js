import Link from 'next/link';
import { Activity, Dna, Microscope, Brain, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import TypeWriter from '../components/TypeWriter';
import ScrollReveal from '../components/ScrollReveal';
import FloatingElements from '../components/FloatingElements';

export default function Home() {
  return (
    <div className="min-h-screen">
      <FloatingElements />
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Activity className="w-6 h-6" />
            MetaNutri
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50" />
          <div className="max-w-4xl mx-auto relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <TypeWriter 
                  texts={['AI Precision Nutrition', 'Metabolic Digital Twin', 'Multi-Omics Integration']}
                  speed={80}
                  delay={2500}
                />
              </div>
            </ScrollReveal>
            
            <ScrollReveal className="mt-8">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Build Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500">
                  Metabolic Digital Twin
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal className="mt-8">
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Integrate genomic, microbiome, and metabolomic data to unlock personalized nutrition insights.
                Powered by deep learning for accurate metabolic response predictions.
              </p>
            </ScrollReveal>

            <ScrollReveal className="mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-lg"
                >
                  View Dashboard
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Why MetaNutri
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Cutting-edge technology meets personalized nutrition for optimal health outcomes
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ScrollReveal className="md:delay-100">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Dna className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Omics Integration</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Combine genomic, microbiome, and metabolic data for a holistic view of your nutrition needs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-200">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Brain className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Deep Learning Models</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Predict metabolic responses to foods using state-of-the-art neural networks and attention mechanisms.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-300">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Microscope className="w-7 h-7 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Precision Recommendations</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Receive tailored dietary suggestions backed by scientific evidence and your unique biology.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-400">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Privacy & Security</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Your health data is encrypted and stored securely. Complete control over your personal information.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-500">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 text-cyan-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-Time Analysis</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Get instant insights from your data with optimized AI models and cached results.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-600">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Activity className="w-7 h-7 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Continuous Learning</h3>
                    <p className="text-slate-600 leading-relaxed">
                      The AI models continuously improve with new data, adapting to your evolving health needs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Nutrition?
              </h2>
              <p className="text-emerald-100 text-lg mb-10">
                Join thousands of users who are using AI to optimize their health through personalized nutrition
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-600 bg-white rounded-xl hover:bg-emerald-50 transition-all hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/datasets"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 border border-white/30 rounded-xl hover:bg-white/20 transition-all"
                >
                  Explore Datasets
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
