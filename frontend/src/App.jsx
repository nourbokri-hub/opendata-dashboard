import React, { lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { logout } from "./store/slices/authSlice";
import { useNavigate } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard layout
import DashboardLayout from "./layouts/DashboardLayout";
import { isAdminUser } from "./utils/userRoles";

// Dashboard pages
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const DatasetsPage = lazy(() => import("./pages/DatasetsPage"));
const ArchivesPage = lazy(() => import("./pages/ArchivesPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const Visualisation = lazy(() => import("./pages/Visualisation"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Profile = lazy(() => import("./components/Profile"));

/* ============================= */
/* Private Route (auth) */
/* ============================= */
function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

/* ============================= */
/* Admin Route (role) */
/* ============================= */
function AdminRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const isAdmin = token && isAdminUser(user);
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function SessionExpiryHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpiry = () => {
      dispatch(logout());
      navigate("/login?session=expired", { replace: true });
    };

    window.addEventListener("opendata:session-expired", handleSessionExpiry);
    return () => window.removeEventListener("opendata:session-expired", handleSessionExpiry);
  }, [dispatch, navigate]);

  return null;
}

/* ============================= */
/* Main App */
/* ============================= */
export default function App() {
  return (
    <Router>
      <SessionExpiryHandler />
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= DASHBOARD ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="archives" element={<ArchivesPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="visualisation" element={<Visualisation />} />
          <Route path="profil" element={<Profile />} />

          {/* Admin (protégé) */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* ================= NOT FOUND ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
