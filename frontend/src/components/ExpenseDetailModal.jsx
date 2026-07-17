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
    <div className="expense-detail-overlay">
      <div className="expense-detail-modal">
        <div className="expense-detail-header">
          <div>
            <div className="mb-2 inline-flex category-badge">
              {expense.category}
            </div>
            <h2 className="text-2xl font-semibold">{moneyFormatter.format(expense.amount)}</h2>
            <p className="expense-detail-meta">
              {Array.isArray(expense.paidBy) && expense.paidBy.length > 0
                ? <>Paid by <strong>{expense.paidBy.length} people</strong></>
                : <>Paid by <strong>{expense.payer.name}</strong></>
              }{" "}via {(expense.splitMethod || "EQUAL").toLowerCase()} split
            </p>
          </div>
          <button className="expense-detail-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="expense-detail-content lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="grid gap-4">
            {Array.isArray(expense.paidBy) && expense.paidBy.length > 0 && (
              <div className="expense-detail-card">
                <div className="expense-detail-card-header">
                  <Users size={16} className="accent-icon" />
                  Who paid
                </div>
                <div className="grid gap-3">
                  {expense.paidBy.map((entry, index) => (
                    <div key={index} className="expense-detail-row">
                      <div className="expense-detail-name">{entry.user?.name || "Unknown"}</div>
                      <div className="text-sm font-semibold accent-amount">{moneyFormatter.format(entry.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="expense-detail-card">
              <div className="expense-detail-card-header">
                <MessageSquare size={16} className="accent-icon" />
                Split breakdown
              </div>
              <div className="grid gap-3">
                {splitSummary.map((share) => (
                  <div key={share.userId} className="expense-detail-row">
                    <div>
                      <div className="expense-detail-name">{share.name}</div>
                      <div className="text-xs expense-detail-subnote">{share.percentage.toFixed(2)}%</div>
                    </div>
                    <div className="text-sm font-semibold accent-amount">{moneyFormatter.format(share.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="expense-detail-card">
              <h3 className="text-lg font-semibold">Comments</h3>
              <p className="mt-1 text-sm expense-detail-note">Use this thread to clarify who owes what before settling.</p>

              <div className="expense-detail-comment-list">
                {(expense.comments || []).length === 0 ? (
                  <div className="expense-detail-comment-empty">
                    No comments yet. Start the thread if a charge needs explanation.
                  </div>
                ) : (
                  expense.comments
                    .slice()
                    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp))
                    .map((item) => (
                      <div key={item._id} className="expense-detail-comment-item">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold expense-detail-comment-author">{item.user.name}</span>
                          <span className="text-xs expense-detail-subnote">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 expense-detail-note">{item.text}</p>
                      </div>
                    ))
                )}
              </div>

              <form className="mt-4 grid gap-3" onSubmit={submitComment}>
                <textarea
                  className="expense-detail-textarea"
                  placeholder="Ask a question, flag a discrepancy, or leave context for the group."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                />
                {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
                <button className="expense-detail-submit inline-flex items-center justify-center gap-2 px-4 py-3" type="submit" disabled={submitting}>
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
