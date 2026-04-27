import { LogOut, Moon, ReceiptText, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="app-header">
      <div className="brand">
        <ReceiptText size={24} />
        <span>Explit</span>
      </div>
      <div className="user-area">
        <span>{user?.name}</span>
        <button className="icon-button" onClick={toggleTheme} title={isDark ? "Switch to light theme" : "Switch to dark theme"}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button" onClick={logout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
