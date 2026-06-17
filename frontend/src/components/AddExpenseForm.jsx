import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SplitOptions from "./SplitOptions";
import { buildExpensePayload, createDefaultExpenseDraft, EXPENSE_CATEGORIES, syncDraftMembers } from "../utils/expenseForm";

export default function AddExpenseForm({ group, onAdd }) {
  const [draft, setDraft] = useState(() => createDefaultExpenseDraft(group));
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft((current) => syncDraftMembers(current, group.members));
  }, [group.members]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await onAdd(buildExpensePayload(draft));
      setDraft(createDefaultExpenseDraft(group));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="panel grid gap-4" onSubmit={handleSubmit}>
      <h2>Add expense</h2>
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
      <button type="submit" disabled={draft.splitBetween.length === 0}>
        <Plus size={18} />
        Add expense
      </button>
    </form>
  );
}
