import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import {
  FileSpreadsheet,
  Trash2,
  Database,
  Plus,
  Download,
  Archive,
  Loader2,
  PieChart,
  Pencil,
} from "lucide-react";

import EditDatasetModal from "../components/EditDatasetModal";

import { useSelector, useDispatch } from "react-redux";
import {
  archiveDataset,
  createDataset,
  deleteDataset,
  setActiveDataset,
  updateDataset,
  clearDatasetsError,
} from "../store/slices/datasetsSlice";
import { useNavigate } from "react-router-dom";
import { parseDatasetFile } from "../utils/datasetParser";
import { getApiErrorMessage } from "../utils/apiErrors";

const safeLower = (v) => String(v ?? "").toLowerCase();

const DatasetsPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);


  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc"); // asc | desc
  const [minRows, setMinRows] = useState("");
  const [maxRows, setMaxRows] = useState("");
  const [minCols, setMinCols] = useState("");
  const [maxCols, setMaxCols] = useState("");
  const [page, setPage] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchTerm = useSelector((state) => state.ui.searchTerm);
  const datasets = useSelector((state) => state.datasets.list);
  const status = useSelector((state) => state.datasets.status);
  const error = useSelector((state) => state.datasets.error);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    dispatch(clearDatasetsError());
    try {
      const { rows, columns } = await parseDatasetFile(file);
      await dispatch(
        createDataset({
          name: file.name,
          rowsCount: rows.length,
          colsCount: columns.length,
          jsonData: JSON.stringify(rows),
        })
      ).unwrap();
    } catch (requestError) {
      setUploadError(getApiErrorMessage(requestError, "L'import du dataset a échoué."));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ✅ FILTRE ROBUSTE (jsonData string OU objet)
  const filtered = useMemo(() => {
    const q = safeLower(searchTerm).trim();
    return datasets.filter((ds) => {
      const rows = Number(ds.rowsCount) || 0;
      const cols = Number(ds.colsCount) || 0;
      if (minRows !== "" && rows < Number(minRows)) return false;
      if (maxRows !== "" && rows > Number(maxRows)) return false;
      if (minCols !== "" && cols < Number(minCols)) return false;
      if (maxCols !== "" && cols > Number(maxCols)) return false;
      if (!q) return true;
      const name = safeLower(ds.name);
      const json = typeof ds.jsonData === "string" ? safeLower(ds.jsonData) : safeLower(JSON.stringify(ds.jsonData));
      return name.includes(q) || json.includes(q);
    }).sort((a, b) => {
      const left = sortKey === "name" ? safeLower(a.name) : Number(a[sortKey]) || 0;
      const right = sortKey === "name" ? safeLower(b.name) : Number(b[sortKey]) || 0;
      const comparison = typeof left === "string" ? left.localeCompare(right) : left - right;
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [datasets, searchTerm, minRows, maxRows, minCols, maxCols, sortKey, sortDir]);

  const pageSize = 10;
  const pageCount = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const onArchive = async (id) => {
    try {
      await dispatch(archiveDataset(id)).unwrap();
    } catch (requestError) {
      setUploadError(getApiErrorMessage(requestError, "Impossible d'archiver ce dataset."));
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Supprimer définitivement ce dataset ?")) {
      try {
        await dispatch(deleteDataset(id)).unwrap();
      } catch (requestError) {
        setUploadError(getApiErrorMessage(requestError, "Impossible de supprimer ce dataset."));
      }
    }
  };

  const openEdit = (ds) => {
    setEditing(ds);
    setEditOpen(true);
  };

  const submitEdit = async (patch) => {
    try {
      await dispatch(updateDataset({ id: editing.id, patch })).unwrap();
      setEditOpen(false);
      setEditing(null);
    } catch (requestError) {
      setUploadError(getApiErrorMessage(requestError, "Impossible de modifier ce dataset."));
    }
  };

  const downloadDataset = (dataset) => {
    try {
      const rows = JSON.parse(dataset.jsonData || "[]");
      if (!Array.isArray(rows)) throw new Error("Les données du dataset sont invalides.");
      const csv = Papa.unparse(rows);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `export_${dataset.name || "dataset"}.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (downloadError) {
      setUploadError(downloadError.message || "Impossible d'exporter ce dataset.");
    }
  };

  const visualizeDataset = (dataset) => {
    dispatch(setActiveDataset(dataset));
    try {
      localStorage.setItem("activeDatasetId", String(dataset.id));
    } catch {
      // ignore storage issues
    }
    navigate("/dashboard/visualisation");
  };

  if (status === "loading")
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin mb-2" />
        <p>Chargement des datasets...</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[1.6rem] border border-violet-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.055)]">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 p-3 text-white shadow-lg shadow-violet-200/70">
            <Database size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Sources de Données
          </h2>
        </div>

        <label className={`flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          Importer un Dataset
        </label>
      </div>

      {(uploadError || error) && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {uploadError || String(error)}
        </div>
      )}

      <section className="grid gap-3 rounded-[1.6rem] border border-violet-100 bg-white/90 p-4 shadow-[0_8px_24px_rgba(73,52,105,0.05)] sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-bold text-slate-500">
          Lignes min.
          <input type="number" min="0" value={minRows} onChange={(event) => setMinRows(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" />
        </label>
        <label className="text-xs font-bold text-slate-500">
          Lignes max.
          <input type="number" min="0" value={maxRows} onChange={(event) => setMaxRows(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" />
        </label>
        <label className="text-xs font-bold text-slate-500">
          Colonnes min.
          <input type="number" min="0" value={minCols} onChange={(event) => setMinCols(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" />
        </label>
        <label className="text-xs font-bold text-slate-500">
          Colonnes max.
          <input type="number" min="0" value={maxCols} onChange={(event) => setMaxCols(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" />
        </label>
        <label className="text-xs font-bold text-slate-500">
          Trier par
          <span className="mt-1 flex gap-2">
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800">
              <option value="name">Nom</option>
              <option value="rowsCount">Lignes</option>
              <option value="colsCount">Colonnes</option>
            </select>
            <button type="button" aria-label="Inverser l'ordre de tri" onClick={() => setSortDir((direction) => direction === "asc" ? "desc" : "asc")} className="rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </span>
        </label>
      </section>

      <section className="overflow-hidden rounded-[1.6rem] border border-violet-100 bg-white/90 shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Fichier
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Dimensions
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-16 text-center text-slate-400 italic"
                >
                  Aucun dataset trouvé pour “{searchTerm}”.
                </td>
              </tr>
            ) : (
              pageItems.map((ds) => (
                <tr
                  key={ds.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                        <FileSpreadsheet size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{ds.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Importé le {ds.uploadDate}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      {ds.rowsCount} lignes • {ds.colsCount} colonnes
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => visualizeDataset(ds)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Visualiser"
                      >
                        <PieChart size={16} />
                      </button>

                      <button
                        onClick={() => downloadDataset(ds)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Télécharger CSV"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => onArchive(ds.id)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Archiver"
                      >
                        <Archive size={16} />
                      </button>

                      <button
                        onClick={() => openEdit(ds)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        title="Renommer / Modifier"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(ds.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{filtered.length} dataset(s) · page {pageCount ? currentPage + 1 : 0} / {pageCount}</span>
          <div className="flex gap-2">
            <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Précédent</button>
            <button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Suivant</button>
          </div>
        </div>
      </section>

      {editOpen && <EditDatasetModal
        open={editOpen}
        dataset={editing}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSubmit={submitEdit}
      />}
    </div>
  );
};

export default DatasetsPage;
