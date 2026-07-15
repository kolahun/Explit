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
      {/* Row 1: Balance + Add Expense */}
      <div className="dashboard-top-row">
        <BalanceSummary
          settlementData={settlementData}
          currentUser={currentUser}
          onSettle={onSettle}
        />
        <AddExpenseForm group={group} onAdd={onAddExpense} />
      </div>

      {/* Row 2: Chart + Recent Expenses */}
      <div className="dashboard-bottom-row">
        <SpendingByCategoryChart expenses={expenses} />
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
