import { MessageSquare, Send, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

export default function ExpenseDetailModal({ expense, onClose, onAddComment }) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const splitSummary = useMemo(
    () =>
      (expense.splitShares || []).map((share) => ({
        userId: share.user._id || share.user,
        name: share.user.name,
        amount: share.amount,
        percentage: share.percentage
      })),
    [expense]
  );

  async function submitComment(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onAddComment(expense._id, comment);
      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-neutral-800 bg-neutral-950 text-white shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-5">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              {expense.category}
            </div>
            <h2 className="text-2xl font-semibold">{moneyFormatter.format(expense.amount)}</h2>
            <p className="mt-1 text-sm text-neutral-400">
              {Array.isArray(expense.paidBy) && expense.paidBy.length > 0
                ? <>Paid by <span className="font-medium text-white">{expense.paidBy.length} people</span></>
                : <>Paid by <span className="font-medium text-white">{expense.payer.name}</span></>
              }{" "}via {(expense.splitMethod || "EQUAL").toLowerCase()} split
            </p>
          </div>
          <button className="rounded-full border border-neutral-800 bg-neutral-900 p-2 text-neutral-300" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="grid gap-4">
            {Array.isArray(expense.paidBy) && expense.paidBy.length > 0 && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-200">
                  <Users size={16} className="text-indigo-400" />
                  Who paid
                </div>
                <div className="grid gap-3">
                  {expense.paidBy.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                      <div className="font-medium text-white">{entry.user?.name || "Unknown"}</div>
                      <div className="text-sm font-semibold text-indigo-300">{moneyFormatter.format(entry.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-200">
                <MessageSquare size={16} className="text-indigo-400" />
                Split breakdown
              </div>
              <div className="grid gap-3">
                {splitSummary.map((share) => (
                  <div key={share.userId} className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{share.name}</div>
                      <div className="text-xs text-neutral-500">{share.percentage.toFixed(2)}%</div>
                    </div>
                    <div className="text-sm font-semibold text-indigo-300">{moneyFormatter.format(share.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
              <h3 className="text-lg font-semibold text-white">Comments</h3>
              <p className="mt-1 text-sm text-neutral-400">Use this thread to clarify who owes what before settling.</p>

              <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
                {(expense.comments || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 px-4 py-6 text-sm text-neutral-500">
                    No comments yet. Start the thread if a charge needs explanation.
                  </div>
                ) : (
                  expense.comments
                    .slice()
                    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp))
                    .map((item) => (
                      <div key={item._id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-amber-300">{item.user.name}</span>
                          <span className="text-xs text-neutral-500">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-neutral-200">{item.text}</p>
                      </div>
                    ))
                )}
              </div>

              <form className="mt-4 grid gap-3" onSubmit={submitComment}>
                <textarea
                  className="min-h-[110px] rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-amber-400"
                  placeholder="Ask a question, flag a discrepancy, or leave context for the group."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                />
                {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-neutral-950" type="submit" disabled={submitting}>
                  <Send size={16} />
                  {submitting ? "Posting..." : "Post comment"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
