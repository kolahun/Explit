import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EXPENSE_CATEGORIES } from "../utils/expenseForm";

const categoryPalette = {
  Food: "#fbbf24",
  Travel: "#38bdf8",
  Rent: "#f472b6",
  Entertainment: "#a78bfa",
  Miscellaneous: "#34d399"
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

export default function SpendingByCategoryChart({ expenses }) {
  const totalsByCategory = expenses.reduce((map, expense) => {
    const category = expense.category || "Miscellaneous";
    map.set(category, (map.get(category) || 0) + expense.amount);
    return map;
  }, new Map());

  const chartData = EXPENSE_CATEGORIES
    .map((category) => ({
      name: category,
      value: Number((totalsByCategory.get(category) || 0).toFixed(2))
    }))
    .filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <section className="panel">
        <div className="mb-4">
          <h2>Spending by category</h2>
          <p className="text-sm">Add a few categorized expenses to unlock the visual breakdown.</p>
        </div>
        <div className="chart-empty-state text-sm">
          No categorized spending yet.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2>Spending by category</h2>
          <p className="text-sm">A snapshot of where this group is spending cash.</p>
        </div>
        <div className="chart-total-pill">
          {moneyFormatter.format(chartData.reduce((sum, item) => sum + item.value, 0))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_280px] lg:items-center">
        <div className="chart-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={3}
                stroke="#0a0a0a"
                strokeWidth={3}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={categoryPalette[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--modal-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "16px",
                  color: "var(--text-primary)"
                }}
                formatter={(value) => moneyFormatter.format(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3">
          {chartData.map((entry) => (
            <div key={entry.name} className="chart-legend-card">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: categoryPalette[entry.name] }} />
                <div>
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-xs text-neutral-500">Tracked spend</div>
                </div>
              </div>
              <div className="text-sm font-semibold">{moneyFormatter.format(entry.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
