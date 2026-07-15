import { LayoutDashboard, HandCoins, Users } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settle", label: "Settle Up", icon: HandCoins },
  { id: "members", label: "Members", icon: Users },
];

export default function GroupTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="group-tab-bar" role="tablist">
      <div className="group-tab-bar-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`group-tab ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
