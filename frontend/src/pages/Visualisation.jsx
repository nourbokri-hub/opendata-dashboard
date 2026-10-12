import React, { useDeferredValue, useMemo, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import Papa from "papaparse";
import {
  Activity,
  BarChart3,
  Database,
  Download,
  FileDown,
  Filter,
  Hash,
  Layers3,
  Search,
  Table2,
} from "lucide-react";

import { fetchDatasets, setActiveDataset } from "../store/slices/datasetsSlice";
import { setVizState } from "../store/slices/uiSlice";
import {
  buildHistogram,
  getDatasetColumns,
  getNumericColumns,
  getNumericStats,
  parseNumericValue,
} from "../utils/visualizationData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const safeLower = (v) => String(v ?? "").toLowerCase();
const chartPalette = [
  "#9a83df",
  "#d995b0",
  "#7e9bd0",
  "#a8a0d8",
  "#d4a6bd",
  "#8db7ad",
  "#b8a2cf",
  "#dfb98f",
];
const formatStat = (value) => Number(value).toLocaleString("fr-FR", {
  maximumFractionDigits: 2,
});
const buildChartDataset = (label, data, chartType) => ({
  label,
  data,
  backgroundColor: chartType === "pie" ? chartPalette : "rgba(154, 131, 223, 0.78)",
  borderColor: chartType === "line" ? "#9a83df" : "rgba(154, 131, 223, 0.78)",
  borderWidth: chartType === "line" ? 3 : 1,
  borderRadius: chartType === "bar" || chartType === "histogram" ? 8 : 0,
  pointBackgroundColor: "#d995b0",
  pointBorderColor: "#ffffff",
  pointBorderWidth: 2,
  pointRadius: chartType === "line" ? 3 : 0,
  tension: 0.35,
  fill: chartType === "line",
});

const getInitialVizState = (datasetId, columns, persistedViz, numericColumns = []) => {
  const defaults = {
    datasetId,
    xKey: columns[0],
    yKey: numericColumns.find((column) => column !== columns[0]) || numericColumns[0] || columns[1] || columns[0],
    chartType: "bar",
    searchRows: "",
    filterCol: columns[0],
    filterOp: "contains",
    filterVal: "",
    aggregate: true,
    aggFn: numericColumns.length ? "sum" : "count",
    selectedColumns: columns.slice(0, 8),
    statsColumn: numericColumns[0] || "",
  };
  let next = defaults;

  try {
    const raw = localStorage.getItem(`vizState_${datasetId}`);
    if (raw) {
      next = { ...defaults, ...JSON.parse(raw), datasetId };
    } else if (persistedViz?.datasetId === datasetId) {
      next = { ...defaults, ...persistedViz, datasetId };
    }
  } catch {
    next = defaults;
  }

  const safeKey = (key, fallback) => columns.includes(key) ? key : fallback;
  const chartType = ["bar", "line", "pie", "histogram"].includes(next.chartType) ? next.chartType : "bar";
  const selectedColumns = Array.isArray(next.selectedColumns)
    ? next.selectedColumns.filter((column) => columns.includes(column))
    : [];
  return {
    xKey: chartType === "histogram" && !numericColumns.includes(next.xKey)
      ? numericColumns[0] || columns[0]
      : safeKey(next.xKey, columns[0]),
    yKey: numericColumns.length
      ? numericColumns.includes(next.yKey) ? next.yKey : numericColumns[0]
      : safeKey(next.yKey, columns[1] || columns[0]),
    chartType,
    searchRows: String(next.searchRows ?? ""),
    filterCol: safeKey(next.filterCol, columns[0]),
    filterOp: ["contains", "equals", "gt", "lt"].includes(next.filterOp) ? next.filterOp : "contains",
    filterVal: String(next.filterVal ?? ""),
    aggregate: Boolean(next.aggregate),
    aggFn: numericColumns.length && ["sum", "avg", "count"].includes(next.aggFn)
      ? next.aggFn
      : numericColumns.length ? "sum" : "count",
    selectedColumns: selectedColumns.length ? selectedColumns : columns.slice(0, 8),
    statsColumn: numericColumns.includes(next.statsColumn)
      ? next.statsColumn
      : numericColumns[0] || "",
  };
};

export default function Visualisation() {
  const dispatch = useDispatch();
  const datasets = useSelector((state) => state.datasets.list);
  const activeDataset = useSelector((state) => state.datasets.activeDataset);
  const datasetStatus = useSelector((state) => state.datasets.status);
  const datasetError = useSelector((state) => state.datasets.error);
  const persistedViz = useSelector((state) => state.ui.vizState);
  const availableDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.archived !== true),
    [datasets]
  );
  const selectedDataset = useMemo(
    () => availableDatasets.find(
      (dataset) => String(dataset.id) === String(activeDataset?.id)
    ) || availableDatasets[0] || null,
    [activeDataset?.id, availableDatasets]
  );

  useEffect(() => {
    if (datasetStatus === "idle") dispatch(fetchDatasets());
  }, [datasetStatus, dispatch]);

  useEffect(() => {
    if (!selectedDataset || String(activeDataset?.id) === String(selectedDataset.id)) return;
    dispatch(setActiveDataset(selectedDataset));
    try {
      localStorage.setItem("activeDatasetId", String(selectedDataset.id));
    } catch {
      // Keep the current selection available for this session.
    }
  }, [activeDataset?.id, dispatch, selectedDataset]);

  const selectDataset = (event) => {
    const dataset = availableDatasets.find(
      (item) => String(item.id) === event.target.value
    );
    if (!dataset) return;
    dispatch(setActiveDataset(dataset));
    try {
      localStorage.setItem("activeDatasetId", String(dataset.id));
    } catch {
      // Keep the selected dataset available for the current session.
    }
  };

  const { selectedRows, datasetParseError } = useMemo(() => {
    if (!selectedDataset) return { selectedRows: [], datasetParseError: "" };
    try {
      const parsedRows = typeof selectedDataset.jsonData === "string"
        ? JSON.parse(selectedDataset.jsonData || "[]")
        : selectedDataset.jsonData;
      if (!Array.isArray(parsedRows) || parsedRows.some(
        (row) => !row || typeof row !== "object" || Array.isArray(row)
      )) {
        return {
          selectedRows: [],
          datasetParseError: "Les données de ce dataset ne sont pas sous forme de lignes JSON valides.",
        };
      }
      return { selectedRows: parsedRows, datasetParseError: "" };
    } catch {
      return {
        selectedRows: [],
        datasetParseError: "Les données de ce dataset ne sont pas un JSON valide.",
      };
    }
  }, [selectedDataset]);
  const datasetColumns = useMemo(() => getDatasetColumns(selectedRows), [selectedRows]);

  if (!selectedDataset && (datasetStatus === "idle" || datasetStatus === "loading")) {
    return (
      <div role="status" className="flex min-h-72 items-center justify-center rounded-[1.8rem] border border-violet-100 bg-white/90 text-sm font-semibold text-slate-500 shadow-sm">
        Chargement des datasets accessibles...
      </div>
    );
  }

  if (!selectedDataset) {
    return (
      <div className="space-y-5">
        <section className="rounded-[1.8rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-pink-50 p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 text-violet-600">
            <BarChart3 size={22} />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">Exploration de données</p>
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Visualisation</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Choisissez un dataset accessible pour explorer ses colonnes, filtrer les lignes et créer des graphiques.
          </p>
        </section>
        {datasetError ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            Impossible de charger vos datasets : {String(datasetError)}
            <button type="button" onClick={() => dispatch(fetchDatasets())} className="ml-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-rose-700">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-dashed border-violet-200 bg-white/80 p-10 text-center">
            <Database className="mx-auto text-violet-300" size={34} />
            <h2 className="mt-4 text-lg font-black text-slate-800">Aucun dataset disponible</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Importez un fichier CSV ou JSON, ou choisissez un jeu déjà présent dans vos sources de données.
            </p>
            <a href="/dashboard/import" className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
              Importer un dataset
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-pink-50 p-6 shadow-[0_12px_36px_rgba(73,52,105,0.06)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-700 ring-1 ring-violet-100">
              <Activity size={13} /> Studio d’analyse
            </p>
            <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Visualisation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Explorez les valeurs de vos données, composez une vue et exportez les résultats.
            </p>
          </div>
          <div className="w-full lg:max-w-sm">
            <label htmlFor="visualisation-dataset" className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Dataset à analyser
            </label>
            <select
              id="visualisation-dataset"
              value={selectedDataset.id}
              onChange={selectDataset}
              className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {availableDatasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name || "Dataset sans nom"} · {dataset.rowsCount ?? "?"} lignes
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {datasetParseError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
          {datasetParseError}
        </div>
      ) : !selectedRows.length ? (
        <div className="rounded-[1.8rem] border border-dashed border-violet-200 bg-white/90 p-10 text-center">
          <Database className="mx-auto text-violet-300" size={32} />
          <h2 className="mt-3 font-black text-slate-800">Ce dataset ne contient aucune ligne</h2>
          <p className="mt-1 text-sm text-slate-500">Choisissez un autre dataset ou importez des données pour commencer.</p>
        </div>
      ) : !datasetColumns.length ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
          Aucune colonne n’a été trouvée dans ce dataset.
        </div>
      ) : (
        <VisualisationEditor
          key={selectedDataset.id}
          activeDataset={selectedDataset}
          persistedViz={persistedViz}
          rows={selectedRows}
        />
      )}
    </div>
  );
}

