import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { Trash2, ArchiveRestore, Archive, RefreshCw, Users, Database } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("stats"); // stats | users | datasets
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [datasets, setDatasets] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, datasetsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/datasets"),
      ]);
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDatasets(Array.isArray(datasetsRes.data) ? datasetsRes.data : []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors du chargement des données admin."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onDeleteUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de la suppression de l'utilisateur."
      );
    } finally {
      setLoading(false);
    }
  };

  const onDeleteDataset = async (id) => {
    if (!window.confirm("Supprimer ce dataset ?")) return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`/admin/datasets/${id}`);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de la suppression du dataset."
      );
    } finally {
      setLoading(false);
    }
  };

  const onToggleArchive = async (id) => {
    setLoading(true);
    setError("");
    try {
      const dataset = datasets.find((item) => item.id === id);
      const nextArchived = !dataset?.archived;
      await api.put(`/admin/datasets/${id}/${nextArchived ? "archive" : "unarchive"}`);
      setDatasets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, archived: nextArchived } : d))
      );
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de l'archivage/désarchivage."
      );
    } finally {
      setLoading(false);
    }
  };

  const archivedCount = useMemo(() => {
    return datasets.filter((d) => d.archived === true).length;
  }, [datasets]);

  const card = (title, value, icon) => (
    <div className="flex items-center gap-4 rounded-[1.5rem] border border-violet-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.055)]">
      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-slate-500 text-sm">{title}</div>
        <div className="text-slate-900 text-2xl font-black tracking-tight">
          {value ?? "—"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Administration
          </h1>
          <p className="text-slate-500 mt-1">
            Gestion des utilisateurs, des datasets et statistiques.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          disabled={loading}
          title="Rafraîchir"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Rafraîchir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-2 rounded-2xl border border-violet-100 bg-white/90 p-2 shadow-sm">
        {[
          { key: "stats", label: "Stats" },
          { key: "users", label: "Utilisateurs" },
          { key: "datasets", label: "Datasets" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === t.key
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
          {error}
        </div>
      ) : null}

      {/* Content */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {card(
            "Utilisateurs",
            stats?.usersCount ?? users.length,
            <Users size={18} />
          )}
          {card(
            "Datasets",
            stats?.datasetsCount ?? datasets.length,
            <Database size={18} />
          )}
          {card(
            "Archives",
            stats?.archivedDatasetsCount ?? archivedCount,
            <Archive size={18} />
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="overflow-hidden rounded-[1.6rem] border border-violet-100 bg-white/90 shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">Liste des utilisateurs</div>
            <div className="text-slate-500 text-sm">
              {users.length} utilisateur(s)
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">{u.username || u.name || "—"}</td>
                    <td className="px-4 py-3">{u.email || "—"}</td>
                    <td className="px-4 py-3">{u.role || u.roles || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                          disabled={loading}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-6 text-slate-500"
                      colSpan={5}
                    >
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "datasets" && (
        <div className="overflow-hidden rounded-[1.6rem] border border-violet-100 bg-white/90 shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">Tous les datasets</div>
            <div className="text-slate-500 text-sm">
              {datasets.length} dataset(s)
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Lignes</th>
                  <th className="px-4 py-3">Colonnes</th>
                  <th className="px-4 py-3">État</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {datasets.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{d.id}</td>
                    <td className="px-4 py-3">{d.name || "—"}</td>
                    <td className="px-4 py-3">{d.rowsCount ?? "—"}</td>
                    <td className="px-4 py-3">{d.colsCount ?? "—"}</td>
                    <td className="px-4 py-3">
                      {d.archived ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Archivé
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onToggleArchive(d.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                          disabled={loading}
                          title={d.archived ? "Désarchiver" : "Archiver"}
                        >
                          {d.archived ? (
                            <>
                              <ArchiveRestore size={18} />
                              Désarchiver
                            </>
                          ) : (
                            <>
                              <Archive size={18} />
                              Archiver
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onDeleteDataset(d.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                          disabled={loading}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {datasets.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Aucun dataset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-slate-500 flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          Chargement...
        </div>
      )}
    </div>
  );
}
