import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

export default function ExpenseCard({ expense, group, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [payer, setPayer] = useState(expense.payer._id);
  const [splitBetween, setSplitBetween] = useState(expense.splitBetween.map((member) => member._id));
  const [error, setError] = useState("");

  function toggleMember(memberId) {
    setSplitBetween((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]
    );
  }

  function cancelEdit() {
    setAmount(expense.amount.toString());
    setPayer(expense.payer._id);
    setSplitBetween(expense.splitBetween.map((member) => member._id));
    setError("");
    setEditing(false);
  }

  async function saveEdit(event) {
    event.preventDefault();
    setError("");
    try {
      await onUpdate(expense._id, { amount: Number(amount), payer, splitBetween });
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
          <input min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Payer
          <select value={payer} onChange={(e) => setPayer(e.target.value)} required>
            {group.members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Split equally</legend>
          <div className="checkbox-grid">
            {group.members.map((member) => (
              <label key={member._id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={splitBetween.includes(member._id)}
                  onChange={() => toggleMember(member._id)}
                />
                {member.name}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="error">{error}</p>}
        <div className="toolbar compact expense-actions">
          <button type="submit" disabled={splitBetween.length === 0} title="Save expense">
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
      <div>
        <strong>{expense.payer.name}</strong>
        <p>Split between {expense.splitBetween.map((member) => member.name).join(", ")}</p>
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
