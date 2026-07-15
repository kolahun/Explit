import { UserPlus, Link2 } from "lucide-react";
import MemberCard from "../members/MemberCard";
import GroupStats from "../members/GroupStats";

export default function GroupMembersTab({
  group,
  expenses,
  settlementData,
  currentUser,
  memberEmail,
  setMemberEmail,
  addingMember,
  onAddMember,
  onRemoveMember,
  onCopyInviteLink,
}) {
  const members = group?.members || [];

  return (
    <div className="members-tab">
      {/* Header */}
      <div className="members-tab-header">
        <h2>Members</h2>

        <div className="members-tab-actions">
          <form
            className="members-tab-invite-form"
            onSubmit={(e) => {
              e.preventDefault();
              onAddMember?.();
            }}
          >
            <input
              type="email"
              placeholder="Enter email to invite..."
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="members-tab-invite-input"
              disabled={addingMember}
            />
            <button
              type="submit"
              className="members-tab-invite-btn"
              disabled={addingMember || !memberEmail?.trim()}
            >
              <UserPlus size={16} />
              <span>{addingMember ? "Adding..." : "Invite"}</span>
            </button>
          </form>

          <button
            className="members-tab-copy-link-btn"
            onClick={onCopyInviteLink}
            type="button"
          >
            <Link2 size={16} />
            <span>Copy Invite Link</span>
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="member-cards-grid">
        {members.map((member) => (
          <MemberCard
            key={member._id}
            member={member}
            expenses={expenses}
            settlementData={settlementData}
            currentUser={currentUser}
            onRemove={onRemoveMember}
          />
        ))}
      </div>

      {/* Group Stats */}
      <GroupStats
        group={group}
        expenses={expenses}
        settlementData={settlementData}
      />
    </div>
  );
}
