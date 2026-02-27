import RunwayCard from "./RunwayCard";
import ExpenseChart from "./ExpenseChart";
import RunwayForecast from "./RunwayForecast";

export default function Dashboard({ data }: { data: any }) {
  const burn = Number(data.burn) || 0;
  const cash = Number(data.cash) || 0;

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RunwayCard runway={data.runway} />

        <div className="futuristic-card p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash on Hand</p>
          <p className="stat-value text-3xl text-emerald-400">
            ${cash.toLocaleString()}
          </p>
        </div>

        <div className="futuristic-card p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Burn</p>
          <p className="stat-value text-3xl text-rose-400">
            ${burn.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart data={data.expenses} />
        <RunwayForecast cash={cash} burn={burn} />
      </div>
    </div>
  );
}