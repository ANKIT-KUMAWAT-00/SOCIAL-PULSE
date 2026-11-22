"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  Network,
  Grid3X3,
  TrendingUp,
  FlaskConical,
  Database,
  Award,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Cpu,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { api } from "@/lib/api";
import { Dataset } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/topics", label: "Topic Explorer", icon: Layers },
  { href: "/dashboard/communities", label: "Community Explorer", icon: Users },
  { href: "/dashboard/network", label: "3D Network Graph", icon: Network },
  { href: "/dashboard/matrix", label: "Topic-Community Matrix", icon: Grid3X3 },
  { href: "/dashboard/trending", label: "Trending Topics", icon: TrendingUp },
  { href: "/dashboard/experiments", label: "ML Experiments", icon: FlaskConical },
  { href: "/dashboard/datasets", label: "Dataset Management", icon: Database },
  { href: "/dashboard/team", label: "Team & Project", icon: Award },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoadingDatasets(true);
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && selectedDatasetId === null) {
        setSelectedDatasetId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  return (
    <div className="flex h-screen bg-midnight-950 text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-surface-border bg-midnight-950/80 backdrop-blur-xl transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo & Brand */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 min-w-9 rounded-xl bg-gradient-to-br from-violet-glow to-cyan-glow flex items-center justify-center shadow-glow-violet">
              <Network className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  SOCIALPULSE
                </span>
                <span className="block text-[9px] text-cyan-glow font-mono uppercase tracking-widest">
                  Intelligence
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dataset Workspace Selector in Sidebar */}
        {!collapsed ? (
          <div className="p-4 border-b border-surface-border">
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
              <span>Active Workspace</span>
              <button onClick={loadDatasets} title="Refresh datasets">
                <RefreshCw className={`w-3 h-3 ${loadingDatasets ? "animate-spin text-cyan-glow" : "hover:text-white"}`} />
              </button>
            </div>
            <select
              value={selectedDatasetId || ""}
              onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
              className="w-full bg-midnight-900 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-glow"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.length > 22 ? d.name.substring(0, 22) + "..." : d.name} {d.is_synthetic ? "(Synthetic)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-4 border-b border-surface-border flex justify-center">
            <FolderOpen className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-glow/20 to-cyan-glow/10 text-white border border-violet-glow/40 shadow-glow-violet"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 min-w-4 transition-colors ${
                    isActive ? "text-cyan-glow" : "text-gray-400"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Status Footprint */}
        <div className="p-4 border-t border-surface-border">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-midnight-900/60 border border-surface-border text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Backend Engine Online
              </div>
              <div className="text-gray-500 text-[10px]">FastAPI • PyTorch • UMAP</div>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto" title="Backend Online" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-surface-border bg-midnight-950/60 backdrop-blur-md px-6 flex items-center justify-between z-20">
          {/* Active Dataset Breadcrumb */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">Dataset:</span>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-cyan-glow">
              {selectedDataset?.name || "Loading Dataset..."}
            </span>
            {selectedDataset?.is_synthetic && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-glow/20 text-violet-soft border border-violet-glow/30">
                SYNTHETIC BENCHMARK
              </span>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-midnight-900/80 border border-surface-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-glow w-56 transition-all"
              />
            </div>

            <div className="w-8 h-8 rounded-xl bg-midnight-900 border border-surface-border flex items-center justify-center text-gray-400 hover:text-white cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-cyan-glow absolute top-1.5 right-1.5" />
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-surface-border">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-glow to-cyan-glow flex items-center justify-center font-bold text-xs text-white shadow-glow-violet">
                SP
              </div>
              <div className="hidden md:block leading-tight text-left">
                <div className="text-xs font-medium text-white">Surya / Ankit / Bhavya</div>
                <div className="text-[10px] font-mono text-gray-400">Research Team</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-midnight-950">
          {children}
        </main>
      </div>
    </div>
  );
}
