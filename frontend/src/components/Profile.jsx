import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, CheckCircle, Edit3, Save, X } from "lucide-react";
import api from "../api/axiosConfig";
import { loginSuccess } from "../store/slices/authSlice";
import { getUserRole } from "../utils/userRoles";
import { getApiErrorMessage } from "../utils/apiErrors";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const role = getUserRole(user);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && (formData.password.length < 8 || formData.password.length > 72)) {
      setError("Le nouveau mot de passe doit contenir entre 8 et 72 caractères.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await api.put("/auth/profile", formData);
      dispatch(loginSuccess(response.data));
      setMessage("Profil mis à jour avec succès !");
      setIsEditing(false);
      setFormData({ name: response.data.user.name, email: response.data.user.email, password: "" });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Erreur lors de la mise à jour du profil."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white/90 shadow-[0_18px_50px_rgba(92,68,135,0.10)]">
        {/* Header du profil */}
        <div className="flex h-32 items-center justify-center bg-gradient-to-r from-violet-400 via-indigo-400 to-[#d99ab5]">
             <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl font-black border border-white/30">
                 {user?.name?.charAt(0) || <User size={30} />}
             </div>
        </div>

        <div className="p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-800">Mon Profil</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
              {role === "ADMIN" ? "Administrateur" : "Utilisateur"}
            </span>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isEditing ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
              }`}
            >
              {isEditing ? <><X size={16}/> Annuler</> : <><Edit3 size={16}/> Modifier</>}
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3 border border-emerald-100">
              <CheckCircle size={18} /> <span className="text-sm font-bold">{message}</span>
            </div>
          )}
          {error && (
            <div role="alert" className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-semibold">
              {String(error)}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Champ Nom */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  disabled={!isEditing}
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all font-medium text-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Champ Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  disabled={!isEditing}
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all font-medium text-slate-700"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Champ Mot de passe (Visible uniquement en édition) */}
            {isEditing && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    placeholder="Laissez vide pour ne pas changer"
                    minLength={8}
                    maxLength={72}
                    value={formData.password}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} /> {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;