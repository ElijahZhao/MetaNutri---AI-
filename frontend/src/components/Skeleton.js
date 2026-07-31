"use client";

const pulse = "animate-pulse";

export function SkeletonLine({ className = "" }) {
  return (
    <div className={`h-4 bg-slate-200 rounded ${pulse} ${className}`} />
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${pulse} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-3/4" />
    </div>
  );
}

export function SkeletonChart({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${pulse} ${className}`}>
      <div className="h-5 bg-slate-200 rounded w-1/3 mb-6" />
      <div className="flex items-end justify-between gap-2 h-40">
        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${pulse} ${className}`}>
      <div className="p-4 border-b border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-1/4" />
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-1/5" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${pulse} ${className}`}>
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-5 bg-white/40 rounded w-32" />
            <div className="h-3 bg-white/30 rounded w-48" />
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-5 bg-slate-200 rounded w-32" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-200 rounded-full w-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard({ className = "" }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
}
