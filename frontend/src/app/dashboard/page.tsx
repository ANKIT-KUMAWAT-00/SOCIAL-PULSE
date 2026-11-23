"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Layers,
  Network,
  Share2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { OverviewMetrics } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOverviewMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load overview data from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-violet-glow border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Loading live ML analytical telemetry...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Connection Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error || "No data received."}</p>
        <button
          onClick={loadOverview}
          className="px-4 py-2 bg-violet-glow hover:bg-violet-dark text-white rounded-xl text-xs font-medium transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive Intelligence Pulse
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time unsupervised topic and community discovery analytics for{" "}
            <span className="text-cyan-glow font-medium">{metrics.dataset_name}</span>.
          </p>
        </div>
        <button
          onClick={loadOverview}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-surface-border text-xs text-gray-300 hover:text-white flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-glow" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Posts */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Posts</span>
            <FileText className="w-4 h-4 text-violet-glow" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatNumber(metrics.total_posts)}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Processed text tokens</div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4 text-cyan-glow" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatNumber(metrics.total_users)}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Graph actor nodes</div>
        </div>

        {/* Discovered Topics */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Topics</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.discovered_topics}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Semantic clusters</div>
        </div>

        {/* Discovered Communities */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Communities</span>
            <Network className="w-4 h-4 text-solar-amber text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.discovered_communities}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Louvain partitions</div>
        </div>

        {/* Connections / Edges */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Connections</span>
            <Share2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatNumber(metrics.total_connections)}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Weighted graph edges</div>
        </div>

        {/* Noise / Outlier % */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Noise Ratio</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatPercent(metrics.noise_outlier_percentage)}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">HDBSCAN outliers</div>
        </div>
      </div>

      {/* Middle Grid: Topic & Community Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Distribution */}
        <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Discovered Topic Clusters</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribution of semantically clustered posts</p>
            </div>
            <Link
              href="/dashboard/topics"
              className="text-xs font-mono text-cyan-glow hover:underline flex items-center gap-1"
            >
              <span>Explore 3D Manifold</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {metrics.topic_distribution.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-medium text-gray-200 truncate">{t.name}</span>
                  </div>
                  <div className="font-mono text-gray-400 text-[11px]">
                    <span className="text-white font-semibold">{t.count}</span> posts ({t.percentage}%)
                  </div>
                </div>
                <div className="h-2 w-full bg-midnight-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
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
        <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Social Community Clusters</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Modularity: <strong className="text-emerald-400 font-mono">{metrics.modularity_score}</strong> • Transitivity: <strong className="text-cyan-glow font-mono">{metrics.avg_clustering_coefficient}</strong>
              </p>
            </div>
            <Link
              href="/dashboard/communities"
              className="text-xs font-mono text-cyan-glow hover:underline flex items-center gap-1"
            >
              <span>View User Topology</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {metrics.community_distribution.map((c) => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-gray-200">{c.name}</span>
                  </div>
                  <div className="font-mono text-gray-400 text-[11px]">
                    <span className="text-white font-semibold">{c.count}</span> members • Density: {c.density}
                  </div>
                </div>
                <div className="h-2 w-full bg-midnight-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, (c.count / Math.max(1, metrics.total_users)) * 100))}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Benchmark & Comparison Table */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Algorithm Benchmark & Quality Comparison</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Empirical evaluation scores calculated from active clustering experiments
            </p>
          </div>
          <Link
            href="/dashboard/experiments"
            className="text-xs font-mono text-violet-soft hover:underline flex items-center gap-1"
          >
            <span>Run ML Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metrics.algorithm_benchmark.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950 text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Algorithm</th>
                  <th className="py-2.5 px-4 font-medium">Clusters</th>
                  <th className="py-2.5 px-4 font-medium">Outliers</th>
                  <th className="py-2.5 px-4 font-medium">Silhouette Score</th>
                  <th className="py-2.5 px-4 font-medium">Davies-Bouldin</th>
                  <th className="py-2.5 px-4 font-medium">Calinski-Harabasz</th>
                  <th className="py-2.5 px-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-gray-300">
                {metrics.algorithm_benchmark.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-glow" />
                      {b.name}
                    </td>
                    <td className="py-3 px-4">{b.clusters}</td>
                    <td className="py-3 px-4 text-rose-400">{b.outliers}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {b.silhouette !== null ? b.silhouette.toFixed(4) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {b.davies_bouldin !== null ? b.davies_bouldin.toFixed(4) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {b.calinski_harabasz !== null ? b.calinski_harabasz.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{b.duration_ms.toFixed(1)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500 font-mono">
            No custom benchmarks recorded yet. Run experiments in the ML Lab to compare algorithms.
          </div>
        )}
      </div>

      {/* Recent Discovered Activity Sample */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md">
        <h3 className="text-base font-semibold text-white mb-1">Recent Analyzed Posts</h3>
        <p className="text-xs text-gray-400 mb-4">Sample posts ingested and classified into topic manifolds</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.recent_activity.map((post) => (
            <div
              key={post.id}
              className="p-3.5 rounded-xl bg-midnight-950/70 border border-surface-border text-xs space-y-2 hover:border-violet-glow/30 transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span className="text-cyan-glow">@{post.author}</span>
                <span>{post.likes} likes</span>
              </div>
              <p className="text-gray-300 line-clamp-2 leading-relaxed">
                "{post.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
