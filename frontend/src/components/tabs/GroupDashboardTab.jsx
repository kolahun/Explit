import { useState } from "react";
import AddExpenseForm from "../AddExpenseForm";
import BalanceSummary from "../BalanceSummary";
import SpendingByCategoryChart from "../SpendingByCategoryChart";
import RecentExpenses from "./RecentExpenses";
import AllExpensesModal from "../AllExpensesModal";

export default function GroupDashboardTab({
  group,
  expenses,
  settlementData,
  currentUser,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onOpenExpense,
  onSettle,
}) {
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  return (
    <div className="dashboard-tab">
      {/* Left Column: Balance + Chart */}
      <div className="dashboard-main-col">
        <BalanceSummary
          settlementData={settlementData}
          currentUser={currentUser}
          onSettle={onSettle}
        />
        <SpendingByCategoryChart expenses={expenses} />
      </div>

      {/* Right Column: Add Expense + Recent Expenses */}
      <div className="dashboard-side-col">
        <AddExpenseForm group={group} onAdd={onAddExpense} />
        <RecentExpenses
          expenses={expenses}
          group={group}
          onOpenExpense={onOpenExpense}
          onUpdate={onUpdateExpense}
          onDelete={onDeleteExpense}
          onViewAll={() => setShowAllExpenses(true)}
        />
      </div>

      {showAllExpenses && (
        <AllExpensesModal
          expenses={expenses}
          group={group}
          onClose={() => setShowAllExpenses(false)}
          onDelete={onDeleteExpense}
          onOpenExpense={onOpenExpense}
          onUpdate={onUpdateExpense}
        />
      )}
    </div>
  );
}
