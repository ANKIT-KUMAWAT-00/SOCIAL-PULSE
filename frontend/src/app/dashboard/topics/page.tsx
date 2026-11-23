"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  Search,
  Tag,
  MessageSquare,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { TopicVisualizationData, TopicCluster } from "@/types";

const EmbeddingScatter3D = dynamic(
  () => import("@/components/3d/EmbeddingScatter3D").then((m) => m.EmbeddingScatter3D),
  { ssr: false, loading: () => <div className="h-[520px] rounded-2xl bg-midnight-950 flex items-center justify-center text-gray-500 font-mono text-xs">Loading 3D Manifold Engine...</div> }
);

export default function TopicExplorerPage() {
  const [data, setData] = useState<TopicVisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<TopicCluster | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    loadTopicData();
  }, []);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTopicVisualization();
      setData(res);
      if (res.clusters.length > 0) {
        setSelectedCluster(res.clusters[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load topic visualization data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClusters = data?.clusters.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.top_keywords.some((kw) => kw.toLowerCase().includes(searchFilter.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Rendering 3D topic manifold embeddings...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Topic Discovery Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error || "No data available."}</p>
        <button
          onClick={loadTopicData}
          className="px-4 py-2 bg-violet-glow hover:bg-violet-dark text-white rounded-xl text-xs font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-7 h-7 text-violet-glow" />
            <span>Semantic Topic Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Sentence Transformers embeddings projected into 3D manifold space via UMAP with c-TF-IDF keyword extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Total Points:</span>
          <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
            {data.total_points}
          </span>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md ml-2">
            Outliers: {data.outliers_count}
          </span>
        </div>
      </div>

      {/* 3D Embedding Scatter Component */}
      <div className="glow-border rounded-2xl">
        <EmbeddingScatter3D points={data.points} clusters={data.clusters} />
      </div>

      {/* Two Column Layout: Cluster Cards & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cluster List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-glow" />
              <span>Discovered Clusters ({filteredClusters.length})</span>
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-midnight-900 border border-surface-border rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-glow w-44"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.cluster_label_id === cluster.cluster_label_id;
              return (
                <div
                  key={cluster.cluster_label_id}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-midnight-900 border-violet-glow/50 shadow-glow-violet"
                      : "bg-midnight-900/60 border-surface-border hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                      <span className="font-semibold text-sm text-white">{cluster.name}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      <strong className="text-white">{cluster.post_count}</strong> posts ({cluster.percentage}%)
                    </span>
                  </div>

                  {/* Top Keywords Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cluster.top_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/5 text-gray-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Cluster Detail Drawer */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md sticky top-6 space-y-6">
          {selectedCluster ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: selectedCluster.color }}
                  />
                  <h3 className="font-bold text-base text-white">{selectedCluster.name}</h3>
                </div>
                <span className="text-xs font-mono font-medium text-cyan-glow bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                  Cluster #{selectedCluster.cluster_label_id}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] font-mono text-gray-400">Total Posts</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {selectedCluster.post_count}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] font-mono text-gray-400">Share</div>
                  <div className="text-sm font-bold font-mono text-violet-glow mt-0.5">
                    {selectedCluster.percentage}%
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] font-mono text-gray-400">Coherence</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {selectedCluster.coherence_score}
                  </div>
                </div>
              </div>

              {/* Top Keywords */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-glow" />
                  <span>c-TF-IDF Distilled Keywords</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCluster.top_keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/10 text-cyan-soft border border-cyan-500/20"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exemplar Representative Posts */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-glow" />
                  <span>Centroid Exemplar Posts</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedCluster.representative_posts.map((post, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-midnight-950/80 border border-surface-border text-xs text-gray-300 leading-relaxed italic"
                    >
                      "{post}"
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-gray-500">
              Select a cluster on the left to inspect its detailed keyword distribution and exemplar posts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
