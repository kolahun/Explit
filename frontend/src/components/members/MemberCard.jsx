import { useState, useRef, useEffect } from "react";
import { MoreVertical, TrendingDown, TrendingUp, CheckCircle2, X } from "lucide-react";

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

export default function MemberCard({ member, expenses, settlementData, currentUser, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const memberId = getUserId(member);
  const currentUserId = getUserId(currentUser);
  const isSelf = memberId === currentUserId;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Stats
  const expensesAdded = expenses.filter((e) => getUserId(e.payer) === memberId).length;
  const totalPaid = expenses.reduce((sum, e) => {
    if (getUserId(e.payer) === memberId) return sum + e.amount;
    const pEntry = (e.paidBy || []).find((p) => getUserId(p.user) === memberId);
    return sum + (pEntry?.amount || 0);
  }, 0);

  const balanceEntry = (settlementData.balances || []).find(
    (b) => getUserId(b.user) === memberId
  );
  const netBalance = balanceEntry?.balance ?? 0;
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;

  return (
    <div className="member-card">
      <div className="member-card-top">
        <div
          className="member-card-avatar"
          style={{ backgroundColor: getAvatarColor(member.name) }}
          aria-hidden="true"
        >
          {(member.name || "?")[0].toUpperCase()}
        </div>

        <div className="member-card-info">
          <div className="member-card-name">
            {member.name}
            {isSelf && <span className="member-card-you-badge">You</span>}
          </div>
          <div className="member-card-email">{member.email}</div>
        </div>

        {!isSelf && (
          <div className="member-card-menu" ref={menuRef}>
            <button
              className="icon-button"
              onClick={() => setMenuOpen((o) => !o)}
              type="button"
              aria-label="Member options"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="member-card-menu-dropdown">
                <button
                  className="member-card-menu-item member-card-menu-item--danger"
                  onClick={() => { onRemove(memberId); setMenuOpen(false); }}
                  type="button"
                >
                  <X size={14} /> Remove Member
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`member-card-balance ${isPositive ? "positive" : isNegative ? "negative" : "settled"}`}
      >
        {isPositive ? (
          <><TrendingUp size={14} /> Gets back {moneyFormatter.format(netBalance)}</>
        ) : isNegative ? (
          <><TrendingDown size={14} /> Owes {moneyFormatter.format(Math.abs(netBalance))}</>
        ) : (
          <><CheckCircle2 size={14} /> Settled up</>
        )}
      </div>

      <div className="member-card-stats">
        <div className="member-card-stat">
          <div className="member-card-stat-value">{expensesAdded}</div>
          <div className="member-card-stat-label">Expenses Added</div>
        </div>
        <div className="member-card-stat">
          <div className="member-card-stat-value">{moneyFormatter.format(totalPaid)}</div>
          <div className="member-card-stat-label">Total Paid</div>
        </div>
      </div>
    </div>
  );
}