function VisualisationEditor({ activeDataset, persistedViz, rows }) {
  const dispatch = useDispatch();
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const columns = useMemo(() => getDatasetColumns(rows), [rows]);
  const numericColumns = useMemo(
    () => getNumericColumns(rows, columns),
    [columns, rows]
  );

  const [initialViz] = useState(() =>
    getInitialVizState(activeDataset.id, columns, persistedViz, numericColumns)
  );
  const [xKey, setXKey] = useState(initialViz.xKey);
  const [yKey, setYKey] = useState(initialViz.yKey);
  const [chartType, setChartType] = useState(initialViz.chartType);
  const [searchRows, setSearchRows] = useState(initialViz.searchRows);
  const deferredSearchRows = useDeferredValue(searchRows);
  const [filterCol, setFilterCol] = useState(initialViz.filterCol);
  const [filterOp, setFilterOp] = useState(initialViz.filterOp);
  const [filterVal, setFilterVal] = useState(initialViz.filterVal);
  const deferredFilterVal = useDeferredValue(filterVal);
  const [aggregate, setAggregate] = useState(initialViz.aggregate);
  const [aggFn, setAggFn] = useState(initialViz.aggFn);
  const [selectedColumns, setSelectedColumns] = useState(initialViz.selectedColumns || columns.slice(0, 8));
  const [statsColumn, setStatsColumn] = useState(
    numericColumns.includes(initialViz.statsColumn) ? initialViz.statsColumn : numericColumns[0] || ""
  );
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);

  // Keep Redux + localStorage synced (so Visualisation & Sources de données stay coherent)
  useEffect(() => {
    const id = activeDataset?.id;
    if (!id) return;
    const snapshot = {
      datasetId: id,
      xKey,
      yKey,
      chartType,
      searchRows,
      filterCol,
      filterOp,
      filterVal,
      aggregate,
      aggFn,
      selectedColumns,
      statsColumn,
    };
    dispatch(setVizState(snapshot));
    try {
      localStorage.setItem(`vizState_${id}`, JSON.stringify(snapshot));
    } catch {
      // ignore
    }
  }, [activeDataset?.id, xKey, yKey, chartType, searchRows, filterCol, filterOp, filterVal, aggregate, aggFn, selectedColumns, statsColumn, dispatch]);

