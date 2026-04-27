import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import { apiRequest } from "../api/client";
import AppHeader from "../components/AppHeader";
import AddExpenseForm from "../components/AddExpenseForm";
import ExpenseList from "../components/ExpenseList";
import SettlementList from "../components/SettlementList";

export default function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlementData, setSettlementData] = useState({ simplified: [], history: [], balances: [] });
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");

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

  useEffect(() => {
    loadGroupData().catch((err) => setError(err.message));
  }, [groupId]);

  async function addExpense(payload) {
    await apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify({ ...payload, groupId })
    });
    await loadGroupData();
  }

  async function updateExpense(expenseId, payload) {
    await apiRequest(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify({ ...payload, groupId })
    });
    await loadGroupData();
  }

  async function deleteExpense(expenseId) {
    await apiRequest(`/expenses/${expenseId}?groupId=${groupId}`, { method: "DELETE" });
    await loadGroupData();
  }

  async function addMember(event) {
    event.preventDefault();
    setMemberError("");
    try {
      const updated = await apiRequest(`/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: memberEmail })
      });
      setGroup(updated);
      setMemberEmail("");
    } catch (err) {
      setMemberError(err.message);
    }
  }

  async function removeMember(memberId) {
    setMemberError("");
    try {
      const updated = await apiRequest(`/groups/${groupId}/members/${memberId}`, { method: "DELETE" });
      setGroup(updated);
      await loadGroupData();
    } catch (err) {
      setMemberError(err.message);
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
    await loadGroupData();
  }

  if (error) {
    return (
      <>
        <AppHeader />
        <main className="page"><p className="error">{error}</p></main>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <AppHeader />
        <main className="page"><p>Loading...</p></main>
      </>
    );
  }

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

        <section className="layout">
          <div className="main-column">
            <section className="panel">
              <h2>Expenses</h2>
              <ExpenseList expenses={expenses} group={group} onDelete={deleteExpense} onUpdate={updateExpense} />
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
                />
                <button type="submit" title="Add member">
                  <UserPlus size={18} />
                </button>
              </form>
              {memberError && <p className="error">{memberError}</p>}
              <div className="member-list">
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
    </>
  );
}
