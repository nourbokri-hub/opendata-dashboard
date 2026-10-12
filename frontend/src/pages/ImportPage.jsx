import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadDataset from "../components/UploadDataset";
import { Search, ArrowRight } from "lucide-react";

import { useDispatch } from "react-redux";
import { createDataset, setActiveDataset } from "../store/slices/datasetsSlice";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function ImportPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dataset, setDataset] = useState(null);
  // dataset attendu: { fileName, rows, columns }
  // MAIS on accepte aussi array (compatibilité)

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ✅ Normalisation: si UploadDataset renvoie juste rows[]
  const normalized = useMemo(() => {
    if (!dataset) return null;

    // Cas 1: dataset = rows[]
    if (Array.isArray(dataset)) {
      const rows = dataset;
      const columns = rows?.[0] ? Object.keys(rows[0]) : [];
      return { fileName: "dataset_importé", rows, columns };
    }

    // Cas 2: dataset déjà structuré
    if (dataset?.rows && dataset?.columns) return dataset;

    // Cas 3: dataset = { rows } seulement
    if (dataset?.rows && !dataset?.columns) {
      const columns = dataset.rows?.[0] ? Object.keys(dataset.rows[0]) : [];
      return { ...dataset, columns, fileName: dataset.fileName || "dataset_importé" };
    }

    return null;
  }, [dataset]);

  const filteredRows = useMemo(() => {
    if (!normalized?.rows?.length) return [];
    if (!search.trim()) return normalized.rows;

    const q = search.toLowerCase();
    return normalized.rows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(q)
    );
  }, [normalized, search]);

  const previewRows = filteredRows.slice(0, 10);

  const handleContinue = async () => {
    if (!normalized?.rows?.length) return;
    setSaving(true);
    setSaveError("");
    try {
      const savedDataset = await dispatch(
        createDataset({
          name: normalized.fileName,
          rowsCount: normalized.rows.length,
          colsCount: normalized.columns.length,
          jsonData: JSON.stringify(normalized.rows),
        })
      ).unwrap();
      dispatch(setActiveDataset(savedDataset));
      try {
        localStorage.setItem("activeDatasetId", String(savedDataset.id));
      } catch {
        // The current selection still works for this session if storage is unavailable.
      }
      navigate("/dashboard/visualisation");
    } catch (requestError) {
      setSaveError(getApiErrorMessage(requestError, "Impossible d'enregistrer ce dataset."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[1.6rem] border border-violet-100 bg-white/90 p-6 shadow-[0_8px_24px_rgba(73,52,105,0.055)]">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Import & Filtrage
        </h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          Importez un fichier, filtrez, puis passez à la visualisation.
        </p>
      </div>

      {/* Upload */}
      <UploadDataset onDataLoaded={setDataset} />

      {/* Dataset summary + search */}
      {normalized && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-[1.6rem] border border-violet-100 bg-white/90 p-6 shadow-sm">
            <div className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Dataset
            </div>
            <div className="mt-2 text-sm font-black text-slate-900">
              {normalized.fileName}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill label={`${normalized.rows.length} lignes`} />
              <Pill label={`${normalized.columns.length} colonnes`} />
            </div>
          </div>

          <div className="lg:col-span-2 rounded-[1.6rem] border border-violet-100 bg-white/90 p-6 shadow-sm">
            <div className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Recherche
            </div>
            <div className="mt-2 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dans le dataset..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-semibold"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-semibold">
                Affichage : {previewRows.length} / {filteredRows.length} lignes
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="px-4 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black tracking-widest hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? "ENREGISTREMENT..." : "ENREGISTRER ET ANALYSER"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Enregistrement impossible : {saveError}
        </div>
      )}

      {/* Preview table */}
      {normalized && (
        <div className="overflow-hidden rounded-[1.6rem] border border-violet-100 bg-white/90 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="text-sm font-black text-slate-900">Aperçu (10 lignes)</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Vérifiez rapidement les données importées.
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {normalized.columns.map((col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    {normalized.columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap"
                      >
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}

                {previewRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={normalized.columns.length}
                      className="px-4 py-10 text-center text-slate-500 font-semibold"
                    >
                      Aucun résultat pour cette recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label }) {
  return (
    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
      {label}
    </span>
  );
}
