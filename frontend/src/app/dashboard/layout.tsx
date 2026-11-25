"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  RefreshCw,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";
import { DatasetProvider, useDataset } from "@/context/DatasetContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", code: "01", icon: LayoutDashboard },
  { href: "/dashboard/topics", label: "Topic Explorer", code: "02", icon: Layers },
  { href: "/dashboard/communities", label: "Community Explorer", code: "03", icon: Users },
  { href: "/dashboard/network", label: "3D Network Graph", code: "04", icon: Network },
  { href: "/dashboard/matrix", label: "Affinity Matrix", code: "05", icon: Grid3X3 },
  { href: "/dashboard/trending", label: "Trending Topics", code: "06", icon: TrendingUp },
  { href: "/dashboard/experiments", label: "ML Experiments", code: "07", icon: FlaskConical },
  { href: "/dashboard/datasets", label: "Datasets", code: "08", icon: Database },
  { href: "/dashboard/team", label: "Team & Docs", code: "09", icon: Award },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickJump, setQuickJump] = useState("");
  const {
    datasets,
    selectedDatasetId,
    selectedDataset,
    setSelectedDatasetId,
    refreshDatasets,
    loadingDatasets,
  } = useDataset();

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickJump.trim().toLowerCase();
    if (!q) return;
    const match = NAV_ITEMS.find(
      (item) =>
        item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
    );
    if (match) {
      router.push(match.href);
      setQuickJump("");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Architectural Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 flex flex-col border-r border-white/15 bg-black transition-all duration-300 z-50 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-16" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/15">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {!collapsed ? (
              <div className="leading-none">
                <div className="font-display font-bold text-xs tracking-[0.2em]">
                  <span className="text-[#56B4F9]">SOCIAL</span>
                  <span className="text-[#FF2E93]">PULSE</span>
                </div>
                <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-[0.34em] mt-1">
                  INTELLIGENCE
                </span>
              </div>
            ) : (
              <div className="font-display font-bold text-xs tracking-widest mx-auto">
                <span className="text-[#56B4F9]">S</span>
                <span className="text-[#FF2E93]">P</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 border border-white/15 hover:border-[#56B4F9] text-zinc-400 hover:text-white items-center justify-center transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-6 h-6 text-zinc-400 hover:text-white flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Dataset Selector */}
        {!collapsed ? (
          <div className="p-4 border-b border-white/15 bg-[#040507]">
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500 mb-2 flex items-center justify-between">
              <span>WORKSPACE</span>
              <button
                onClick={() => refreshDatasets()}
                title="Refresh datasets"
                className="hover:text-[#56B4F9] transition-colors"
              >
                <RefreshCw
                  className={`w-3 h-3 ${loadingDatasets ? "animate-spin text-[#56B4F9]" : ""}`}
                />
              </button>
            </div>
            <select
              value={selectedDatasetId || ""}
              onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
              className="w-full bg-black border border-white/15 px-2.5 py-2 font-mono text-[11px] text-white focus:outline-none focus:border-[#56B4F9] transition-colors"
            >
              {datasets.length === 0 ? (
                <option value="">No datasets</option>
              ) : (
                datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.length > 23 ? d.name.substring(0, 23) + "..." : d.name}
                    {d.is_synthetic ? " [SYNTH]" : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        ) : (
          <div className="p-4 border-b border-white/15 flex justify-center">
            <FolderOpen className="w-4 h-4 text-zinc-500" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs transition-colors border-l-2 ${
                  isActive
                    ? "border-[#56B4F9] bg-white/[0.04] text-white"
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 min-w-4 ${
                    isActive ? "text-[#56B4F9]" : "text-zinc-500"
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[11px] tracking-[0.12em] uppercase">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono text-[9px] ${
                        isActive ? "text-[#FF2E93]" : "text-zinc-600"
                      }`}
                    >
                      {item.code}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Engine Status Footer */}
        <div className="p-4 border-t border-white/15 bg-[#040507]">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[#56B4F9]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#56B4F9] animate-pulse" />
                <span>ENGINE ONLINE</span>
              </div>
              <div className="font-mono text-[9px] tracking-[0.16em] text-zinc-600 uppercase">
                FASTAPI • UMAP • LOUVAIN
              </div>
            </div>
          ) : (
            <div
              className="w-1.5 h-1.5 rounded-full bg-[#56B4F9] mx-auto"
              title="Backend Online"
            />
          )}
        </div>
      </aside>

      {/* Main Analytical Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/15 bg-black px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 border border-white/15 text-zinc-300 hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500 hidden sm:inline">
              DATASET //
            </span>
            <span className="font-mono text-xs text-white truncate max-w-[200px] sm:max-w-xs">
              {selectedDataset?.name || "LOADING..."}
            </span>
            {selectedDataset && (
              <span
                className={`hidden md:inline-block font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 border ${
                  selectedDataset.is_synthetic
                    ? "border-[#FF2E93]/40 text-[#FF2E93]"
                    : "border-[#56B4F9]/40 text-[#56B4F9]"
                }`}
              >
                {selectedDataset.is_synthetic ? "SYNTHETIC" : "REAL DATA"}
              </span>
            )}
          </div>

          {/* Right Quick Jump & Profile */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleQuickJump} className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="JUMP TO VIEW..."
                value={quickJump}
                onChange={(e) => setQuickJump(e.target.value)}
                className="bg-[#050608] border border-white/15 pl-8 pr-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9] w-48 transition-colors"
              />
            </form>

            <div className="flex items-center gap-3 pl-4 border-l border-white/15">
              <div className="w-7 h-7 border border-[#56B4F9]/60 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                SP
              </div>
              <div className="hidden md:block leading-tight">
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-white">
                  SURYA / ANKIT / BHAVYA
                </div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
                  RESEARCH TEAM
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-black">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DatasetProvider>
      <DashboardShell>{children}</DashboardShell>
    </DatasetProvider>
  );
}
