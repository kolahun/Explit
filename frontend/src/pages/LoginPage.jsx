import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserPlus, WalletCards, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithPassword, registerWithPassword } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        await registerWithPassword(form.name, form.email, form.password);
      } else {
        await loginWithPassword(form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className="login-page relative">
      <button 
        className="absolute top-6 right-6 p-2 rounded-full bg-neutral-200/50 dark:bg-slate-800/50 hover:bg-neutral-300/50 dark:hover:bg-slate-700/50 transition-colors text-neutral-600 dark:text-neutral-400" 
        onClick={toggleTheme} 
        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <section className="login-hero" aria-label="Explit overview">
        <div className="login-brand-mark">
          <WalletCards size={28} />
        </div>
        <h1>Explit shared costs without the awkward math.</h1>
        <p>Build groups, add shared costs, track who paid, and settle balances with fewer payments.</p>
        <div className="login-metrics" aria-label="App highlights">
          <span><strong>CRUD</strong> groups</span>
          <span><strong>Track</strong> expenses</span>
          <span><strong>Settle</strong> faster</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
            role="tab"
            type="button"
          >
            Login
          </button>
          <button
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
            role="tab"
            type="button"
          >
            Sign up
          </button>
        </div>

        <div className="auth-heading">
          <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
          <p>{mode === "signup" ? "Start managing shared expenses in minutes." : "Log in to continue to your groups."}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Full name
              <span className="input-shell">
                <UserPlus size={18} />
                <input
                  autoComplete="name"
                  name="name"
                  onChange={updateField}
                  placeholder="Aarav Sharma"
                  required
                  value={form.name}
                />
              </span>
            </label>
          )}
          <label>
            Email
            <span className="input-shell">
              <Mail size={18} />
              <input
                autoComplete="email"
                name="email"
                onChange={updateField}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </span>
          </label>
          <label>
            Password
            <span className="input-shell">
              <LockKeyhole size={18} />
              <input
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : undefined}
                name="password"
                onChange={updateField}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                required
                type="password"
                value={form.password}
              />
            </span>
          </label>
          <button className="primary-action" disabled={submitting} type="submit">
            {submitting ? "Please wait" : mode === "signup" ? "Create account" : "Login"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>
        <div className="flex justify-center w-full mt-1">
          <GoogleLogin
            onSuccess={(response) => loginWithGoogle(response.credential).catch((err) => setError(err.message))}
            onError={() => setError("Google login failed")}
          />
        </div>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
