import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AppHeader from "../components/AppHeader";
import AddExpenseForm from "../components/AddExpenseForm";
import BalanceSummary from "../components/BalanceSummary";
import ExpenseDetailModal from "../components/ExpenseDetailModal";
import ExpenseList from "../components/ExpenseList";
import SpendingByCategoryChart from "../components/SpendingByCategoryChart";
import SettlementList from "../components/SettlementList";
import LoadingSpinner from "../components/LoadingSpinner";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [activeExpenseId, setActiveExpenseId] = useState(null);
  const [settlementData, setSettlementData] = useState({ simplified: [], history: [], balances: [] });
  const [memberEmail, setMemberEmail] = useState("");
  const [recalculating, setRecalculating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Load all group data in parallel
  async function loadGroupData() {
    const [groupResponse, expenseResponse, settlementResponse] = await Promise.all([
      apiRequest(`/groups/${groupId}`),
      apiRequest(`/expenses/group/${groupId}`),
      apiRequest(`/settlements/group/${groupId}`)
    ]);
    setGroup(groupResponse);
    setExpenses(expenseResponse);
    setSettlementData(settlementResponse);
  }

  // Load only settlement/balance data (after mutations that affect balances)
  async function reloadSettlements() {
    setRecalculating(true);
    try {
      const [expenseResponse, settlementResponse] = await Promise.all([
        apiRequest(`/expenses/group/${groupId}`),
        apiRequest(`/settlements/group/${groupId}`)
      ]);
      setExpenses(expenseResponse);
      setSettlementData(settlementResponse);
    } finally {
      setRecalculating(false);
    }
  }

  useEffect(() => {
    loadGroupData().catch((err) => {
      toast.error(err.message);
    });
  }, [groupId]);

  async function addExpense(payload) {
    await apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify({ ...payload, groupId })
    });
    // Expense added → balances change → reload expenses + settlements
    await reloadSettlements();
    toast.success("Expense added!");
  }

  async function updateExpense(expenseId, payload) {
    await apiRequest(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify({ ...payload, groupId })
    });
    await reloadSettlements();
    toast.success("Expense updated.");
  }

  async function deleteExpense(expenseId) {
    // Optimistic: remove from list immediately
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    if (activeExpenseId === expenseId) setActiveExpenseId(null);
    try {
      await apiRequest(`/expenses/${expenseId}?groupId=${groupId}`, { method: "DELETE" });
      // Reload just settlements (balances changed)
      await reloadSettlements();
      toast.success("Expense deleted.");
    } catch (err) {
      // Rollback on failure
      await reloadSettlements();
      toast.error(err.message);
    }
  }

  async function addComment(expenseId, text) {
    // Comments don't affect balances — only reload the single expense
    await apiRequest(`/expenses/${expenseId}/comments`, {
      method: "POST",
      body: JSON.stringify({ groupId, text })
    });
    // Only reload expenses list (not settlements) since balances unchanged
    const expenseResponse = await apiRequest(`/expenses/group/${groupId}`);
    setExpenses(expenseResponse);
  }

  async function addMember(event) {
    event.preventDefault();
    setAddingMember(true);
    try {
      const updated = await apiRequest(`/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: memberEmail })
      });
      setGroup(updated);
      setMemberEmail("");
      toast.success("Member added!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingMember(false);
    }
  }

  async function removeMember(memberId) {
    try {
      const updated = await apiRequest(`/groups/${groupId}/members/${memberId}`, { method: "DELETE" });
      setGroup(updated);
      toast.info("Member removed.");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function recordSettlement(item) {
    await apiRequest("/settlements", {
      method: "POST",
      body: JSON.stringify({
        groupId,
        fromUser: item.fromUser._id,
        toUser: item.toUser._id,
        amount: item.amount,
        status: "settled"
      })
    });
    await reloadSettlements();
    toast.success("Settlement recorded! ✓");
  }

  // Loading state — spinner while group data first loads
  if (!group) {
    return (
      <>
        <AppHeader />
        <LoadingSpinner fullPage size="lg" text="Loading group…" />
      </>
    );
  }

  const activeExpense = expenses.find((e) => e._id === activeExpenseId) || null;

  return (
    <>
      <AppHeader />
      <main className="page">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Groups
        </Link>
        <div className="page-title">
          <h1>{group.name}</h1>
        </div>

        {/* Recalculating indicator */}
        {recalculating && (
          <div className="recalculating-bar">
            <LoadingSpinner size="sm" />
            <span>Recalculating balances…</span>
          </div>
        )}

        <section className="layout">
          <div className="main-column">
            <BalanceSummary
              settlementData={settlementData}
              currentUser={currentUser}
              onSettle={recordSettlement}
            />
            <SpendingByCategoryChart expenses={expenses} />
            <section className="panel">
              <h2>Expenses</h2>
              <ExpenseList
                expenses={expenses}
                group={group}
                onDelete={deleteExpense}
                onOpenExpense={(expense) => setActiveExpenseId(expense._id)}
                onUpdate={updateExpense}
              />
            </section>
          </div>
          <aside className="side-column">
            <AddExpenseForm group={group} onAdd={addExpense} />
            <section className="panel">
              <h2>Members</h2>
              <form className="inline-form" onSubmit={addMember}>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                  disabled={addingMember}
                />
                <button type="submit" title="Add member" disabled={addingMember}>
                  {addingMember ? <LoadingSpinner size="sm" /> : <UserPlus size={18} />}
                </button>
              </form>
              <div className="member-list scrollable-list">
                {group.members.map((member) => (
                  <div className="member-row" key={member._id}>
                    <span>{member.name}</span>
                    <button className="icon-button" title="Remove member" onClick={() => removeMember(member._id)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <SettlementList
              settlements={settlementData.simplified}
              history={settlementData.history}
              onSettle={recordSettlement}
            />
          </aside>
        </section>
      </main>
      {activeExpense && (
        <ExpenseDetailModal
          expense={activeExpense}
          onClose={() => setActiveExpenseId(null)}
          onAddComment={addComment}
        />
      )}
    </>
  );
}
