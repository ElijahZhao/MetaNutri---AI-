'use client';
import Link from 'next/link';
import { Activity, Dna, Microscope, Brain, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import TypeWriter from '../components/TypeWriter';
import ScrollReveal from '../components/ScrollReveal';
import FloatingElements from '../components/FloatingElements';
import SpotlightTitle from '../components/SpotlightTitle';

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
            className="group px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8 shadow-sm">
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
                <SpotlightTitle 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"
                  color="rgba(34, 211, 238, 0.7)"
                  intensity={0.6}
                  speed={4}
                  delay={1500}
                >
                  Metabolic Digital Twin
                </SpotlightTitle>
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
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-all hover:shadow-lg relative overflow-hidden"
                >
                  <span className="relative z-10">View Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/50 to-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Dna className="w-7 h-7 text-emerald-600 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">Multi-Omics Integration</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Combine genomic, microbiome, and metabolic data for a holistic view of your nutrition needs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-200">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-7 h-7 text-blue-600 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">Deep Learning Models</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Predict metabolic responses to foods using state-of-the-art neural networks and attention mechanisms.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-300">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/50 to-amber-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Microscope className="w-7 h-7 text-amber-600 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">Precision Recommendations</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Receive tailored dietary suggestions backed by scientific evidence and your unique biology.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-400">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-7 h-7 text-purple-600 group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">Privacy & Security</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Your health data is encrypted and stored securely. Complete control over your personal information.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-500">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 via-cyan-50/50 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-7 h-7 text-cyan-600 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors">Real-Time Analysis</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Get instant insights from your data with optimized AI models and cached results.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:delay-600">
                <div className="group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 via-pink-50/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Activity className="w-7 h-7 text-pink-600 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-shadow duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-pink-700 transition-colors">Continuous Learning</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      The AI models continuously improve with new data, adapting to your evolving health needs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
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
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-600 bg-white rounded-xl hover:bg-emerald-50 transition-all hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
                <Link
                  href="/datasets"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 border border-white/30 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm overflow-hidden"
                >
                  <span className="relative z-10">Explore Datasets</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
