"use client";

export default function RecommendedPlan({ plan }: { plan: any }) {
  if (!plan) return null;

  const actions: any[] = plan.plan || [];
  const currentRunway = plan.current_runway;
  const newRunway = plan.new_runway;
  const burnBefore = plan.monthly_burn_before;
  const burnAfter = plan.monthly_burn_after;
  const note = plan.note;

  return (
    <div className="futuristic-card p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-xl">💡</span> Optimization Plan
      </h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 uppercase">Current</p>
          <p className="stat-value text-lg text-slate-300">
            {currentRunway ?? "∞"}<span className="text-xs font-normal"> mo</span>
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 uppercase">New</p>
          <p className="stat-value text-lg text-cyan-400">
            {newRunway ?? "∞"}<span className="text-xs font-normal"> mo</span>
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 uppercase">Burn Before</p>
          <p className="stat-value text-lg text-rose-400">
            ${burnBefore?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 uppercase">Burn After</p>
          <p className="stat-value text-lg text-emerald-400">
            ${burnAfter?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action items */}
      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-3 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-200">{a.action}</span>
              </div>
              <span className="text-sm font-mono text-emerald-400">
                -${a.monthly_savings_est?.toLocaleString()}/mo
              </span>
            </div>
          ))}
        </div>
      )}

      {note && (
        <p className="mt-4 text-xs text-slate-500 italic">{note}</p>
      )}
    </div>
  );
}
