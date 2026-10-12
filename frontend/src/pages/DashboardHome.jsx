import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDatasets, setActiveDataset } from "../store/slices/datasetsSlice";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  ArrowRight,
  BarChart3,
  Database,
  FilePlus2,
  Rows3,
  UsersRound,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const parseUploadDate = (value) => {
  if (!value) return 0;
  const parts = String(value).split("/");
  const date =
    parts.length === 3
      ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export default function DashboardHome() {
  const dispatch = useDispatch();
  const datasets = useSelector((state) => state.datasets.list);
  const status = useSelector((state) => state.datasets.status);
  const error = useSelector((state) => state.datasets.error);
  const recentDatasets = useMemo(
    () =>
      [...datasets]
        .sort((a, b) => parseUploadDate(b.uploadDate) - parseUploadDate(a.uploadDate))
        .slice(0, 5),
    [datasets]
  );

  const recordsCount = datasets.reduce(
    (total, dataset) => total + (Number(dataset.rowsCount) || 0),
    0
  );
  const sourceOwnersCount = new Set(
    datasets.map((dataset) => dataset.ownerId).filter(Boolean)
  ).size;
  const visualizableCount = datasets.filter(
    (dataset) => Number(dataset.rowsCount) > 0 && Number(dataset.colsCount) > 0
  ).length;

  const chartData = useMemo(
    () => ({
      labels: recentDatasets.map((dataset) => dataset.name),
      datasets: [
        {
          label: "Enregistrements",
          data: recentDatasets.map((dataset) => Number(dataset.rowsCount) || 0),
          backgroundColor: "rgba(165, 141, 241, 0.78)",
          hoverBackgroundColor: "rgba(139, 114, 220, 0.92)",
          borderRadius: 8,
          maxBarThickness: 36,
        },
      ],
    }),
    [recentDatasets]
  );

  const kpis = [
    { label: "Datasets", value: datasets.length, note: "jeux actifs", icon: <Database size={20} />, tone: "indigo" },
    { label: "Enregistrements", value: recordsCount.toLocaleString("fr-FR"), note: "lignes déclarées", icon: <Rows3 size={20} />, tone: "blue" },
    { label: "Sources identifiées", value: sourceOwnersCount, note: "propriétaires renseignés", icon: <UsersRound size={20} />, tone: "violet" },
    { label: "Visualisations possibles", value: visualizableCount, note: "datasets exploitables", icon: <BarChart3 size={20} />, tone: "cyan" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-[#fffaff] via-[#f2efff] to-[#e9e5ff] px-6 py-7 text-slate-800 shadow-[0_18px_50px_rgba(92,68,135,0.10)] sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Open Data Analytics
          </p>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Votre espace de données</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Explorez les datasets enregistrés, suivez leur volume et lancez une analyse à partir de données réelles.
          </p>
          <Link
            to="/dashboard/import"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/70 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            <FilePlus2 size={17} /> Importer un dataset <ArrowRight size={16} />
          </Link>
        </div>
        <div aria-hidden="true" className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[38px] border-white/45" />
        <div aria-hidden="true" className="absolute -bottom-32 right-36 h-64 w-64 rounded-full bg-pink-200/45 blur-2xl" />
      </section>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-sm font-semibold text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Impossible de charger les datasets : {String(error)}</span>
          <button
            type="button"
            onClick={() => dispatch(fetchDatasets())}
            className="shrink-0 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
          >
            Réessayer
          </button>
        </div>
      )}

      <section aria-label="Indicateurs des datasets" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, note, icon, tone }) => (
          <article key={label} className="rounded-[1.5rem] border border-violet-100/90 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(73,52,105,0.09)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                  {status === "loading" ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-100" /> : value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">{note}</p>
              </div>
              <span className={`rounded-xl p-3 ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : tone === "cyan" ? "bg-cyan-50 text-cyan-700" : "bg-indigo-50 text-indigo-700"}`}>
                {icon}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <article className="min-w-0 rounded-[1.6rem] border border-violet-100/90 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.055)] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Volume par dataset</h2>
              <p className="mt-1 text-sm text-slate-500">Nombre de lignes enregistré dans MongoDB</p>
            </div>
            <BarChart3 className="shrink-0 text-indigo-600" size={20} />
          </div>
          {status === "loading" ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
          ) : status === "failed" ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/40 text-center">
              <Database className="text-rose-300" size={28} />
              <p className="mt-3 text-sm font-bold text-slate-700">Données indisponibles</p>
              <p className="mt-1 text-xs text-slate-500">La connexion à l’API a échoué.</p>
            </div>
          ) : recentDatasets.length ? (
            <div className="h-64">
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: "#64748b" } },
                    y: { beginAtZero: true, ticks: { precision: 0, color: "#64748b" }, grid: { color: "#f1f5f9" } },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <Database className="text-slate-300" size={28} />
              <p className="mt-3 text-sm font-bold text-slate-700">Aucune donnée à représenter</p>
              <p className="mt-1 text-xs text-slate-500">Importez un dataset pour afficher les volumes.</p>
            </div>
          )}
        </article>

        <article className="rounded-[1.6rem] border border-violet-100/90 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.055)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Datasets récents</h2>
              <p className="mt-1 text-sm text-slate-500">Derniers imports disponibles</p>
            </div>
            <Link to="/dashboard/datasets" className="text-sm font-bold text-indigo-700 hover:text-indigo-900">
              Tout voir
            </Link>
          </div>
          {status === "loading" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-50" />)}
            </div>
          ) : recentDatasets.length ? (
            <ul className="divide-y divide-slate-100">
              {recentDatasets.map((dataset) => (
                <li key={dataset.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{dataset.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{dataset.rowsCount ?? 0} lignes · {dataset.colsCount ?? 0} colonnes</p>
                  </div>
                  <Link
                    to="/dashboard/visualisation"
                    onClick={() => {
                      dispatch(setActiveDataset(dataset));
                      try {
                        localStorage.setItem("activeDatasetId", String(dataset.id));
                      } catch {
                        // The active dataset remains available in Redux for this session.
                      }
                    }}
                    className="shrink-0 rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                    aria-label={`Visualiser ${dataset.name}`}
                  >
                    <ArrowRight size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
              <p className="text-sm font-bold text-slate-700">Aucun dataset récent</p>
              <Link to="/dashboard/import" className="mt-2 inline-block text-sm font-semibold text-indigo-700 hover:underline">Commencer un import</Link>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