const filteredRows = useMemo(() => {
  const q = safeLower(deferredSearchRows).trim();
  const filterText = safeLower(deferredFilterVal);
  const filterTarget = parseNumericValue(deferredFilterVal);

  return rows.filter((r) => {
    if (q) {
      let anyMatch = false;
      for (const key in r) {
        if (Object.prototype.hasOwnProperty.call(r, key) && safeLower(r[key]).includes(q)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
    }

    if (deferredFilterVal === "") return true;

    const raw = r?.[filterCol];
    const asText = String(raw ?? "");

    if (filterOp === "equals") {
      return safeLower(asText) === filterText;
    }

    if (filterOp === "gt" || filterOp === "lt") {
      const value = parseNumericValue(raw);
      if (value === null || filterTarget === null) return false;
      return filterOp === "gt" ? value > filterTarget : value < filterTarget;
    }

    return safeLower(asText).includes(filterText);
  });
}, [rows, deferredSearchRows, filterCol, filterOp, deferredFilterVal]);

const chartData = useMemo(() => {
  const src = filteredRows;

  const buildAggregated = () => {
    const map = new Map();
    const categoryLimit = chartType === "pie" ? 12 : 20;

    for (const r of src) {
      const k = String(r?.[xKey] ?? "");
      const n = parseNumericValue(r?.[yKey]);

      if (!map.has(k)) {
        if (map.size >= categoryLimit) continue;
        map.set(k, { sum: 0, count: 0, rows: 0 });
      }
      const cur = map.get(k);
      cur.rows += 1;
      if (n !== null) {
        cur.sum += n;
        cur.count += 1;
      }
    }

    const labels = Array.from(map.keys());
    const values = labels.map((k) => {
      const cur = map.get(k);
      if (aggFn === "count") return cur.rows;
      if (!cur.count) return null;
      if (aggFn === "avg") return cur.sum / cur.count;
      return cur.sum;
    });

    const labelName =
      aggFn === "count"
        ? "Nombre de lignes"
        : aggFn === "avg"
        ? `avg(${yKey})`
        : `sum(${yKey})`;

    return {
      labels,
      datasets: [buildChartDataset(`${labelName} par ${xKey}`, values, chartType)],
    };
  };

  const buildRaw = () => {
    const sliced = src.slice(0, 20);

    const labels = sliced.map((r) => String(r?.[xKey] ?? ""));
    const values = sliced.map((r) => parseNumericValue(r?.[yKey]));

    return {
      labels,
      datasets: [buildChartDataset(`${yKey} par ${xKey}`, values, chartType)],
    };
  };

  if (chartType === "histogram") {
    const histogram = buildHistogram(filteredRows, xKey);
    return {
      labels: histogram.labels,
      datasets: [buildChartDataset(`Nombre de valeurs · ${xKey}`, histogram.values, chartType)],
    };
  }

  return aggregate ? buildAggregated() : buildRaw();
}, [filteredRows, xKey, yKey, aggregate, aggFn, chartType]);

  const numericStats = useMemo(
    () => (statsColumn ? getNumericStats(filteredRows, statsColumn) : null),
    [filteredRows, statsColumn]
  );
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    plugins: {
      legend: { display: chartType === "pie", position: "bottom", labels: { usePointStyle: true, padding: 18 } },
      tooltip: { backgroundColor: "#392c4d", padding: 12, cornerRadius: 10 },
    },
    scales: chartType === "pie" ? {} : {
      x: { grid: { display: false }, ticks: { color: "#756783", maxRotation: 35, minRotation: 0 } },
      y: { beginAtZero: true, ticks: { precision: 2, color: "#756783" }, grid: { color: "rgba(225, 216, 239, 0.65)" } },
    },
  }), [chartType]);

  const getChartPngDataUrl = async () => {
    // Prefer native Chart.js export (more reliable than html2canvas)
    const chart = chartInstanceRef.current;
    if (chart && typeof chart.toBase64Image === "function") {
      return chart.toBase64Image();
    }

    // Fallback
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(chartContainerRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  };

  const exportPNG = async () => {
    const dataUrl = await getChartPngDataUrl();
    const link = document.createElement("a");
    link.download = `${activeDataset.name || "chart"}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const imgData = await getChartPngDataUrl();
    const pdf = new jsPDF({ orientation: "landscape" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(14);
    pdf.text(`Export — ${activeDataset.name || "dataset"}`, 14, 14);

    // Keep margins & aspect ratio
    const margin = 14;
    const imgW = pageW - margin * 2;
    const imgH = pageH - margin * 2 - 10;
    pdf.addImage(imgData, "PNG", margin, 22, imgW, imgH, undefined, "FAST");
    pdf.save(`${activeDataset.name || "chart"}.pdf`);
  };

  const exportCSV = () => {
    const exportRows = filteredRows.map((row) =>
      Object.fromEntries(selectedColumns.map((column) => [column, row?.[column] ?? ""]))
    );
    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeDataset.name || "dataset"}_export.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const runExport = async (exporter) => {
    setExportError("");
    setExporting(true);
    try {
      await exporter();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "L'export a échoué.");
    } finally {
      setExporting(false);
    }
  };

  const uniqueFilterValues = useMemo(() => {
    const col = filterCol;
    if (!col) return [];
    const set = new Set();
    for (const r of rows) {
      const v = String(r?.[col] ?? "").trim();
      if (!v) continue;
      set.add(v);
      if (set.size >= 12) break;
    }
    return Array.from(set);
  }, [rows, filterCol]);
  const isFilterPending =
    searchRows !== deferredSearchRows || filterVal !== deferredFilterVal;

  const toggleColumn = (column) => {
    setSelectedColumns((current) => {
      if (current.includes(column)) {
        return current.length > 1 ? current.filter((item) => item !== column) : current;
      }
      return [...current, column];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-violet-100">
          <Database size={14} className="text-violet-500" /> {activeDataset.name || "Dataset"}
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-violet-100">{rows.length.toLocaleString("fr-FR")} lignes</span>
        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-violet-100">{columns.length} colonnes</span>
      </div>

      <section className="rounded-[1.7rem] border border-violet-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.05)] sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Layers3 size={18} className="text-violet-600" />
          <h2 className="font-black text-slate-800">Paramètres du graphique</h2>
        </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-[#faf8fd] p-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
            {chartType === "histogram" ? "Colonne numérique" : "Axe X · catégorie"}
          </label>
          <select
            value={xKey}
            onChange={(e) => setXKey(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-violet-100 bg-white p-3 text-sm font-semibold"
          >
            {(chartType === "histogram" ? numericColumns : columns).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-[#faf8fd] p-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
            Axe Y · valeur numérique
          </label>
          <select
            value={yKey}
            onChange={(e) => setYKey(e.target.value)}
            disabled={!numericColumns.length}
            className="mt-2 w-full rounded-2xl border border-violet-100 bg-white p-3 text-sm font-semibold disabled:opacity-50"
          >
            {(numericColumns.length ? numericColumns : columns).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {!numericColumns.length && <p className="mt-2 text-xs text-slate-500">Aucune colonne numérique détectée.</p>}
        </div>

        <div className="rounded-2xl bg-[#faf8fd] p-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
            Type de visualisation
          </label>
          <select
            value={chartType}
            onChange={(e) => {
              const nextType = e.target.value;
              setChartType(nextType);
              if (nextType === "histogram" && numericColumns.length && !numericColumns.includes(xKey)) {
                setXKey(numericColumns[0]);
              }
            }}
            className="mt-2 w-full rounded-2xl border border-violet-100 bg-white p-3 text-sm font-semibold"
          >
            <option value="bar">Barres</option>
            <option value="line">Courbe</option>
            <option value="pie">Secteurs</option>
            <option value="histogram" disabled={!numericColumns.length}>Histogramme numérique</option>
          </select>
        </div>
      </div>
      <div className="mt-5 border-t border-violet-100 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Table2 size={17} className="text-violet-600" />
          <span className="text-sm font-bold text-slate-700">Colonnes de l’aperçu</span>
          <span className="text-xs text-slate-400">({selectedColumns.length} sélectionnée{selectedColumns.length > 1 ? "s" : ""})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <label key={column} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedColumns.includes(column) ? "border-violet-200 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-500 hover:border-violet-200"}`}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={() => toggleColumn(column)}
                className="accent-violet-600"
              />
              <span>{column}</span>
              {numericColumns.includes(column) && <Hash size={12} className="text-violet-400" aria-label="Colonne numérique" />}
            </label>
          ))}
        </div>
      </div>
      </section>

