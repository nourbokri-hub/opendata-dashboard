import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../api/axiosConfig";

import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";

// ✅ IMPORTANT: motion + AnimatePresence
import { motion as Motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "L'adresse email est requise";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      loading: true,
      errors: { ...prev.errors, submit: "" },
    }));

    try {
      const response = await api.post("/auth/login", formData);
      const { token, user } = response.data;

      // ✅ Redux auth (remplace AuthContext)
      dispatch(loginSuccess({ user, token }));

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: false,
        errors: {
          ...prev.errors,
          submit:
            error.response?.data?.message ||
            (typeof error.response?.data === "string"
              ? error.response.data
              : error.message) ||
            "Email ou mot de passe incorrect",
        },
      }));
    }
  };

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => navigate("/dashboard"), 800);
      return () => clearTimeout(timer);
    }
  }, [formState.success, navigate]);

  const ErrorField = ({ message }) => (
    <Motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-wider mt-1 ml-1"
    >
      <AlertCircle size={12} />
      {message}
    </Motion.div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f4ff] via-[#fbf9ff] to-[#fff2f6] px-4 py-12 sm:px-6">
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(83,62,123,0.14)] backdrop-blur-xl sm:p-10"
      >
        {!formState.success && (
          <div className="flex justify-start mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all group tracking-widest uppercase"
            >
              <div className="p-2 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </div>
              <span>Retour</span>
            </Link>
          </div>
        )}

        {formState.success ? (
          <div className="py-12 text-center animate-in zoom-in duration-500">
            <div className="relative inline-block">
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-100 rounded-full"
              />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Bienvenue !
            </h2>
            <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto my-6" />
            <p className="text-sm text-slate-400 font-medium">
              Accès sécurisé en cours...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h2 className="text-gray-900 font-black text-3xl tracking-tight">
                Connexion
              </h2>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Heureux de vous revoir parmi nous
              </p>
            </div>

            {searchParams.get("session") === "expired" && (
              <div role="status" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Votre session a expiré ou n’est plus valide. Reconnectez-vous pour accéder aux datasets.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* EMAIL */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1 tracking-widest">
                  Identifiant Email
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      formState.errors.email ? "text-red-400" : "text-slate-300"
                    } w-5 h-5`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all outline-none text-sm font-medium ${
                      formState.errors.email
                        ? "border-red-100 bg-red-50 focus:border-red-400"
                        : "border-violet-100 bg-[#faf8fd] focus:bg-white focus:border-indigo-400 shadow-sm shadow-indigo-100/20"
                    }`}
                    placeholder="nom@exemple.com"
                    autoComplete="email"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {formState.errors.email ? (
                    <ErrorField message={formState.errors.email} />
                  ) : null}
                </AnimatePresence>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1 tracking-widest">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      formState.errors.password
                        ? "text-red-400"
                        : "text-slate-300"
                    } w-5 h-5`}
                  />
                  <input
                    type={formState.showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all outline-none text-sm font-medium ${
                      formState.errors.password
                        ? "border-red-100 bg-red-50 focus:border-red-400"
                        : "border-violet-100 bg-[#faf8fd] focus:bg-white focus:border-indigo-400 shadow-sm shadow-indigo-100/20"
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                    aria-label={
                      formState.showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {formState.showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {formState.errors.password ? (
                    <ErrorField message={formState.errors.password} />
                  ) : null}
                </AnimatePresence>
              </div>

              {/* SUBMIT ERROR */}
              <AnimatePresence>
                {formState.errors.submit && (
                  <Motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100"
                  >
                    <AlertCircle size={18} /> {formState.errors.submit}
                  </Motion.div>
                )}
              </AnimatePresence>

              <Motion.button
                whileHover={{ scale: formState.loading ? 1 : 1.01 }}
                whileTap={{ scale: formState.loading ? 1 : 0.98 }}
                type="submit"
                disabled={formState.loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs tracking-[0.1em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState.loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "AUTHENTIFICATION"
                )}
              </Motion.button>

              <div className="text-center pt-6 border-t border-slate-50 mt-6">
                <p className="text-sm text-slate-400 font-medium">
                  Pas encore de compte ?{" "}
                  <Link
                    to="/register"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Créer un profil
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </Motion.div>
    </div>
  );
};

export default Login;
