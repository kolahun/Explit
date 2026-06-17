import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import SplitOptions from "./SplitOptions";
import { buildExpensePayload, createDefaultExpenseDraft, EXPENSE_CATEGORIES, syncDraftMembers } from "../utils/expenseForm";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

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

  function updatePaidByEntry(memberId, value) {
    setDraft((current) => ({
      ...current,
      paidByEntries: current.paidByEntries.map((entry) =>
        entry.userId === memberId ? { ...entry, amount: value } : entry
      )
    }));
  }

  const paidByTotal = (draft.paidByEntries || []).reduce((sum, entry) => {
    const amt = Number(entry.amount);
    return sum + (Number.isFinite(amt) ? amt : 0);
  }, 0);

  const expenseTotal = Number(draft.amount) || 0;

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

      {/* Multi-payer toggle */}
      <div className="multi-payer-toggle">
        <label className="toggle-row">
          <span className="toggle-label">
            <Users size={16} />
            Multiple payers
          </span>
          <input
            type="checkbox"
            checked={draft.isMultiPayer}
            onChange={(e) => setDraft((current) => ({ ...current, isMultiPayer: e.target.checked }))}
          />
        </label>
      </div>

      {draft.isMultiPayer ? (
        <div className="paid-by-panel">
          <div className="paid-by-header">
            <div>
              <h3>Who paid?</h3>
              <p className="text-xs">Enter how much each person paid. Must total {expenseTotal > 0 ? moneyFormatter.format(expenseTotal) : "the expense amount"}.</p>
            </div>
            {expenseTotal > 0 && (
              <span className={`paid-by-total ${Math.abs(paidByTotal - expenseTotal) < 0.01 ? "matched" : "mismatched"}`}>
                {moneyFormatter.format(paidByTotal)} / {moneyFormatter.format(expenseTotal)}
              </span>
            )}
          </div>
          <div className="grid gap-3">
            {group.members.map((member) => {
              const entry = (draft.paidByEntries || []).find((e) => e.userId === member._id);
              return (
                <div key={member._id} className="allocation-row">
                  <div className="member-info">
                    <span className="name">{member.name}</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 text-sm font-semibold">₹</span>
                    <input
                      className="px-3 pl-6 w-[120px] rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent"
                      min="0"
                      step="0.01"
                      type="number"
                      value={entry?.amount ?? ""}
                      onChange={(e) => updatePaidByEntry(member._id, e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
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
      )}

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
