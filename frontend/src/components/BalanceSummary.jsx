import { ArrowDownRight, ArrowUpRight, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

export default function BalanceSummary({ settlementData, currentUser, onSettle }) {
  if (!currentUser || !settlementData) return null;

  const { simplified = [], balances = [] } = settlementData;
  const userId = currentUser._id;

  // Find current user's overall balance
  const userBalanceEntry = balances.find((b) => b.user?._id === userId);
  const netBalance = userBalanceEntry?.balance ?? 0;

  // Debts involving the current user
  const youOwe = simplified
    .filter((item) => item.fromUser?._id === userId)
    .map((item) => ({ name: item.toUser?.name, amount: item.amount, item }));

  const owedToYou = simplified
    .filter((item) => item.toUser?._id === userId)
    .map((item) => ({ name: item.fromUser?.name, amount: item.amount, item }));

  const isSettled = Math.abs(netBalance) < 0.01 && youOwe.length === 0 && owedToYou.length === 0;

  return (
    <section className="balance-summary-panel">
      {/* Hero balance card */}
      <div className={`balance-hero ${netBalance > 0.01 ? "positive" : netBalance < -0.01 ? "negative" : "settled"}`}>
        <div className="balance-hero-icon">
          {netBalance > 0.01 ? <TrendingUp size={24} /> : netBalance < -0.01 ? <TrendingDown size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div className="balance-hero-content">
          <span className="balance-hero-label">
            {isSettled ? "All settled up!" : netBalance > 0 ? "People owe you" : "You owe"}
          </span>
          <span className="balance-hero-amount">
            {isSettled ? "₹0" : moneyFormatter.format(Math.abs(netBalance))}
          </span>
        </div>
      </div>

      {/* Detailed breakdown */}
      {!isSettled && (
        <div className="balance-details">
          {owedToYou.length > 0 && (
            <div className="balance-detail-group">
              <h4 className="balance-detail-heading positive">
                <ArrowDownRight size={14} />
                Owed to you
              </h4>
              {owedToYou.map((entry, index) => (
                <div className="balance-detail-row" key={index}>
                  <div className="balance-detail-info">
                    <span className="balance-detail-name">{entry.name}</span>
                    <span className="balance-detail-amount positive">{moneyFormatter.format(entry.amount)}</span>
                  </div>
                  <button
                    className="balance-settle-btn"
                    type="button"
                    onClick={() => onSettle(entry.item)}
                  >
                    Settle
                  </button>
                </div>
              ))}
            </div>
          )}

          {youOwe.length > 0 && (
            <div className="balance-detail-group">
              <h4 className="balance-detail-heading negative">
                <ArrowUpRight size={14} />
                You owe
              </h4>
              {youOwe.map((entry, index) => (
                <div className="balance-detail-row" key={index}>
                  <div className="balance-detail-info">
                    <span className="balance-detail-name">{entry.name}</span>
                    <span className="balance-detail-amount negative">{moneyFormatter.format(entry.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
