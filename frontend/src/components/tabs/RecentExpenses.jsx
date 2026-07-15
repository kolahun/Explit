import { Clock, Receipt } from "lucide-react";
import ExpenseCard from "../ExpenseCard";

export default function RecentExpenses({ expenses, group, onOpenExpense, onUpdate, onDelete, onViewAll }) {
  const recent = [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="panel recent-expenses-empty">
        <div className="recent-expenses-empty-inner">
          <Receipt size={36} />
          <p>No expenses yet. Add one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel recent-expenses">
      <div className="recent-expenses-header">
        <h2><Clock size={18} /> Recent Activity</h2>
      </div>
      <div className="stack compact">
        {recent.map((expense) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            group={group}
            onOpen={onOpenExpense}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
      {expenses.length > 5 && (
        <button className="view-all-btn" onClick={onViewAll} type="button">
          View all {expenses.length} expenses →
        </button>
      )}
    </div>
  );
}