<div className="rounded-[1.6rem] border border-violet-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.05)]">
  <div className="mb-4 flex items-center gap-2">
    <Filter size={17} className="text-violet-600" />
    <h2 className="font-black text-slate-800">Rechercher et filtrer</h2>
  </div>
  <div className="grid gap-3 md:grid-cols-3">
    <div className="md:col-span-1">
      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
        Recherche globale
      </label>
      <input
        aria-label="Recherche globale dans les lignes"
        value={searchRows}
        onChange={(e) => setSearchRows(e.target.value)}
        placeholder="Rechercher dans toutes les colonnes..."
        className="mt-2 w-full rounded-2xl border border-violet-100 bg-[#faf8fd] p-3 text-sm"
      />
      {isFilterPending && (
        <span role="status" className="mt-2 block text-xs font-semibold text-violet-600">
          Mise à jour du filtre…
        </span>
      )}
    </div>

    <div className="md:col-span-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400">
        Filtrer les lignes par colonne
      </label>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <select
          value={filterCol}
          onChange={(e) => setFilterCol(e.target.value)}
          className="rounded-2xl border border-violet-100 bg-[#faf8fd] p-3 text-sm"
        >
          {columns.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterOp}
          onChange={(e) => setFilterOp(e.target.value)}
          className="rounded-2xl border border-violet-100 bg-[#faf8fd] p-3 text-sm"
        >
          <option value="contains">contient</option>
          <option value="equals">égal</option>
          <option value="gt">&gt;</option>
          <option value="lt">&lt;</option>
        </select>

        <input
          aria-label="Valeur du filtre de colonne"
          value={filterVal}
          onChange={(e) => setFilterVal(e.target.value)}
          placeholder="valeur…"
          className="rounded-2xl border border-violet-100 bg-[#faf8fd] p-3 text-sm"
        />

        <button
          type="button"
          onClick={() => {
            setFilterVal("");
            setSearchRows("");
          }}
          className="rounded-2xl bg-violet-100 px-4 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-200"
        >
          Reset
        </button>
      </div>

      {uniqueFilterValues.length > 0 && filterOp !== "gt" && filterOp !== "lt" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest mr-1">
            Suggestions
          </span>
          {uniqueFilterValues.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterVal(v)}
              className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800 transition hover:border-violet-300 hover:bg-violet-100"
              title="Appliquer cette valeur"
            >
              {v.length > 24 ? `${v.slice(0, 24)}…` : v}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>

  <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={aggregate}
        onChange={(e) => setAggregate(e.target.checked)}
      />
      Regrouper par {xKey} (agrégation)
    </label>

    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-500">Fonction :</span>
      <select
        value={aggFn}
        onChange={(e) => setAggFn(e.target.value)}
        disabled={!aggregate}
        className="p-2 rounded-2xl bg-slate-50 border border-slate-100 disabled:opacity-50"
      >
        <option value="sum">somme</option>
        <option value="avg">moyenne</option>
        <option value="count">count</option>
      </select>
    </div>

    <div className="ml-auto text-sm font-semibold text-slate-500">
      Lignes: <span className="text-slate-900 font-black">{filteredRows.length}</span> / {rows.length}
    </div>
  </div>
</div>


      <section className="rounded-[1.7rem] border border-violet-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(73,52,105,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-800">Statistiques descriptives</h2>
            <p className="mt-1 text-xs text-slate-500">Calculées sur les lignes visibles après application des filtres.</p>
          </div>
          {numericColumns.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              Colonne
              <select
                value={statsColumn}
                onChange={(event) => setStatsColumn(event.target.value)}
                className="rounded-xl border border-violet-100 bg-[#faf8fd] px-3 py-2 text-sm text-slate-700"
              >
                {numericColumns.map((column) => <option key={column} value={column}>{column}</option>)}
              </select>
            </label>
          )}
        </div>
        {numericColumns.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-[#faf8fd] px-4 py-5 text-sm text-slate-500">
            Aucune colonne numérique n’est disponible dans ce dataset.
          </p>
        ) : numericStats ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Valeurs valides", numericStats.count.toLocaleString("fr-FR")],
              ["Minimum", formatStat(numericStats.min)],
              ["Maximum", formatStat(numericStats.max)],
              ["Moyenne", formatStat(numericStats.average)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-violet-50 bg-[#faf8fd] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-2 break-all text-xl font-black text-violet-800">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#faf8fd] px-4 py-5 text-sm text-slate-500">
            Aucune valeur numérique valide pour cette colonne avec les filtres actuels.
          </p>
        )}
      </section>

      <div
        ref={chartContainerRef}
        className="rounded-[1.7rem] border border-violet-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(73,52,105,0.06)] sm:p-6"
      >
          {filteredRows.length === 0 || chartData.labels.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <Search className="text-violet-300" size={30} />
              <h3 className="mt-3 font-black text-slate-800">Aucune donnée à représenter</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">Ajustez les filtres ou essayez une autre colonne pour construire le graphique.</p>
            </div>
          ) : (
            <div className="h-[360px]">
              {chartType === "bar" && <Bar ref={chartInstanceRef} data={chartData} options={chartOptions} />}
              {chartType === "line" && <Line ref={chartInstanceRef} data={chartData} options={chartOptions} />}
              {chartType === "pie" && <Pie ref={chartInstanceRef} data={chartData} options={chartOptions} />}
              {chartType === "histogram" && <Bar ref={chartInstanceRef} data={chartData} options={chartOptions} />}
            </div>
          )}
        </div>

