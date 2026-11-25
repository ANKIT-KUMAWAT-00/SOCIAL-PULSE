"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  Search,
  Tag,
  MessageSquare,
  AlertCircle,
  Play,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { TopicVisualizationData, TopicCluster } from "@/types";
import { useDataset } from "@/context/DatasetContext";

const EmbeddingScatter3D = dynamic(
  () => import("@/components/3d/EmbeddingScatter3D").then((m) => m.EmbeddingScatter3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[540px] bg-black border border-white/15 flex items-center justify-center text-zinc-500 font-mono text-[10px] tracking-[0.28em] uppercase">
        INITIALIZING 3D MANIFOLD ENGINE...
      </div>
    ),
  }
);

export default function TopicExplorerPage() {
  const { selectedDatasetId } = useDataset();
  const [data, setData] = useState<TopicVisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<TopicCluster | null>(null);
  const [filterClusterId, setFilterClusterId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [algo, setAlgo] = useState("hdbscan");
  const [dimMethod, setDimMethod] = useState("umap");

  const loadTopicData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTopicVisualization(selectedDatasetId ?? undefined);
      setData(res);
      if (res.clusters.length > 0) {
        setSelectedCluster(res.clusters[0]);
      } else {
        setSelectedCluster(null);
      }
      setFilterClusterId(null);
    } catch (err: any) {
      setError(err.message || "Failed to load topic visualization data.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  const handleRerunTopics = async () => {
    const targetId = selectedDatasetId || data?.dataset_id;
    if (!targetId) return;
    try {
      setRunning(true);
      setError(null);
      const res = await api.runTopicClustering({
        dataset_id: targetId,
        algorithm: algo,
        dim_reduction: dimMethod,
        feature_extractor: "embeddings",
      });
      setData(res);
      if (res.clusters.length > 0) setSelectedCluster(res.clusters[0]);
      setFilterClusterId(null);
    } catch (err: any) {
      setError(err.message || "Topic clustering run failed.");
    } finally {
      setRunning(false);
    }
  };

  const filteredClusters =
    data?.clusters.filter(
      (c) =>
        c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.top_keywords.some((kw) => kw.toLowerCase().includes(searchFilter.toLowerCase()))
    ) || [];

  const clusterPosts =
    selectedCluster && data
      ? data.points
          .filter((p) => p.topic_cluster_id === selectedCluster.cluster_label_id)
          .slice(0, 6)
      : [];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          PROJECTING SEMANTIC TOPIC MANIFOLDS...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          TOPIC DISCOVERY ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error || "No data available."}</p>
        <button
          onClick={loadTopicData}
          className="px-5 py-2 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header & Live Re-Clustering Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-white/15">
        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
            02 // PIPELINE A — TOPIC DISCOVERY
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#56B4F9]" />
            <span>TOPIC EXPLORER</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            TOTAL POINTS: <span className="text-white">{data.total_points}</span> // OUTLIERS:{" "}
            <span className="text-[#FF2E93]">{data.outliers_count}</span> // CLUSTERS:{" "}
            <span className="text-[#56B4F9]">{data.num_clusters}</span>
          </p>
        </div>

        {/* Inline Re-Cluster Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#050608] p-2 border border-white/15">
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
            className="bg-black border border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-wider uppercase text-white focus:outline-none focus:border-[#56B4F9]"
          >
            <option value="hdbscan">HDBSCAN</option>
            <option value="kmeans">K-MEANS (k=5)</option>
            <option value="dbscan">DBSCAN</option>
          </select>
          <select
            value={dimMethod}
            onChange={(e) => setDimMethod(e.target.value)}
            className="bg-black border border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-wider uppercase text-white focus:outline-none focus:border-[#56B4F9]"
          >
            <option value="umap">UMAP</option>
            <option value="pca">PCA</option>
          </select>
          <button
            onClick={handleRerunTopics}
            disabled={running}
            className="px-4 py-1.5 bg-[#56B4F9] hover:bg-[#7CC8FF] text-black font-mono font-bold text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {running ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span>{running ? "RUNNING..." : "RE-CLUSTER"}</span>
          </button>
        </div>
      </div>

      {/* 2D / 3D Embedding Scatter Canvas */}
      <EmbeddingScatter3D
        points={data.points}
        clusters={data.clusters}
        selectedClusterId={filterClusterId}
        onSelectClusterId={setFilterClusterId}
      />

      {/* Cluster Directory + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-white/15 bg-[#050608] divide-y lg:divide-y-0 lg:divide-x divide-white/15 items-start">
        {/* Left: Cluster List */}
        <div className="lg:col-span-7 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <h2 className="font-display text-xs tracking-[0.16em] uppercase text-white">
              DISCOVERED CLUSTERS ({filteredClusters.length})
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="FILTER KEYWORDS..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-black border border-white/15 pl-8 pr-3 py-1.5 font-mono text-[10px] tracking-wider text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9] w-48"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.cluster_label_id === cluster.cluster_label_id;
              return (
                <div
                  key={cluster.cluster_label_id}
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setFilterClusterId(cluster.cluster_label_id);
                  }}
                  className={`p-4 border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.04] border-[#56B4F9]"
                      : "bg-black border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 min-w-2.5" style={{ backgroundColor: cluster.color }} />
                      <span className="font-mono font-semibold text-xs text-white truncate">
                        {cluster.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400 tabular-nums whitespace-nowrap ml-2">
                      <strong className="text-white">{cluster.post_count}</strong> ({cluster.percentage}%)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cluster.top_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#08090d] border border-white/10 text-zinc-300"
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

        {/* Right: Cluster Detail Drawer */}
        <div className="lg:col-span-5 p-6 space-y-6 sticky top-0">
          {selectedCluster ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 min-w-3"
                    style={{ backgroundColor: selectedCluster.color }}
                  />
                  <h3 className="font-mono font-bold text-sm text-white truncate">
                    {selectedCluster.name}
                  </h3>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#FF2E93] border border-[#FF2E93]/40 px-2 py-0.5 whitespace-nowrap">
                  ID #{selectedCluster.cluster_label_id}
                </span>
              </div>

              <div className="grid grid-cols-3 border border-white/15 divide-x divide-white/15 bg-black text-center">
                <div className="p-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                    POSTS
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                    {selectedCluster.post_count}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                    SHARE
                  </div>
                  <div className="text-base font-bold font-mono text-[#56B4F9] mt-1 tabular-nums">
                    {selectedCluster.percentage}%
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                    COHERENCE
                  </div>
                  <div className="text-base font-bold font-mono text-[#FF2E93] mt-1 tabular-nums">
                    {selectedCluster.coherence_score}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#56B4F9]" />
                  <span>C-TF-IDF KEYWORDS</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCluster.top_keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] font-mono bg-black text-[#56B4F9] border border-[#56B4F9]/30"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>CENTROID EXEMPLAR POSTS</span>
                </h4>
                <div className="space-y-2.5">
                  {(selectedCluster.representative_posts.length > 0
                    ? selectedCluster.representative_posts
                    : clusterPosts.map((p) => p.text)
                  ).map((post, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-black border border-white/10 text-xs text-zinc-300 leading-relaxed italic"
                    >
                      "{post}"
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 font-mono text-xs tracking-widest uppercase text-zinc-600">
              SELECT A CLUSTER TO INSPECT KEYWORDS & EXEMPLARS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
