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
      <div className="split-toggle mb-4">
        {SPLIT_METHOD_OPTIONS.map((option) => {
          const isActive = draft.splitMethod === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSplitMethod(option.value)}
              className={`split-toggle-button ${isActive ? "active" : ""}`}
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
          <span className="selection-count-pill">
            {draft.splitBetween.length} selected
          </span>
        </div>

        <div className="member-checkbox-grid scrollable-list">
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

          <div className="grid gap-3 scrollable-list">
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
                    <div className="flex items-center">
                      <input
                        className="numeric-input px-3 w-[120px] rounded-lg"
                        min="0"
                        step="0.01"
                        type="number"
                        value={entry.amount}
                        onChange={(event) => updateEntry(member._id, "amount", event.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="₹0.00"
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <input
                        className="numeric-input px-3 pr-6 w-[120px] rounded-lg"
                        min="0"
                        step="0.01"
                        type="number"
                        value={entry.percentage}
                        onChange={(event) => updateEntry(member._id, "percentage", event.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="0%"
                      />
                      <span className="absolute right-3 text-neutral-400 text-sm font-semibold pointer-events-none">%</span>
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
