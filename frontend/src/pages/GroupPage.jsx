import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AppHeader from "../components/AppHeader";
import GroupTabBar from "../components/GroupTabBar";
import ExpenseDetailModal from "../components/ExpenseDetailModal";
import LoadingSpinner from "../components/LoadingSpinner";
import GroupDashboardTab from "../components/tabs/GroupDashboardTab";
import GroupSettleUpTab from "../components/tabs/GroupSettleUpTab";
import GroupMembersTab from "../components/tabs/GroupMembersTab";

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
  const [activeTab, setActiveTab] = useState("dashboard");

  function copyInviteLink() {
    const url = `${window.location.origin}/join/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Invite link copied! Share it with your friends. 🔗");
    }).catch(() => {
      toast.error("Could not copy link — please copy it manually.");
    });
  }

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
    loadGroupData().catch((err) => toast.error(err.message));
  }, [groupId]);

  async function addExpense(payload) {
    await apiRequest("/expenses", { method: "POST", body: JSON.stringify({ ...payload, groupId }) });
    await reloadSettlements();
    toast.success("Expense added!");
  }

  async function updateExpense(expenseId, payload) {
    await apiRequest(`/expenses/${expenseId}`, { method: "PUT", body: JSON.stringify({ ...payload, groupId }) });
    await reloadSettlements();
    toast.success("Expense updated.");
  }

  async function deleteExpense(expenseId) {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    if (activeExpenseId === expenseId) setActiveExpenseId(null);
    try {
      await apiRequest(`/expenses/${expenseId}?groupId=${groupId}`, { method: "DELETE" });
      await reloadSettlements();
      toast.success("Expense deleted.");
    } catch (err) {
      await reloadSettlements();
      toast.error(err.message);
    }
  }

  async function addComment(expenseId, text) {
    await apiRequest(`/expenses/${expenseId}/comments`, {
      method: "POST",
      body: JSON.stringify({ groupId, text })
    });
    const expenseResponse = await apiRequest(`/expenses/group/${groupId}`);
    setExpenses(expenseResponse);
  }

  async function addMember() {
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
      <main className="page group-page">
        {/* Back link */}
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Groups
        </Link>

        {/* Group header */}
        <div className="group-page-header">
          <div>
            <h1>{group.name}</h1>
            <p className="group-page-meta">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
          </div>
          {recalculating && (
            <div className="recalculating-bar">
              <LoadingSpinner size="sm" />
              <span>Recalculating…</span>
            </div>
          )}
        </div>

        {/* Tab bar — sticky below header */}
        <GroupTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <div className="tab-content" key={activeTab}>
          {activeTab === "dashboard" && (
            <GroupDashboardTab
              group={group}
              expenses={expenses}
              settlementData={settlementData}
              currentUser={currentUser}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
              onOpenExpense={(expense) => setActiveExpenseId(expense._id)}
              onSettle={recordSettlement}
            />
          )}
          {activeTab === "settle" && (
            <GroupSettleUpTab
              expenses={expenses}
              settlementData={settlementData}
              currentUser={currentUser}
              group={group}
              onSettle={recordSettlement}
            />
          )}
          {activeTab === "members" && (
            <GroupMembersTab
              group={group}
              expenses={expenses}
              settlementData={settlementData}
              currentUser={currentUser}
              memberEmail={memberEmail}
              setMemberEmail={setMemberEmail}
              addingMember={addingMember}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onCopyInviteLink={copyInviteLink}
            />
          )}
        </div>
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
