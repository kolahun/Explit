import { ArrowRight, CheckCircle2, HandCoins } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function getUserId(user) {
  return user?._id || user?.id || user;
}

export default function SettlementSuggestions({ settlementData, currentUser, onSettle }) {
  const userId = getUserId(currentUser);
  const { simplified = [] } = settlementData;

  const youOwe = simplified.filter((item) => getUserId(item.fromUser) === userId);
  const owedToYou = simplified.filter((item) => getUserId(item.toUser) === userId);

  if (youOwe.length === 0 && owedToYou.length === 0) {
    return (
      <div className="settle-suggestions settle-suggestions-empty">
        <CheckCircle2 size={36} />
        <p>You're all settled up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="settle-suggestions">
      {youOwe.length > 0 && (
        <div className="settle-suggestions-group">
          <h3 className="settle-suggestions-group-title">You need to pay</h3>
          {youOwe.map((item) => (
            <div
              className="settle-suggestion-card settle-suggestion-card--owe"
              key={`${getUserId(item.fromUser)}-${getUserId(item.toUser)}`}
            >
              <div className="settle-suggestion-info">
                <HandCoins size={18} className="settle-suggestion-icon" />
                <div>
                  <div className="settle-suggestion-name">
                    Pay <strong>{item.toUser?.name}</strong>
                  </div>
                  <div className="settle-suggestion-amount settle-suggestion-amount--owe">
                    {moneyFormatter.format(item.amount)}
                  </div>
                </div>
              </div>
              <button
                className="settle-suggestion-action settle-suggestion-action--owe"
                onClick={() => onSettle(item)}
                type="button"
              >
                Settle Now <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {owedToYou.length > 0 && (
        <div className="settle-suggestions-group">
          <h3 className="settle-suggestions-group-title">Others owe you</h3>
          {owedToYou.map((item) => (
            <div
              className="settle-suggestion-card settle-suggestion-card--receive"
              key={`${getUserId(item.fromUser)}-${getUserId(item.toUser)}`}
            >
              <div className="settle-suggestion-info">
                <HandCoins size={18} className="settle-suggestion-icon" />
                <div>
                  <div className="settle-suggestion-name">
                    <strong>{item.fromUser?.name}</strong> owes you
                  </div>
                  <div className="settle-suggestion-amount settle-suggestion-amount--receive">
                    {moneyFormatter.format(item.amount)}
                  </div>
                </div>
              </div>
              <button
                className="settle-suggestion-action settle-suggestion-action--receive"
                onClick={() => onSettle(item)}
                type="button"
              >
                Mark Settled <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
