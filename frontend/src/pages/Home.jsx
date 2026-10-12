import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux"; // ✅ Redux

import {
  Shield,
  Database,
  BarChart3,
  Filter,
  FileDown,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Download,
} from "lucide-react";

import imgDonnees from "../assets/imgs/donnees.jpg";
import imgExploit from "../assets/imgs/exploit.jpg";
import imgMedical from "../assets/imgs/medical.jpg";

export default function Home() {
    const token = useSelector((state) => state.auth.token);

  const primaryCta = token ? (
    <Link
      to="/dashboard"
      className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:bg-indigo-700"
    >
      Accéder au dashboard <ArrowRight size={16} />
    </Link>
  ) : (
    <Link
      to="/login"
      className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:bg-indigo-700"
    >
      Se connecter <ArrowRight size={16} />
    </Link>
  );

  const secondaryCta = token ? (
    <Link
      to="/dashboard/import"
      className="px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:border-indigo-200"
    >
      Importer un dataset
    </Link>
  ) : (
    <Link
      to="/register"
      className="px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:border-indigo-200"
    >
      Créer un compte
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcfaff] via-[#faf8fd] to-[#f6eff8]">
      {/* Navbar */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-black tracking-tight text-xl text-slate-900">
          Public Data Dashboard
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
          <a href="#features" className="hover:text-indigo-700">
            Fonctionnalités
          </a>
          <a href="#workflow" className="hover:text-indigo-700">
            Workflow
          </a>
          <a href="#opendata" className="hover:text-indigo-700">
            Open Data
          </a>
        </div>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-700"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Créer un compte
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Accéder au dashboard <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center min-h-[70vh]">
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 text-xs font-black tracking-widest text-slate-500">
              <Shield size={14} /> Accès sécurisé requis
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Importer, filtrer, visualiser et exporter vos datasets publics.
            </h1>

            <p className="mt-4 text-slate-600 text-base leading-relaxed">
              Connectez-vous pour accéder à votre espace. Importez un dataset,
              appliquez des filtres, générez des visualisations et exportez vos
              résultats en PDF/CSV.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {primaryCta}
              {secondaryCta}
            </div>

            <div className="mt-6 text-xs text-slate-500 font-semibold flex items-center gap-2">
              <span>🔒</span> Importation disponible uniquement après authentification.
            </div>
          </Motion.div>

          {/* Feature card */}
          <Motion.div
            id="features"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(92,68,135,0.09)]">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-500 uppercase">
                <Sparkles size={14} /> Fonctionnalités
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Feature icon={<Database size={18} />} title="Import" desc="CSV / JSON" />
                <Feature icon={<Filter size={18} />} title="Filtres" desc="Recherche + colonnes" />
                <Feature icon={<BarChart3 size={18} />} title="Visualisation" desc="Charts & insights" />
                <Feature icon={<FileDown size={18} />} title="Export" desc="PDF / CSV" />
              </div>

              <div id="workflow" className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-black tracking-widest text-slate-500 uppercase">
                  Workflow
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  1) Login → 2) Import → 3) Filtre → 4) Visualise → 5) Exporte
                </div>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Steps (animated on scroll) */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Step title="1. Authentification" desc="Accès sécurisé à votre espace de travail." />
          <Step title="2. Analyse" desc="Filtres, table et visualisations interactives." />
          <Step title="3. Export" desc="Export PDF/CSV pour vos rapports." />
        </div>

        {/* New: richer home content */}
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-10 grid md:grid-cols-3 gap-4"
        >
          <UseCaseCard
            img={imgDonnees}
            title="Open data, sans code"
            desc="Chargez un fichier CSV/JSON, explorez les colonnes et obtenez des graphiques interactifs en quelques clics."
          />
          <UseCaseCard
            img={imgExploit}
            title="Insights rapides"
            desc="Recherche globale, filtres par colonne, agrégation et aperçu des données pour valider vos hypothèses."
          />
          <UseCaseCard
            img={imgMedical}
            title="Rapports prêts à partager"
            desc="Export PDF/PNG/CSV pour intégrer vos visualisations dans un rapport, une présentation ou un email."
          />
        </Motion.div>

        {/* ✅ Real Open Data Section */}
        <OpenDataShowcase />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500 font-semibold flex items-center justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} Public Data Dashboard</span>
          <span className="text-slate-400">Open Data Platform — Projet Dashboard</span>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4 bg-white">
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 font-black text-slate-900 text-sm">{title}</div>
      <div className="text-slate-500 text-xs font-semibold mt-1">{desc}</div>
    </div>
  );
}

function UseCaseCard({ img, title, desc }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-36 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="text-sm font-black text-slate-900">{title}</div>
        <div className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
}

function Step({ title, desc }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-3xl border border-slate-100 p-5"
    >
      <div className="text-sm font-black text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 font-semibold mt-2">{desc}</div>
    </Motion.div>
  );
}

/* ============================= */
/* Open Data Showcase (REAL API) */
/* ============================= */
function OpenDataShowcase() {
  const [query, setQuery] = useState("population");
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDatasets = async (q) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://www.data.gouv.fr/api/1/datasets/?q=${encodeURIComponent(
          q
        )}&page_size=6`
      );
      if (!res.ok) throw new Error(`La recherche a échoué (${res.status}).`);
      const data = await res.json();
      setDatasets(Array.isArray(data.data) ? data.data : []);
    } catch (requestError) {
      setDatasets([]);
      setError(requestError.message || "Impossible de joindre data.gouv.fr.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Motion.div
      id="opendata"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="mt-10 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-black tracking-widest text-slate-500 uppercase">
            Datasets Open Data à tester
          </div>
          <div className="mt-2 text-lg font-black text-slate-900">
            Explorez des datasets réels (data.gouv.fr)
          </div>
          <div className="mt-1 text-sm text-slate-500 font-semibold">
            Recherchez un thème et ouvrez un dataset réel pour tester la plateforme.
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: climat, transport, population..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-sm font-semibold"
            />
          </div>

          <button
            onClick={() => fetchDatasets(query)}
            className="px-4 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black tracking-widest hover:bg-indigo-700"
          >
            RECHERCHER
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-slate-500 font-semibold">Chargement...</div>
        ) : datasets.length === 0 ? (
          <div className="text-slate-500 font-semibold">
            Aucun dataset trouvé. Essayez un autre mot-clé.
          </div>
        ) : (
          datasets.map((ds) => {
            const org = ds.organization?.name || "Open Data";
            const updated = ds.last_update ? ds.last_update.slice(0, 10) : "—";
            const page = ds.page;

            const firstResource =
              Array.isArray(ds.resources) && ds.resources.length > 0
                ? ds.resources[0]
                : null;

            return (
              <div
                key={ds.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 hover:shadow-sm transition"
              >
                <div className="text-sm font-black text-slate-900 line-clamp-2">
                  {ds.title}
                </div>

                <div className="mt-2 text-xs text-slate-500 font-semibold">
                  Source : {org}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                    Maj: {updated}
                  </span>
                  {firstResource?.format ? (
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                      {String(firstResource.format).toUpperCase()}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <a
                    href={page}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 text-xs font-black inline-flex items-center gap-1 hover:underline"
                  >
                    Voir <ExternalLink size={14} />
                  </a>

                  {firstResource?.url ? (
                    <a
                      href={firstResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 text-xs font-black inline-flex items-center gap-1 hover:underline"
                    >
                      Télécharger <Download size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs font-semibold">
                      Pas de lien direct
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Motion.div>
  );
}
