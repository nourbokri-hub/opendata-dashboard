import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * Modal simple pour modifier le nom (et optionnellement description).
 * Props:
 * - open: boolean
 * - dataset: { id, name, description? }
 * - onClose: fn
 * - onSubmit: fn({ name, description })
 */
export default function EditDatasetModal({ open, dataset, onClose, onSubmit }) {
  const [name, setName] = useState(dataset?.name || "");

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Modifier le dataset</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Changez le nom du dataset.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Nom
            </label>
            <input
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 outline-none text-sm font-semibold"
              placeholder="Nom du dataset"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black tracking-widest hover:border-indigo-200"
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black tracking-widest hover:bg-indigo-700"
            >
              ENREGISTRER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
