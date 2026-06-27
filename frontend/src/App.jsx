import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GroupPage from "./pages/GroupPage";
import JoinPage from "./pages/JoinPage";
import LoadingSpinner from "./components/LoadingSpinner";
import AuroraBackground from "./components/AuroraBackground";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage size="lg" text="Signing you in…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <AuroraBackground />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join/:groupId" element={<JoinPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <GroupPage />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}
