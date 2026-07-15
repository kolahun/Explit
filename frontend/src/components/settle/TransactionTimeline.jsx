import { Banknote, Receipt } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function relativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const CATEGORY_COLORS = {
  Food: "#fbbf24",
  Travel: "#38bdf8",
  Rent: "#f472b6",
  Entertainment: "#a78bfa",
  Miscellaneous: "#34d399",
};

export default function TransactionTimeline({ expenses, settlementData }) {
  const { history = [] } = settlementData;

  const items = [
    ...expenses.map((e) => ({
      id: e._id,
      type: "expense",
      date: new Date(e.createdAt),
      label: `${e.payer?.name || "Someone"} added ${e.category || "Miscellaneous"}`,
      amount: e.amount,
      color: CATEGORY_COLORS[e.category] || "var(--color-primary)",
    })),
    ...history.map((s) => ({
      id: s._id,
      type: "settlement",
      date: new Date(s.timestamp || s.createdAt),
      label: `${s.fromUser?.name || "Someone"} paid ${s.toUser?.name || "someone"}`,
      amount: s.amount,
      color: "var(--color-success)",
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20);

  if (items.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="timeline scrollable-list">
      {items.map((item, index) => (
        <div className="timeline-entry" key={`${item.type}-${item.id}`}>
          <div className="timeline-left">
            <div
              className="timeline-dot"
              style={{ backgroundColor: item.color }}
            >
              {item.type === "expense"
                ? <Receipt size={12} />
                : <Banknote size={12} />}
            </div>
            {index < items.length - 1 && <div className="timeline-line" />}
          </div>
          <div className="timeline-content">
            <div className="timeline-description">{item.label}</div>
            <div className="timeline-meta">
              <span
                className="timeline-amount"
                style={{ color: item.color }}
              >
                {moneyFormatter.format(item.amount)}
              </span>
              <span className="timeline-date">{relativeTime(item.date)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
