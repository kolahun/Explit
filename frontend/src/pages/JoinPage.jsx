import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, LogIn, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function JoinPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState("idle"); // idle | joining | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // Once auth is resolved, attempt to join
  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve

    if (!user) {
      // Not logged in — save the invite destination and redirect to login
      sessionStorage.setItem("joinAfterLogin", groupId);
      navigate(`/login?join=${groupId}`, { replace: true });
      return;
    }

    // User is logged in — auto-join the group
    setStatus("joining");
    apiRequest(`/groups/${groupId}/join`, { method: "POST" })
      .then(({ group, alreadyMember }) => {
        setStatus("success");
        if (alreadyMember) {
          toast.info(`You're already in "${group.name}"`);
        } else {
          toast.success(`Joined "${group.name}"! 🎉`);
        }
        // Brief pause so the user can see the success state, then redirect
        setTimeout(() => navigate(`/groups/${groupId}`, { replace: true }), 1800);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message);
      });
  }, [user, authLoading, groupId]);

  if (authLoading || status === "idle" || status === "joining") {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-icon joining">
            <Link2 size={32} />
          </div>
          <h1 className="join-title">Joining group…</h1>
          <p className="join-body">Hold on while we add you to the group.</p>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-icon success">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="join-title">You're in!</h1>
          <p className="join-body">Redirecting you to the group…</p>
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-icon error">
            <AlertCircle size={32} />
          </div>
          <h1 className="join-title">Invalid invite link</h1>
          <p className="join-body">{errorMsg || "This group no longer exists or the link is invalid."}</p>
          <button onClick={() => navigate("/", { replace: true })}>
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
