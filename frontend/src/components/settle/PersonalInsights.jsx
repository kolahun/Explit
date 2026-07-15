import { EXPENSE_CATEGORIES } from "../../utils/expenseForm";

const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

const CATEGORY_COLORS = {
  Food: "#fbbf24",
  Travel: "#38bdf8",
  Rent: "#f472b6",
  Entertainment: "#a78bfa",
  Miscellaneous: "#34d399",
};

const CATEGORY_ICONS = {
  Food: "🍽️",
  Travel: "✈️",
  Rent: "🏠",
  Entertainment: "🎬",
  Miscellaneous: "📦",
};

function getUserId(user) {
  return user?._id || user?.id || user;
}

export default function PersonalInsights({ expenses, currentUser }) {
  const userId = getUserId(currentUser);

  // Compute your personal spend per category from splitShares
  const byCategory = {};
  let totalPersonal = 0;

  for (const expense of expenses) {
    const share = (expense.splitShares || []).find(
      (s) => getUserId(s.user) === userId
    );
    if (share) {
      const cat = expense.category || "Miscellaneous";
      byCategory[cat] = (byCategory[cat] || 0) + share.amount;
      totalPersonal += share.amount;
    }
  }

  const breakdown = EXPENSE_CATEGORIES
    .map((cat) => ({ name: cat, amount: byCategory[cat] || 0 }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const biggest = breakdown[0] || null;

  if (breakdown.length === 0) {
    return (
      <div className="insights-grid">
        <div className="insight-card insight-card-empty">
          <p>No personal spending data yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-grid">
      {/* Biggest Category */}
      <div className="insight-card">
        <h3>Biggest Category</h3>
        {biggest && (
          <div className="insight-category-hero">
            <span className="insight-category-emoji">
              {CATEGORY_ICONS[biggest.name] || "📦"}
            </span>
            <div>
              <div className="insight-category-name">{biggest.name}</div>
              <div className="insight-category-amount">
                {moneyFormatter.format(biggest.amount)}
              </div>
              <div
                className="insight-category-pct"
                style={{ color: CATEGORY_COLORS[biggest.name] }}
              >
                {totalPersonal > 0
                  ? ((biggest.amount / totalPersonal) * 100).toFixed(0)
                  : 0}
                % of your spending
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spending Breakdown */}
      <div className="insight-card">
        <h3>Your Spending Breakdown</h3>
        <div className="breakdown-bars">
          {breakdown.map((item) => {
            const pct = totalPersonal > 0 ? (item.amount / totalPersonal) * 100 : 0;
            return (
              <div className="breakdown-bar-row" key={item.name}>
                <div className="breakdown-bar-label">
                  <span>{item.name}</span>
                  <span className="breakdown-bar-value">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CATEGORY_COLORS[item.name] || "var(--color-primary)",
                    }}
                  />
                </div>
                <div className="breakdown-bar-amount">
                  {moneyFormatter.format(item.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
