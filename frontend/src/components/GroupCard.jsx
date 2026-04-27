import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ReceiptText,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";
import { Link } from "react-router-dom";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

function getGroupBalance(group) {
  return group.netBalance ?? group.balance ?? group.userBalance ?? 0;
}

function getStatus(balance) {
  if (balance > 0) {
    return {
      className: "gets-back",
      label: `You get back ${moneyFormatter.format(balance)}`,
      title: "Gets back",
      Icon: TrendingUp
    };
  }

  if (balance < 0) {
    return {
      className: "owes",
      label: `You owe ${moneyFormatter.format(Math.abs(balance))}`,
      title: "Owes",
      Icon: TrendingDown
    };
  }

  return {
    className: "settled",
    label: "You are settled",
    title: "Settled",
    Icon: CheckCircle2
  };
}

export default function GroupCard({ group, index = 0, onDelete }) {
  const balance = getGroupBalance(group);
  const status = getStatus(balance);
  const StatusIcon = status.Icon;
  const memberCount = group.members?.length || 0;
  const formedDate = group.createdAt ? dateFormatter.format(new Date(group.createdAt)) : "Unknown";

  return (
    <article
      className="premium-group-card"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span className="premium-card-shape shape-one" />
      <span className="premium-card-shape shape-two" />

      <Link className="premium-card-link" to={`/groups/${group._id}`}>
        <div className="premium-card-inner">
        <div className="premium-card-top">
          <div className="premium-card-icon">
            <WalletCards size={27} />
          </div>

          <span className={`premium-status ${status.className}`}>
            <StatusIcon size={14} />
            {status.title}
          </span>
        </div>

        <div className="premium-card-copy">
          <h2>{group.name}</h2>
          <p>{status.label}</p>
          <span className="premium-card-meta">
            <CalendarDays size={14} />
            Formed {formedDate}
          </span>
        </div>

        <div className="premium-card-stats">
          <div className="premium-stat">
            <span>
              <Users size={15} />
              Members
            </span>
            <strong>{memberCount}</strong>
          </div>

          <div className="premium-stat">
            <span>
              <ReceiptText size={15} />
              Total
            </span>
            <strong>{moneyFormatter.format(group.totalExpense || 0)}</strong>
          </div>
        </div>

        <div className="premium-card-action">
          Open group
          <ArrowRight size={17} />
        </div>
        </div>
      </Link>

      <button className="premium-delete-button" onClick={() => onDelete?.(group._id)} title="Delete group" type="button">
        <Trash2 size={16} />
      </button>
    </article>
  );
}
