const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 45%, 55%)`;
}

function getUserId(user) {
  return user?._id || user?.id || user;
}

const CATEGORY_ICONS = {
  Food: "🍽️", Travel: "✈️", Rent: "🏠", Entertainment: "🎬", Miscellaneous: "📦",
};

export default function MemberReportCards({ group, expenses, settlementData }) {
  const members = group?.members || [];
  const balances = settlementData?.balances || [];

  return (
    <div className="report-cards-grid">
      {members.map((member) => {
        const memberId = getUserId(member);

        // Expenses paid by this member
        const paid = expenses.filter(
          (e) => getUserId(e.payer) === memberId || (e.paidBy || []).some((p) => getUserId(p.user) === memberId)
        );

        const totalPaid = paid.reduce((sum, e) => {
          if (getUserId(e.payer) === memberId) return sum + e.amount;
          const entry = (e.paidBy || []).find((p) => getUserId(p.user) === memberId);
          return sum + (entry?.amount || 0);
        }, 0);

        const expensesAdded = expenses.filter((e) => getUserId(e.payer) === memberId).length;

        // Net balance
        const balanceEntry = balances.find((b) => getUserId(b.user) === memberId);
        const netBalance = balanceEntry?.balance ?? 0;

        // Biggest category
        const catTotals = {};
        expenses.forEach((e) => {
          const share = (e.splitShares || []).find((s) => getUserId(s.user) === memberId);
          if (share) {
            const cat = e.category || "Miscellaneous";
            catTotals[cat] = (catTotals[cat] || 0) + share.amount;
          }
        });
        const biggestCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

        // Last activity
        const memberExpenses = expenses.filter(
          (e) => getUserId(e.payer) === memberId ||
            (e.splitBetween || []).some((m) => getUserId(m) === memberId)
        );
        const lastExp = memberExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        const lastActivity = lastExp
          ? new Date(lastExp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "No activity";

        const isPositive = netBalance > 0.01;
        const isNegative = netBalance < -0.01;

        return (
          <div className="report-card" key={memberId}>
            <div className="report-card-top">
              <div
                className="report-card-avatar"
                style={{ backgroundColor: getAvatarColor(member.name) }}
              >
                {(member.name || "?")[0].toUpperCase()}
              </div>
              <div className="report-card-identity">
                <div className="report-card-name">{member.name}</div>
                <div className="report-card-email">{member.email}</div>
              </div>
              <div
                className={`report-card-balance ${isPositive ? "positive" : isNegative ? "negative" : "settled"}`}
              >
                {isPositive
                  ? `+${moneyFormatter.format(netBalance)}`
                  : isNegative
                  ? moneyFormatter.format(netBalance)
                  : "Settled"}
              </div>
            </div>

            <div className="report-card-stats">
              <div className="report-card-stat">
                <div className="report-card-stat-value">{expensesAdded}</div>
                <div className="report-card-stat-label">Expenses Added</div>
              </div>
              <div className="report-card-stat">
                <div className="report-card-stat-value">{moneyFormatter.format(totalPaid)}</div>
                <div className="report-card-stat-label">Total Paid</div>
              </div>
              <div className="report-card-stat">
                <div className="report-card-stat-value">
                  {biggestCat ? `${CATEGORY_ICONS[biggestCat[0]] || "📦"} ${biggestCat[0]}` : "—"}
                </div>
                <div className="report-card-stat-label">Top Category</div>
              </div>
              <div className="report-card-stat">
                <div className="report-card-stat-value">{lastActivity}</div>
                <div className="report-card-stat-label">Last Active</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
