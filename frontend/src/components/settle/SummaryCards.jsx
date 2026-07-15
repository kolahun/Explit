import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function getUserId(user) {
  return user?._id || user?.id || user;
}

export default function SummaryCards({ expenses, settlementData, currentUser }) {
  const userId = getUserId(currentUser);

  // Total group spend
  const totalGroupSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Your total spend (where you're payer or in paidBy)
  const yourTotalSpend = expenses.reduce((sum, e) => {
    if (getUserId(e.payer) === userId) return sum + e.amount;
    const paidByEntry = (e.paidBy || []).find((p) => getUserId(p.user) === userId);
    if (paidByEntry) return sum + paidByEntry.amount;
    return sum;
  }, 0);

  // Your share (what you owe from splits)
  const yourShare = expenses.reduce((sum, e) => {
    const share = (e.splitShares || []).find((s) => getUserId(s.user) === userId);
    return sum + (share?.amount || 0);
  }, 0);

  // Net balance
  const balanceEntry = (settlementData.balances || []).find(
    (b) => getUserId(b.user) === userId
  );
  const netBalance = balanceEntry?.balance ?? 0;

  const cards = [
    {
      id: "group-spend",
      icon: Users,
      title: "Group Total",
      value: moneyFormatter.format(totalGroupSpend),
      subtitle: `${expenses.length} expenses`,
      color: "var(--color-info)",
      colorBg: "var(--color-info-bg)",
    },
    {
      id: "your-spend",
      icon: Wallet,
      title: "You Paid",
      value: moneyFormatter.format(yourTotalSpend),
      subtitle: "Your payments",
      color: "var(--color-primary)",
      colorBg: "var(--color-primary-light)",
    },
    {
      id: "your-share",
      icon: TrendingDown,
      title: "Your Share",
      value: moneyFormatter.format(yourShare),
      subtitle: "Split owed by you",
      color: "#f472b6",
      colorBg: "rgba(244, 114, 182, 0.1)",
    },
    {
      id: "you-owe",
      icon: ArrowUpRight,
      title: "You Owe",
      value: netBalance < -0.01 ? moneyFormatter.format(Math.abs(netBalance)) : "₹0",
      subtitle: "Net pending payment",
      color: "var(--color-danger)",
      colorBg: "var(--color-danger-bg)",
    },
    {
      id: "you-get-back",
      icon: ArrowDownLeft,
      title: "You Get Back",
      value: netBalance > 0.01 ? moneyFormatter.format(netBalance) : "₹0",
      subtitle: "Net owed to you",
      color: "var(--color-success)",
      colorBg: "var(--color-success-bg)",
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div className="summary-card" key={card.id}>
            <div
              className="summary-card-icon"
              style={{ background: card.colorBg, color: card.color }}
            >
              <Icon size={20} />
            </div>
            <div className="summary-card-title">{card.title}</div>
            <div className="summary-card-value" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="summary-card-subtitle">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}
