import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle, User, ArrowLeft } from "lucide-react";
import api from "../api/axiosConfig";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formState, setFormState] = useState({ 
    loading: false, 
    errors: {}, 
    showPassword: false, 
    success: false 
  });

  // Validation améliorée avec messages spécifiques
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Veuillez entrer votre nom complet";
    }
    if (!formData.email.trim()) {
      errors.email = "L'adresse email est requise";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    if (!formData.password) {
      errors.password = "Le mot de passe ne peut pas être vide";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit faire au moins 8 caractères";
    } else if (formData.password.length > 72) {
      errors.password = "Le mot de passe ne peut pas dépasser 72 caractères";
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ dès que l'utilisateur recommence à taper
    if (formState.errors[name]) {
      setFormState(prev => ({ ...prev, errors: { ...prev.errors, [name]: "" } }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      await api.post("/auth/register", formData);
      setFormState(prev => ({ ...prev, loading: false, success: true, errors: {} }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            (typeof error.response?.data === "string"
              ? error.response.data
              : error.message) ||
            "L'inscription a échoué. Cet email est peut-être déjà utilisé.",
        }
      }));
    }
  };

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [formState.success, navigate]);

  // Petit composant interne pour afficher l'erreur sous le champ
  const ErrorMessage = ({ message }) => (
    <Motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 text-red-500 text-[11px] font-bold mt-1 ml-1 uppercase tracking-wider"
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
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(83,62,123,0.14)] backdrop-blur-xl sm:p-10"
      >
        {!formState.success && (
          <div className="flex justify-start mb-8">
            <Link to="/" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all group tracking-widest uppercase">
              <div className="p-2 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        )}

        {formState.success ? (
          <div className="py-8 animate-in zoom-in duration-500">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto my-4" />
            <p className="text-sm text-gray-500">Direction la page de connexion...</p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="text-gray-900 font-bold text-2xl tracking-tight">Créez votre compte</h2>
              <p className="text-slate-400 text-sm mt-2">Rejoignez la plateforme Open Data</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* CHAMP NOM */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1 tracking-widest">Nom complet</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${formState.errors.name ? 'text-red-400' : 'text-slate-300'} w-5 h-5`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                      formState.errors.name                       ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-violet-100 bg-[#faf8fd] focus:bg-white focus:border-indigo-400'
                    }`}
                    placeholder="Votre nom"
                  />
                </div>
                <AnimatePresence>
                  {formState.errors.name && <ErrorMessage message={formState.errors.name} />}
                </AnimatePresence>
              </div>

              {/* CHAMP EMAIL */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1 tracking-widest">Email</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${formState.errors.email ? 'text-red-400' : 'text-slate-300'} w-5 h-5`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                      formState.errors.email                       ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-violet-100 bg-[#faf8fd] focus:bg-white focus:border-indigo-400'
                    }`}
                    placeholder="nom@exemple.com"
                  />
                </div>
                <AnimatePresence>
                  {formState.errors.email && <ErrorMessage message={formState.errors.email} />}
                </AnimatePresence>
              </div>

              {/* CHAMP MOT DE PASSE */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1 tracking-widest">Mot de passe</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${formState.errors.password ? 'text-red-400' : 'text-slate-300'} w-5 h-5`} />
                  <input
                    type={formState.showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    minLength={8}
                    maxLength={72}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                      formState.errors.password                       ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-violet-100 bg-[#faf8fd] focus:bg-white focus:border-indigo-400'
                    }`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                    {formState.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {formState.errors.password && <ErrorMessage message={formState.errors.password} />}
                </AnimatePresence>
              </div>

              {/* ERREUR DE SOUMISSION API */}
              {formState.errors.submit && (
                <Motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} /> {formState.errors.submit}
                </Motion.div>
              )}

              <Motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={formState.loading} 
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {formState.loading ? <Loader className="w-5 h-5 animate-spin" /> : "CRÉER MON COMPTE"}
              </Motion.button>

              <div className='text-center pt-4 border-t border-slate-50 mt-4'>
                <p className="text-sm text-slate-500 font-medium">
                  J'ai déjà un compte ? <Link to='/login' className='text-indigo-600 font-bold hover:underline'>S'authentifier</Link>
                </p>
              </div>
            </form>
          </>
        )}
      </Motion.div>
    </div>
  );
};

export default Register;