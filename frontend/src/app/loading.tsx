import { Activity } from 'lucide-react';

/** 根级兜底 loading：仅做品牌化的居中提示，避免在营销页闪现「仪表盘」骨架。 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <Activity className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" aria-hidden="true" />
        <p className="text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
