import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiRequest } from "../api/client";
import AppHeader from "../components/AppHeader";
import GroupCard from "../components/GroupCard";

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/groups").then(setGroups).catch((err) => setError(err.message));
  }, []);

  async function createGroup(event) {
    event.preventDefault();
    setError("");
    try {
      const group = await apiRequest("/groups", { method: "POST", body: JSON.stringify({ name }) });
      setGroups((current) => [group, ...current]);
      setName("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteGroup(groupId) {
    const shouldDelete = window.confirm("Delete this group and all of its expenses and settlements?");
    if (!shouldDelete) return;

    setError("");
    try {
      await apiRequest(`/groups/${groupId}`, { method: "DELETE" });
      setGroups((current) => current.filter((group) => group._id !== groupId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-title">
          <h1>Groups</h1>
        </div>
        <form className="toolbar" onSubmit={createGroup}>
          <input placeholder="New group name" value={name} onChange={(e) => setName(e.target.value)} required />
          <button type="submit">
            <Plus size={18} />
            Create
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <section className="premium-group-grid">
          {groups.map((group, index) => (
            <GroupCard group={group} index={index} key={group._id} onDelete={deleteGroup} />
          ))}
        </section>
      </main>
    </>
  );
}
