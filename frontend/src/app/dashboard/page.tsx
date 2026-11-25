"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Layers,
  Network,
  Share2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { OverviewMetrics } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { useDataset } from "@/context/DatasetContext";

export default function OverviewPage() {
  const { selectedDatasetId } = useDataset();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOverviewMetrics(selectedDatasetId ?? undefined);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load overview data from backend.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          LOADING LIVE ANALYTICAL TELEMETRY...
        </p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          CONNECTION ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error || "No data received."}</p>
        <button
          onClick={loadOverview}
          className="px-5 py-2 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: "POSTS",
      value: formatNumber(metrics.total_posts),
      sub: "Processed text records",
      icon: FileText,
      accent: "#56B4F9",
    },
    {
      label: "USERS",
      value: formatNumber(metrics.total_users),
      sub: "Graph actor nodes",
      icon: Users,
      accent: "#FFFFFF",
    },
    {
      label: "TOPICS",
      value: metrics.discovered_topics.toString(),
      sub: "Semantic clusters",
      icon: Layers,
      accent: "#56B4F9",
    },
    {
      label: "COMMUNITIES",
      value: metrics.discovered_communities.toString(),
      sub: "Louvain partitions",
      icon: Network,
      accent: "#FF2E93",
    },
    {
      label: "CONNECTIONS",
      value: formatNumber(metrics.total_connections),
      sub: "Weighted edges",
      icon: Share2,
      accent: "#FFFFFF",
    },
    {
      label: "NOISE RATIO",
      value: formatPercent(metrics.noise_outlier_percentage),
      sub: "HDBSCAN outliers",
      icon: AlertTriangle,
      accent: "#FF2E93",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/15">
        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
            01 // COMMAND OVERVIEW
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white">
            EXECUTIVE PULSE
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            ACTIVE DATASET:{" "}
            <span className="text-white">{metrics.dataset_name}</span>
          </p>
        </div>

        <button
          onClick={loadOverview}
          className="self-start sm:self-auto px-4 py-2 bg-[#050608] border border-white/15 hover:border-[#56B4F9] font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#56B4F9]" />
          <span>REFRESH ANALYTICS</span>
        </button>
      </div>

      {/* Hairline KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-white/15 divide-y md:divide-y-0 lg:divide-x divide-white/15 bg-[#050608]">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-5 space-y-2 border-r border-white/10 lg:border-r-0">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="font-mono text-[9px] tracking-[0.28em] uppercase">
                  {kpi.label}
                </span>
                <Icon className="w-3.5 h-3.5" style={{ color: kpi.accent }} />
              </div>
              <div
                className="text-2xl font-bold font-mono tabular-nums"
                style={{ color: kpi.accent }}
              >
                {kpi.value}
              </div>
              <div className="font-mono text-[10px] text-zinc-500">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Distributions Architectural Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border border-white/15 divide-y lg:divide-y-0 lg:divide-x divide-white/15 bg-[#050608]">
        {/* Topic Distribution */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="font-mono text-[9px] tracking-[0.28em] text-[#56B4F9] uppercase mb-1">
                PIPELINE A
              </div>
              <h3 className="font-display text-sm tracking-[0.1em] uppercase text-white">
                TOPIC DISTRIBUTION
              </h3>
            </div>
            <Link
              href="/dashboard/topics"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-[#56B4F9] flex items-center gap-1 transition-colors"
            >
              <span>3D MANIFOLD</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {metrics.topic_distribution.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-xs">
                    <span className="w-2 h-2 min-w-2" style={{ backgroundColor: t.color }} />
                    <span className="font-mono text-[11px] text-zinc-200 truncate">
                      {t.name}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 tabular-nums">
                    <span className="text-white font-semibold">{t.count}</span> ({t.percentage}%)
                  </div>
                </div>
                <div className="h-1.5 w-full bg-black border border-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(3, t.percentage))}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Distribution */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="font-mono text-[9px] tracking-[0.28em] text-[#FF2E93] uppercase mb-1">
                PIPELINE B // MODULARITY Q = {metrics.modularity_score}
              </div>
              <h3 className="font-display text-sm tracking-[0.1em] uppercase text-white">
                COMMUNITY PARTITIONS
              </h3>
            </div>
            <Link
              href="/dashboard/communities"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-[#FF2E93] flex items-center gap-1 transition-colors"
            >
              <span>USER TOPOLOGY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {metrics.community_distribution.map((c) => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 min-w-2" style={{ backgroundColor: c.color }} />
                    <span className="font-mono text-[11px] text-zinc-200">{c.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 tabular-nums">
                    <span className="text-white font-semibold">{c.count}</span> • D:{c.density}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-black border border-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (c.count / Math.max(1, metrics.total_users)) * 100)
                      )}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Benchmark Table */}
      <div className="border border-white/15 bg-[#050608] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-[9px] tracking-[0.28em] text-zinc-500 uppercase mb-1">
              EMPIRICAL METRICS
            </div>
            <h3 className="font-display text-sm tracking-[0.1em] uppercase text-white">
              ALGORITHM PERFORMANCE COMPARISON
            </h3>
          </div>
          <Link
            href="/dashboard/experiments"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#56B4F9] hover:text-[#FF2E93] flex items-center gap-1 transition-colors"
          >
            <span>RUN BENCHMARK</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metrics.algorithm_benchmark.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-zinc-500 border-b border-white/15 uppercase text-[10px] tracking-[0.18em]">
                <tr>
                  <th className="py-3 px-4 font-medium">Algorithm</th>
                  <th className="py-3 px-4 font-medium">Clusters</th>
                  <th className="py-3 px-4 font-medium">Outliers</th>
                  <th className="py-3 px-4 font-medium">Silhouette</th>
                  <th className="py-3 px-4 font-medium">Davies-Bouldin</th>
                  <th className="py-3 px-4 font-medium">Calinski-Harabasz</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-zinc-300 tabular-nums">
                {metrics.algorithm_benchmark.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#56B4F9]" />
                      {b.name}
                    </td>
                    <td className="py-3 px-4">{b.clusters}</td>
                    <td className="py-3 px-4 text-[#FF2E93]">{b.outliers}</td>
                    <td className="py-3 px-4 text-[#56B4F9] font-semibold">
                      {b.silhouette !== null ? b.silhouette.toFixed(4) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {b.davies_bouldin !== null ? b.davies_bouldin.toFixed(4) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {b.calinski_harabasz !== null ? b.calinski_harabasz.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">{b.duration_ms.toFixed(1)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-500">
            NO BENCHMARKS RECORDED YET. LAUNCH AN EXPERIMENT IN THE ML LAB TO COMPARE ALGORITHMS.
          </div>
        )}
      </div>

      {/* Recent Ingested Activity Sample */}
      <div className="border border-white/15 bg-[#050608] p-6 sm:p-8 space-y-5">
        <div className="border-b border-white/10 pb-4">
          <div className="font-mono text-[9px] tracking-[0.28em] text-zinc-500 uppercase mb-1">
            CORPUS STREAM
          </div>
          <h3 className="font-display text-sm tracking-[0.1em] uppercase text-white">
            RECENT ANALYZED POSTS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.recent_activity.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-black border border-white/10 hover:border-[#56B4F9]/40 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-zinc-500">
                <span className="text-[#56B4F9]">@{post.author}</span>
                <span>{post.likes} LIKES</span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                "{post.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
