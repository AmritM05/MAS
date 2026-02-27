export default function RunwayCard({ runway }: any) {
  return (
    <div className="p-6 futuristic-card">

      <h2 className="text-lg font-semibold text-slate-200">Runway</h2>

      <p className="text-3xl mt-2 text-green-400 font-bold">{runway} months</p>

    </div>
  );
}