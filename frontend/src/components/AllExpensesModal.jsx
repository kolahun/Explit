import { X } from "lucide-react";
import ExpenseList from "./ExpenseList";

export default function AllExpensesModal({ expenses, group, onClose, onDelete, onOpenExpense, onUpdate }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="all-expenses-modal" onClick={(e) => e.stopPropagation()}>
        <div className="all-expenses-modal-header">
          <h2>All Expenses</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="all-expenses-modal-body">
          <ExpenseList
            expenses={[...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
            group={group}
            onDelete={onDelete}
            onOpenExpense={onOpenExpense}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}
