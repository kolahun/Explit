import ExpenseCard from "./ExpenseCard";

export default function ExpenseList({ expenses, group, onDelete, onUpdate }) {
  if (expenses.length === 0) return <p className="empty">No expenses yet.</p>;

  return (
    <div className="stack">
      {expenses.map((expense) => (
        <ExpenseCard key={expense._id} expense={expense} group={group} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
