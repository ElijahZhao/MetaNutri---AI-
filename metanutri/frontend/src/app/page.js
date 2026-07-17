import Link from 'next/link';
import { Activity, Dna, Microscope, Brain, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Activity className="w-6 h-6" />
            MetaNutri
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              AI-Powered Precision
              <span className="text-emerald-600"> Nutrition</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Build your metabolic digital twin by integrating genomic, microbiome, and metabolomic data.
              Get personalized nutrition recommendations powered by deep learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Dna className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Multi-Omics Integration</h3>
                <p className="text-slate-600">
                  Combine genomic, microbiome, and metabolic data for a holistic view of your nutrition needs.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Deep Learning Models</h3>
                <p className="text-slate-600">
                  Predict metabolic responses to foods using state-of-the-art neural networks and attention mechanisms.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Microscope className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Precision Recommendations</h3>
                <p className="text-slate-600">
                  Receive tailored dietary suggestions backed by scientific evidence and your unique biology.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
