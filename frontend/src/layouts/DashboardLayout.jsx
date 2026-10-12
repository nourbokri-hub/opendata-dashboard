import React, { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import HeaderDash from "../components/HeaderDash";

import { useDispatch, useSelector } from "react-redux";
import { fetchDatasets, setActiveDataset } from "../store/slices/datasetsSlice";

export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const datasets = useSelector((state) => state.datasets.list);
  const activeDataset = useSelector((state) => state.datasets.activeDataset);

  // Make datasets available everywhere in the dashboard (Visualisation included)
  useEffect(() => {
    if (token) dispatch(fetchDatasets());
  }, [dispatch, token]);

  useEffect(() => {
    if (activeDataset) return;
    const lastId = localStorage.getItem("activeDatasetId");
    const dataset = datasets.find((item) => String(item.id) === String(lastId));
    if (dataset) dispatch(setActiveDataset(dataset));
  }, [activeDataset, datasets, dispatch]);

  return (
    <div className="min-h-screen bg-[#faf8fd]">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="min-h-screen lg:pl-64">
        <HeaderDash onMenuClick={() => setMobileNavOpen((open) => !open)} />
        <main className="relative mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Suspense fallback={
            <div role="status" className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">
              Chargement de la page...
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