<section className="overflow-hidden rounded-[1.7rem] border border-violet-100 bg-white/90 shadow-sm">
  <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 p-5 text-lg font-black text-slate-900"><Table2 size={18} className="text-violet-600" /> Aperçu des données</h2>
      <span className="pr-5 text-xs font-semibold text-slate-500">10 premières · après filtres</span>
  </div>

  <div className="overflow-x-auto">
  <table className="w-full text-sm">
      <thead className="bg-[#faf8fd]">
        <tr className="text-left text-slate-500">
          {selectedColumns.map((c) => (
          <th key={c} className="py-2 pr-3 font-black">
            {c}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {filteredRows.slice(0, 10).map((r, idx) => (
        <tr key={idx} className="border-t border-slate-100">
          {selectedColumns.map((c) => (
            <td key={c} className="py-2 pr-3 text-slate-700">
              {String(r?.[c] ?? "")}
            </td>
          ))}
        </tr>
      ))}
      {filteredRows.length === 0 && (
        <tr><td colSpan={selectedColumns.length} className="px-4 py-8 text-center text-slate-500">Aucune ligne ne correspond aux filtres.</td></tr>
      )}
    </tbody>
  </table>
  </div>

  {selectedColumns.length < columns.length && (
    <p className="border-t border-violet-50 px-5 py-3 text-xs font-semibold text-slate-400">
      Aperçu limité aux colonnes sélectionnées. Modifiez la sélection dans les paramètres du graphique.
    </p>
  )}
</section>

      {exportError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {exportError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => runExport(exportPDF)}
          disabled={exporting}
          className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs tracking-widest hover:bg-indigo-700 flex items-center gap-2"
        >
          <FileDown size={16} /> {exporting ? "Export..." : "Export PDF"}
        </button>

        <button
          type="button"
          onClick={() => runExport(exportPNG)}
          disabled={exporting}
          className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={16} /> {exporting ? "Export..." : "Export PNG"}
        </button>

        <button
          type="button"
          onClick={() => runExport(exportCSV)}
          disabled={exporting}
          className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs tracking-widest hover:border-indigo-200 flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? "Export..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}
