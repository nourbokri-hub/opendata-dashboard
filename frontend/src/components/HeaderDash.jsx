import React, { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Clock, User, ChevronDown, Search, X, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { setSearchTerm } from "../store/slices/uiSlice";

export default function HeaderDash({ onMenuClick }) {
  const [dateTime, setDateTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const searchTerm = useSelector((state) => state.ui.searchTerm);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = dateTime.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Motion.header
      className="sticky top-0 z-40 flex h-20 items-center justify-between gap-3 border-b border-violet-100/80 bg-[#fffaff]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ouvrir la navigation"
          className="rounded-xl p-2 text-slate-600 transition hover:bg-violet-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="mb-1 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:flex">
            <span>Open Data</span><span className="text-slate-300">/</span>
            <span className="text-violet-600">Plateforme</span>
          </div>
          <h1 className="truncate text-base font-bold tracking-tight text-slate-800 sm:text-lg">
            {greeting}, <span className="text-indigo-600">{user?.name || "Utilisateur"}</span>
          </h1>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 items-center md:flex lg:mx-8">
        <div className="group relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => dispatch(setSearchTerm(event.target.value))}
            placeholder="Rechercher dans les datasets..."
            aria-label="Rechercher dans les datasets"
            className="w-full rounded-2xl border border-transparent bg-slate-100/80 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-200 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => dispatch(setSearchTerm(""))}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-5">
        <div className="hidden flex-col items-end border-r border-slate-200 pr-5 xl:flex">
          <div className="flex items-center gap-2 font-bold tabular-nums text-slate-700">
            <Clock size={14} className="text-violet-500" />
            {dateTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-[10px] font-bold uppercase text-slate-400">
            {dateTime.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={isProfileOpen}
            aria-label="Ouvrir le menu du profil"
            className="group flex items-center gap-2 rounded-2xl p-1.5 text-left transition hover:bg-violet-50 sm:gap-3"
            onClick={() => setIsProfileOpen((open) => !open)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 font-bold uppercase text-white shadow-md shadow-violet-200">
              {user?.name ? user.name.charAt(0) : <User size={20} />}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-bold text-slate-700 sm:block">
              {user?.name ? user.name.split(" ")[0] : "Utilisateur"}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Fermer le menu du profil"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setIsProfileOpen(false)}
                />
                <Motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  className="absolute right-0 z-20 mt-3 w-52 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => { navigate("/dashboard/profil"); setIsProfileOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <User size={16} className="text-slate-400" /> Mon profil
                  </button>
                  <div className="mx-2 my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </Motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Motion.header>
  );
}
