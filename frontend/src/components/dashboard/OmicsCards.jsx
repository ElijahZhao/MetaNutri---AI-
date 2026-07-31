"use client";
import { Dna, Microscope, Apple } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function GenomicCard({ genomicData }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Dna className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-slate-900">{t.genomicData}</h3>
      </div>
      <div className="space-y-2">
        {genomicData.length > 0 ? (
          genomicData.slice(0, 3).map((d) => (
            <div key={d.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
              <span className="font-medium text-slate-700">{d.gene_name}</span>
              <span className="text-slate-500 text-xs">{d.snp_id || 'N/A'}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">{t.addData || 'Add data to see analysis'}</p>
        )}
      </div>
    </div>
  );
}

export function MicrobiomeCard() {
  const { t } = useLanguage();
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Microscope className="w-5 h-5 text-cyan-600" />
        <h3 className="font-semibold text-slate-900">{t.microbiome}</h3>
      </div>
      <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
        <p className="text-sm text-slate-600">{t.diversityIndex}</p>
        <p className="text-2xl font-bold text-slate-900">--</p>
        <p className="text-xs text-slate-500 mt-1">{t.addData || 'Add microbiome data to see analysis'}</p>
      </div>
    </div>
  );
}

export function MetabolomicsCard() {
  const { t } = useLanguage();
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Apple className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-slate-900">{t.metabolomics}</h3>
      </div>
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
        <p className="text-sm text-slate-600">{t.activePathways}</p>
        <p className="text-2xl font-bold text-slate-900">--</p>
        <p className="text-xs text-slate-500 mt-1">{t.addData || 'Add metabolomics data to see analysis'}</p>
      </div>
    </div>
  );
}
