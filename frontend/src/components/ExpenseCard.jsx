import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import SplitOptions from "./SplitOptions";
import { buildExpensePayload, createExpenseDraftFromExpense, EXPENSE_CATEGORIES } from "../utils/expenseForm";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

export default function ExpenseCard({ expense, group, onDelete, onOpen, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => createExpenseDraftFromExpense(expense, group));
  const [error, setError] = useState("");

  function cancelEdit() {
    setDraft(createExpenseDraftFromExpense(expense, group));
    setError("");
    setEditing(false);
  }

  async function saveEdit(event) {
    event.preventDefault();
    setError("");
    try {
      await onUpdate(expense._id, buildExpensePayload(draft));
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (editing) {
    return (
      <form className="expense-card expense-editor" onSubmit={saveEdit}>
        <label>
          Amount
          <input
            min="0.01"
            step="0.01"
            type="number"
            value={draft.amount}
            onChange={(e) => setDraft((current) => ({ ...current, amount: e.target.value }))}
            required
          />
        </label>
        <label>
          Payer
          <select value={draft.payer} onChange={(e) => setDraft((current) => ({ ...current, payer: e.target.value }))} required>
            {group.members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={draft.category} onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <SplitOptions members={group.members} draft={draft} setDraft={setDraft} />
        {error && <p className="error">{error}</p>}
        <div className="flex gap-2 justify-end mt-4">
          <button type="submit" disabled={draft.splitBetween.length === 0} title="Save expense">
            <Check size={16} />
            Save
          </button>
          <button className="icon-button" type="button" title="Cancel edit" onClick={cancelEdit}>
            <X size={16} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="expense-card">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {Array.isArray(expense.paidBy) && expense.paidBy.length > 0 ? (
            <strong>
              {expense.paidBy.map((entry) => `${entry.user?.name || "Unknown"} (${moneyFormatter.format(entry.amount)})`).join(", ")}
            </strong>
          ) : (
            <strong>{expense.payer.name}</strong>
          )}
          <span className="category-badge">
            {expense.category}
          </span>
          <span className="split-method-badge">
            {expense.splitMethod}
          </span>
        </div>
        <p className="text-sm">Split between {expense.splitBetween.map((member) => member.name).join(", ")}</p>
        <button
          className="view-details-btn"
          type="button"
          onClick={() => onOpen(expense)}
        >
          View details &amp; comments
        </button>
      </div>
      <div className="expense-summary">
        <div className="amount">{moneyFormatter.format(expense.amount)}</div>
        <div className="expense-actions">
          <button className="icon-button" type="button" title="Edit expense" onClick={() => setEditing(true)}>
            <Pencil size={16} />
          </button>
          <button className="icon-button danger" type="button" title="Delete expense" onClick={() => onDelete(expense._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
