const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function GroupStats({ group, expenses, settlementData }) {
  const totalMembers = group?.members?.length || 0;
  const totalExpenses = expenses.length;
  const totalSettlements = settlementData?.history?.length || 0;

  const avgExpense =
    totalExpenses > 0
      ? expenses.reduce((sum, e) => sum + e.amount, 0) / totalExpenses
      : 0;

  const largestExpense =
    totalExpenses > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  const stats = [
    { label: "Members", value: totalMembers },
    { label: "Expenses", value: totalExpenses },
    { label: "Settlements", value: totalSettlements },
    { label: "Avg Expense", value: moneyFormatter.format(avgExpense) },
    { label: "Largest Expense", value: moneyFormatter.format(largestExpense) },
  ];

  return (
    <div className="group-stats-bar">
      {stats.map((stat, i) => (
        <div className="group-stat" key={stat.label}>
          <div className="group-stat-value">{stat.value}</div>
          <div className="group-stat-label">{stat.label}</div>
          {i < stats.length - 1 && <div className="group-stat-divider" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}
