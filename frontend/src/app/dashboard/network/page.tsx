"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Network, RefreshCw, AlertCircle, Share2, Users, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { NetworkGraphData, NetworkNode } from "@/types";
import { useDataset } from "@/context/DatasetContext";

const NetworkGraph3D = dynamic(
  () => import("@/components/3d/NetworkGraph3D").then((m) => m.NetworkGraph3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] bg-black flex flex-col items-center justify-center space-y-3 border border-white/15">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-500">
          LOADING 3D FORCE-DIRECTED WEBGL CANVAS...
        </span>
      </div>
    ),
  }
);

export default function NetworkPage() {
  const { selectedDatasetId } = useDataset();
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNetworkGraph(selectedDatasetId ?? undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load network graph data.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          CONSTRUCTING 3D SOCIAL INTERACTION MULTIGRAPH...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          NETWORK RENDERING ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error || "No data received."}</p>
        <button
          onClick={loadGraph}
          className="px-5 py-2 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/15">
        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
            04 // 3D INTERACTIVE TOPOLOGY
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
            <Network className="w-6 h-6 text-[#56B4F9]" />
            <span>3D SOCIAL NETWORK GRAPH</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            USERS SIZED BY PAGERANK // COLORED BY LOUVAIN COMMUNITIES // ANIMATED EDGE SIGNALS
          </p>
        </div>

        <button
          onClick={loadGraph}
          className="self-start sm:self-auto px-4 py-2 bg-[#050608] border border-white/15 hover:border-[#56B4F9] font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#56B4F9]" />
          <span>RELOAD GRAPH</span>
        </button>
      </div>

      {/* Signature 3D Network Canvas */}
      <NetworkGraph3D
        nodes={data.nodes}
        edges={data.edges}
        communities={data.communities}
        onSelectNode={setSelectedNode}
      />

      {/* Graph Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15 bg-[#050608]">
        <div className="p-6 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-[#56B4F9]">
            <Users className="w-4 h-4" />
            <span>COMMUNITY PARTITIONS</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {data.communities.length} COMMUNITIES
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Computed via Louvain greedy modularity optimization on the weighted interaction adjacency matrix.
          </p>
        </div>

        <div className="p-6 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-[#FF2E93]">
            <Share2 className="w-4 h-4" />
            <span>INTERACTIONS & DENSITY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {data.edges.length} EDGES (D = {data.density})
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Edges represent mutual follows, retweets, replies, and mentions weighted by interaction frequency.
          </p>
        </div>

        <div className="p-6 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-white">
            <Compass className="w-4 h-4 text-[#56B4F9]" />
            <span>GRAPH MODULARITY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#56B4F9] tabular-nums">
            Q = {data.modularity}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Values above 0.3 indicate strong non-random community separation and dense intra-community cohesion.
          </p>
        </div>
      </div>

      {selectedNode && (
        <div className="p-4 border border-[#FF2E93]/40 bg-[#050608] font-mono text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-4">
          <span>
            FOCUSED NODE: <strong className="text-white">@{selectedNode.username}</strong> ({selectedNode.community_name})
          </span>
          <span className="text-[#56B4F9]">
            PAGERANK: {selectedNode.pagerank.toFixed(4)} // DEGREE: {selectedNode.degree.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
