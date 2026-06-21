import { useEffect, useState } from "react";
import { Plus, WalletCards, Users, Sparkles } from "lucide-react";
import { apiRequest } from "../api/client";
import AppHeader from "../components/AppHeader";
import GroupCard from "../components/GroupCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card-top">
        <div className="skeleton-box skeleton-icon" />
        <div className="skeleton-box skeleton-badge" />
      </div>
      <div className="skeleton-box skeleton-title" />
      <div className="skeleton-box skeleton-subtitle" />
      <div className="skeleton-card-stats">
        <div className="skeleton-box skeleton-stat" />
        <div className="skeleton-box skeleton-stat" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <WalletCards size={48} />
      </div>
      <h2 className="empty-state-title">No groups yet</h2>
      <p className="empty-state-body">
        Create a group to start splitting expenses with friends, roommates, or travel buddies.
      </p>
      <div className="empty-state-hint">
        <Sparkles size={14} />
        Type a name above and hit <strong>Create</strong> to get started
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
  const toast = useToast();

  useEffect(() => {
    apiRequest("/groups")
      .then(setGroups)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function createGroup(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const group = await apiRequest("/groups", { method: "POST", body: JSON.stringify({ name }) });
      setGroups((current) => [group, ...current]);
      setName("");
      toast.success(`"${group.name}" created! 🎉`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  function requestDelete(groupId, groupName) {
    setConfirmDelete({ id: groupId, name: groupName });
  }

  async function confirmDeleteGroup() {
    if (!confirmDelete) return;
    const { id, name: groupName } = confirmDelete;
    setConfirmDelete(null);
    try {
      await apiRequest(`/groups/${id}`, { method: "DELETE" });
      setGroups((current) => current.filter((g) => g._id !== id));
      toast.success(`"${groupName}" deleted.`);
    } catch (err) {
      toast.error(err.message);
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
          <input
            placeholder="New group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={creating}
          />
          <button type="submit" disabled={creating || !name.trim()} className="btn-create">
            {creating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus size={18} />
            )}
            {creating ? "Creating…" : "Create"}
          </button>
        </form>

        {loading ? (
          <div className="premium-group-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="premium-group-grid">
            {groups.map((group, index) => (
              <GroupCard
                group={group}
                index={index}
                key={group._id}
                onDelete={(id) => requestDelete(id, group.name)}
              />
            ))}
          </section>
        )}
      </main>

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        groupName={confirmDelete?.name ?? ""}
        onConfirm={confirmDeleteGroup}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
