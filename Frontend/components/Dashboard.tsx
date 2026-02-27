import RunwayCard from "./RunwayCard";
import ExpenseChart from "./ExpenseChart";
import RunwayForecast from "./RunwayForecast";

export default function Dashboard({ data }: any) {

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">

      <RunwayCard runway={data.runway} />

      <ExpenseChart data={data.expenses} />

      <RunwayForecast
        cash={data.cash}
        burn={data.burn}
      />

    </div>
  );
}