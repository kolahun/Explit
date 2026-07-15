import { useState } from "react";
import DateFilter from "../settle/DateFilter";
import SummaryCards from "../settle/SummaryCards";
import PersonalInsights from "../settle/PersonalInsights";
import SettlementSuggestions from "../settle/SettlementSuggestions";
import TransactionTimeline from "../settle/TransactionTimeline";
import MemberReportCards from "../settle/MemberReportCards";

function filterByDateRange(items, dateRange, dateKey = "createdAt") {
  if (!dateRange.start) return items;
  return items.filter((item) => {
    const d = new Date(item[dateKey] || item.timestamp);
    if (dateRange.start && d < dateRange.start) return false;
    if (dateRange.end && d > dateRange.end) return false;
    return true;
  });
}

export default function GroupSettleUpTab({ expenses, settlementData, currentUser, group, onSettle }) {
  const [dateRange, setDateRange] = useState({ label: "All Time", start: null, end: null });

  const filteredExpenses = filterByDateRange(expenses, dateRange, "createdAt");
  const filteredHistory = filterByDateRange(settlementData.history || [], dateRange, "timestamp");
  const filteredSettlementData = { ...settlementData, history: filteredHistory };

  return (
    <div className="settle-tab">
      {/* Header */}
      <div className="settle-tab-header">
        <h2>Analytics &amp; Settlements</h2>
        <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="settle-tab-section">
        <SummaryCards
          expenses={filteredExpenses}
          settlementData={settlementData}
          currentUser={currentUser}
        />
      </div>

      {/* Personal Insights */}
      <div className="settle-tab-section">
        <h3 className="settle-tab-section-title">Your Spending Insights</h3>
        <PersonalInsights expenses={filteredExpenses} currentUser={currentUser} />
      </div>

      {/* Settlement Suggestions */}
      <div className="settle-tab-section">
        <h3 className="settle-tab-section-title">Pending Settlements</h3>
        <SettlementSuggestions
          settlementData={settlementData}
          currentUser={currentUser}
          onSettle={onSettle}
        />
      </div>

      {/* Transaction Timeline */}
      <div className="settle-tab-section">
        <h3 className="settle-tab-section-title">Transaction Timeline</h3>
        <TransactionTimeline
          expenses={filteredExpenses}
          settlementData={filteredSettlementData}
        />
      </div>

      {/* Member Report Cards */}
      <div className="settle-tab-section">
        <h3 className="settle-tab-section-title">Member Breakdown</h3>
        <MemberReportCards
          group={group}
          expenses={filteredExpenses}
          settlementData={settlementData}
        />
      </div>
    </div>
  );
}
