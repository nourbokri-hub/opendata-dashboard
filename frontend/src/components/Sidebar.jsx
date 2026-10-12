import React from "react";
import {
  Database,
  ArchiveRestore,
  LayoutDashboard,
  PieChart,
  LogOut,
  Shield,
  User,
  Upload,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { isAdminUser } from "../utils/userRoles";

const Sidebar = ({ open = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = isAdminUser(user);

  const menuItem = (to, icon, label) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
      <Link
        to={to}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200
        ${
          isActive
            ? "bg-indigo-100 text-indigo-800 shadow-sm shadow-indigo-100"
            : "text-slate-500 hover:bg-white hover:text-indigo-700"
        }`}
      >
        {icon}
        <span className="text-base font-medium">{label}</span>
      </Link>
    );
  };

  const handleLogout = () => {
    dispatch(logout()); // ✅ Redux logout
    navigate("/");
  };

  return (
    <>
    {open && (
      <button
        type="button"
        aria-label="Fermer la navigation"
        className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        onClick={onClose}
      />
    )}
    <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-violet-100 bg-[#fffaff] text-slate-800 shadow-[12px_0_36px_rgba(73,52,105,0.06)] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-violet-100 px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-200/70 transition-transform">
          <Database className="h-5 w-5 text-white" />
        </div>

        <span className="text-xl font-black tracking-tight text-slate-800">
          OPEN<span className="text-indigo-600">DATA</span>
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
        <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Espace de travail</p>
        {menuItem("/dashboard", <LayoutDashboard size={19} />, "Tableau de bord")}
        {menuItem(
          "/dashboard/datasets",
          <Database size={19} />,
          "Sources de Données"
        )}
        {menuItem(
          "/dashboard/visualisation",
          <PieChart size={19} />,
          "Visualisation"
        )}
        {menuItem("/dashboard/import", <Upload size={19} />, "Importer")}
        {menuItem("/dashboard/profil", <User size={19} />, "Mon profil")}
        {isAdmin &&
          menuItem("/dashboard/admin", <Shield size={19} />, "Administration")}
        {menuItem(
          "/dashboard/archives",
          <ArchiveRestore size={19} />,
          "Archives"
        )}
      </nav>

      {/* Footer Logout */}
      <div className="border-t border-violet-100 px-4 py-5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={19} />
          <span className="text-base font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
