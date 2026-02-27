export default function RunwayCard({ runway }: any) {
  return (
    <div className="p-6 border rounded shadow">

      <h2 className="text-xl font-bold">
        Runway
      </h2>

      <p className="text-4xl mt-2 text-green-600">
        {runway} months
      </p>

    </div>
  );
}