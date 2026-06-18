import ExpenseCard from "./ExpenseCard";

export default function ExpenseList({ expenses, group, onDelete, onOpenExpense, onUpdate }) {
  if (expenses.length === 0) return <p className="empty">No expenses yet.</p>;

  return (
    <div className="stack scrollable-list">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense._id}
          expense={expense}
          group={group}
          onDelete={onDelete}
          onOpen={onOpenExpense}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
