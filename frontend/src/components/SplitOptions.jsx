import { SPLIT_METHOD_OPTIONS } from "../utils/expenseForm";


export default function SplitOptions({ members, draft, setDraft }) {
  function setSplitMethod(nextMethod) {
    setDraft((current) => ({ ...current, splitMethod: nextMethod }));
  }

  function toggleMember(memberId) {
    setDraft((current) => ({
      ...current,
      splitBetween: current.splitBetween.includes(memberId)
        ? current.splitBetween.filter((id) => id !== memberId)
        : [...current.splitBetween, memberId]
    }));
  }

  function updateEntry(memberId, field, value) {
    setDraft((current) => ({
      ...current,
      splitEntries: current.splitEntries.map((entry) =>
        entry.userId === memberId ? { ...entry, [field]: value } : entry
      )
    }));
  }

  const activeEntries = draft.splitEntries.filter((entry) => draft.splitBetween.includes(entry.userId));

  return (
    <div className="grid gap-4">
      <div className="flex bg-neutral-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
        {SPLIT_METHOD_OPTIONS.map((option) => {
          const isActive = draft.splitMethod === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSplitMethod(option.value)}
              className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-2 rounded-lg transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-slate-700/50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="included-members-panel">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Included members</h3>
            <p className="text-xs text-neutral-500">Choose who shares this expense before entering allocations.</p>
          </div>
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            {draft.splitBetween.length} selected
          </span>
        </div>

        <div className="member-checkbox-grid">
          {members.map((member) => {
            const checked = draft.splitBetween.includes(member._id);

            return (
              <label
                key={member._id}
                className={`member-checkbox-card ${checked ? "checked" : ""}`}
              >
                <span>{member.name}</span>
                <input type="checkbox" checked={checked} onChange={() => toggleMember(member._id)} />
              </label>
            );
          })}
        </div>
      </div>

      {draft.splitMethod !== "EQUAL" && (
        <div className="allocations-panel">
          <div className="mb-3">
            <h3 className="text-sm font-bold">
              {draft.splitMethod === "EXACT" ? "Exact amounts" : "Percentage allocation"}
            </h3>
            <p className="text-xs text-neutral-500">
              {draft.splitMethod === "EXACT"
                ? "Amounts must add up exactly to the total expense."
                : "Percentages must add up to exactly 100%."}
            </p>
          </div>

          <div className="grid gap-3">
            {activeEntries.map((entry) => {
              const member = members.find((item) => item._id === entry.userId);
              if (!member) return null;

              return (
                <div key={member._id} className="allocation-row">
                  <div className="member-info">
                    <span className="name">{member.name}</span>
                    <span className="email">{member.email}</span>
                  </div>
                  {draft.splitMethod === "EXACT" ? (
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-neutral-400 text-sm font-semibold">₹</span>
                      <input
                        className="px-3 pl-6 w-[120px] rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent"
                        min="0"
                        step="0.01"
                        type="number"
                        value={entry.amount}
                        onChange={(event) => updateEntry(member._id, "amount", event.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <input
                        className="px-3 pr-6 w-[120px] rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent"
                        min="0"
                        step="0.01"
                        type="number"
                        value={entry.percentage}
                        onChange={(event) => updateEntry(member._id, "percentage", event.target.value)}
                        required
                      />
                      <span className="absolute right-3 text-neutral-400 text-sm font-semibold">%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
