export default function RunwayCard({ runway }: { runway: number | null }) {
  const val = runway != null ? runway : "∞";
  const color = runway != null && runway < 6 ? "text-rose-400" : "text-cyan-400";

  return (
    <div className="futuristic-card p-5 pulse-card">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Runway</p>
      <p className={`stat-value text-3xl ${color}`}>
        {val} <span className="text-base font-normal text-slate-500">months</span>
      </p>
    </div>
  );
}