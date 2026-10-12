import React, { useRef, useState } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseDatasetFile } from "../utils/datasetParser";

export default function UploadDataset({ onDataLoaded }) {
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const parseFile = async (file) => {
    setStatus("loading");
    setError("");
    try {
      const parsed = await parseDatasetFile(file);
      onDataLoaded(parsed);
      setStatus("success");
    } catch (parseError) {
      setStatus("error");
      setError(parseError.message || "Erreur lors de la lecture du fichier.");
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    setFileName(file.name);
    parseFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onBrowse = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  return (
    <div className="rounded-[1.7rem] border border-violet-100 bg-white/90 p-6 shadow-[0_8px_24px_rgba(73,52,105,0.055)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Importer un dataset</h3>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Glissez-déposez un fichier CSV ou JSON, ou cliquez pour choisir un fichier.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black tracking-widest text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          CHOISIR UN FICHIER
        </button>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="mt-5 cursor-pointer rounded-[1.6rem] border-2 border-dashed border-violet-200 bg-[#faf8fd] p-8 transition hover:border-violet-300 hover:bg-violet-50/70"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <UploadCloud size={22} />
          </div>

          <div className="text-sm font-black text-slate-900">
            Déposez votre fichier ici
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Formats supportés : <span className="font-black">CSV et JSON</span>
          </div>

          {fileName && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-100 px-3 py-2 rounded-2xl">
              <FileText size={14} />
              {fileName}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onClick={(event) => event.stopPropagation()}
          onChange={onBrowse}
        />
      </div>

      {/* Status */}
      <div className="mt-4">
        {status === "loading" && (
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Lecture du fichier...
          </div>
        )}

        {status === "success" && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-2">
            <CheckCircle2 size={16} /> Fichier lu avec succès. Enregistrez-le pour le conserver.
          </div>
        )}

        {status === "error" && (
          <div className="text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
