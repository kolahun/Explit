import { SPLIT_METHOD_OPTIONS } from "../utils/expenseForm";

function toneClass(active) {
  return active
    ? "border-amber-400 bg-amber-500/15 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.3)]"
    : "border-neutral-700 bg-neutral-900/70 text-neutral-300";
}

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
      <div className="grid gap-3 md:grid-cols-3">
        {SPLIT_METHOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`rounded-2xl border px-4 py-4 text-left transition ${toneClass(draft.splitMethod === option.value)}`}
            type="button"
            onClick={() => setSplitMethod(option.value)}
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/90">{option.label}</div>
            <p className="mt-2 text-sm leading-6 text-inherit/90">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Included members</h3>
            <p className="text-xs text-neutral-400">Choose who shares this expense before entering allocations.</p>
          </div>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
            {draft.splitBetween.length} selected
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {members.map((member) => {
            const checked = draft.splitBetween.includes(member._id);

            return (
              <label
                key={member._id}
                className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm ${
                  checked ? "border-amber-400/60 bg-amber-500/10 text-white" : "border-neutral-800 bg-neutral-900/70 text-neutral-300"
                }`}
              >
                <span>{member.name}</span>
                <input type="checkbox" checked={checked} onChange={() => toggleMember(member._id)} />
              </label>
            );
          })}
        </div>
      </div>

      {draft.splitMethod !== "EQUAL" && (
        <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              {draft.splitMethod === "EXACT" ? "Exact amounts" : "Percentage allocation"}
            </h3>
            <p className="text-xs text-neutral-400">
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
                <div key={member._id} className="grid gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
                  <div>
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-xs text-neutral-500">{member.email}</div>
                  </div>
                  {draft.splitMethod === "EXACT" ? (
                    <input
                      className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
                      min="0"
                      step="0.01"
                      type="number"
                      value={entry.amount}
                      onChange={(event) => updateEntry(member._id, "amount", event.target.value)}
                      required
                    />
                  ) : (
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 pr-10 text-white"
                        min="0"
                        step="0.01"
                        type="number"
                        value={entry.percentage}
                        onChange={(event) => updateEntry(member._id, "percentage", event.target.value)}
                        required
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">%</span>
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
