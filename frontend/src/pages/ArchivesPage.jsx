import React, { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Database, ExternalLink, Search } from "lucide-react";
import { useDispatch } from "react-redux";
import api from "../api/axiosConfig";
import { fetchDatasets } from "../store/slices/datasetsSlice";

export default function ArchivesPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("saved");
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState("");
  const [query, setQuery] = useState("climat");
  const [publicDatasets, setPublicDatasets] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState("");

  const loadArchives = useCallback(async () => {
    setArchiveLoading(true);
    setArchiveError("");
    try {
      const response = await api.get("/datasets/archives");
      setArchived(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setArchiveError(
        error.response?.data?.message ||
          error.message ||
          "Impossible de charger les archives enregistrées."
      );
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  const searchPublicData = async (event) => {
    event.preventDefault();
    setPublicLoading(true);
    setPublicError("");
    try {
      const response = await fetch(
        `https://www.data.gouv.fr/api/1/datasets/?q=${encodeURIComponent(query)}&page_size=8`
      );
      if (!response.ok) throw new Error(`La recherche Open Data a échoué (${response.status}).`);
      const result = await response.json();
      setPublicDatasets(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setPublicError(error.message || "Impossible de joindre data.gouv.fr.");
      setPublicDatasets([]);
    } finally {
      setPublicLoading(false);
    }
  };

  const restoreDataset = async (dataset) => {
    setArchiveError("");
    try {
      await api.put(`/datasets/${dataset.id}/unarchive`);
      setArchived((current) => current.filter((item) => item.id !== dataset.id));
      dispatch(fetchDatasets());
    } catch (error) {
      setArchiveError(
        error.response?.data?.message ||
          error.message ||
          "Impossible de restaurer ce dataset."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-violet-100 bg-white/90 p-6 shadow-[0_8px_24px_rgba(73,52,105,0.055)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Bibliothèque</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Archives & catalogue public</h1>
        <p className="mt-1 text-sm text-slate-500">
          Retrouvez vos datasets archivés ou explorez les jeux publics de data.gouv.fr.
        </p>
        <div role="tablist" aria-label="Contenu des archives" className="mt-5 flex flex-wrap gap-2">
          <button role="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "saved" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Mes archives ({archived.length})
          </button>
          <button role="tab" aria-selected={tab === "public"} onClick={() => setTab("public")} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "public" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Explorer data.gouv.fr
          </button>
        </div>
      </section>

      {archiveError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{archiveError}</div>
      )}

      {tab === "saved" && (
        <section className="overflow-hidden rounded-[1.6rem] border border-violet-100 bg-white/90 shadow-sm">
          {archiveLoading ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">Chargement des archives...</div>
          ) : archived.length ? (
            <ul className="divide-y divide-slate-100">
              {archived.map((dataset) => (
                <li key={dataset.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-amber-50 p-3 text-amber-700"><Database size={20} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{dataset.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{dataset.rowsCount ?? 0} lignes · {dataset.colsCount ?? 0} colonnes · archivé le {dataset.uploadDate || "date inconnue"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => restoreDataset(dataset)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                    <ArchiveRestore size={16} /> Restaurer
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center">
              <ArchiveRestore className="mx-auto text-slate-300" size={28} />
              <p className="mt-3 font-bold text-slate-700">Aucune archive enregistrée</p>
              <p className="mt-1 text-sm text-slate-500">Les datasets archivés depuis vos sources apparaîtront ici.</p>
            </div>
          )}
        </section>
      )}

      {tab === "public" && (
        <>
          <form onSubmit={searchPublicData} className="flex flex-col gap-2 rounded-[1.6rem] border border-violet-100 bg-white/90 p-4 shadow-sm sm:flex-row">
            <label className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. population, transport, climat" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400" />
            </label>
            <button disabled={publicLoading || !query.trim()} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
              {publicLoading ? "Recherche..." : "Rechercher"}
            </button>
          </form>
          {publicError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{publicError}</div>}
          {publicDatasets.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {publicDatasets.map((dataset) => (
                <article key={dataset.id} className="rounded-[1.5rem] border border-violet-100 bg-white/90 p-5 shadow-sm">
                  <h2 className="font-black text-slate-900">{dataset.title}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Source : {dataset.organization?.name || "data.gouv.fr"}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <a href={dataset.page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline">
                      Voir sur data.gouv.fr <ExternalLink size={14} />
                    </a>
                    <span className="text-xs text-slate-400">{dataset.last_update?.slice(0, 10)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!publicDatasets.length && !publicLoading && !publicError && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Lancez une recherche pour consulter les données publiques.
            </div>
          )}
        </>
      )}
    </div>
  );
}
