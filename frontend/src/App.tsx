import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import MemberLogin from "./components/MemberLogin";
import MemberDashboard from "./components/MemberDashboard";
import MemberRegistration from "./components/MemberRegistration";
import CompleteProfile from "./components/CompleteProfile";

function App() {
  // Componentes de proteção de rota
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const adminToken = localStorage.getItem("adminToken");
    return adminToken ? (
      <>{children}</>
    ) : (
      <Navigate to="/admin/login" replace />
    );
  };

  const MemberRoute = ({ children }: { children: React.ReactNode }) => {
    const memberId = localStorage.getItem("memberId");
    return memberId ? <>{children}</> : <Navigate to="/member/login" replace />;
  };

  const LoginRedirect = ({
    type,
    children,
  }: {
    type: "admin" | "member";
    children: React.ReactNode;
  }) => {
    if (type === "admin") {
      const adminToken = localStorage.getItem("adminToken");
      return adminToken ? (
        <Navigate to="/admin/dashboard" replace />
      ) : (
        <>{children}</>
      );
    } else {
      const memberId = localStorage.getItem("memberId");
      return memberId ? (
        <Navigate to="/member/dashboard" replace />
      ) : (
        <>{children}</>
      );
    }
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <LoginRedirect type="admin">
              <AdminLogin />
            </LoginRedirect>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/member/login"
          element={
            <LoginRedirect type="member">
              <MemberLogin />
            </LoginRedirect>
          }
        />
        <Route
          path="/member/complete-profile"
          element={
            <MemberRoute>
              <CompleteProfile />
            </MemberRoute>
          }
        />
        <Route
          path="/member/dashboard"
          element={
            <MemberRoute>
              <MemberDashboard />
            </MemberRoute>
          }
        />

        {/* Public Registration Route */}
        <Route path="/register/:token" element={<MemberRegistration />} />

        {/* Redirect old routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
