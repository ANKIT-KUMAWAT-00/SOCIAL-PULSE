"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Network, Info, RefreshCw, AlertCircle, Share2, Users, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { NetworkGraphData, NetworkNode } from "@/types";

const NetworkGraph3D = dynamic(
  () => import("@/components/3d/NetworkGraph3D").then((m) => m.NetworkGraph3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] rounded-2xl bg-midnight-950 flex flex-col items-center justify-center space-y-3 border border-surface-border">
        <div className="w-8 h-8 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-400">Loading 3D Force-Directed WebGL Canvas...</span>
      </div>
    ),
  }
);

export default function NetworkPage() {
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNetworkGraph();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load network graph data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-violet-glow border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Building 3D social interaction multigraph...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Network Rendering Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error || "No data received."}</p>
        <button
          onClick={loadGraph}
          className="px-4 py-2 bg-violet-glow hover:bg-violet-dark text-white rounded-xl text-xs font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Network className="w-7 h-7 text-cyan-glow" />
            <span>3D Social Network Graph</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time interactive 3D WebGL network visualization. Users are nodes sized by PageRank and colored by Louvain community partitions.
          </p>
        </div>

        <button
          onClick={loadGraph}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-surface-border text-xs text-gray-300 hover:text-white flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-glow" />
          <span>Reload Graph</span>
        </button>
      </div>

      {/* Signature 3D Network Graph Canvas */}
      <div className="glow-border rounded-2xl">
        <NetworkGraph3D
          nodes={data.nodes}
          edges={data.edges}
          communities={data.communities}
          onSelectNode={setSelectedNode}
        />
      </div>

      {/* Graph Metrics & Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-glow">
            <Users className="w-4 h-4" />
            <span>Community Partitions</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {data.communities.length} Communities
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Computed via Louvain greedy modularity optimization on the weighted interaction adjacency matrix.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-violet-glow">
            <Share2 className="w-4 h-4" />
            <span>Interactions & Density</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {data.edges.length} Edges (Density: {data.density})
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Edges represent mutual follows, retweets, replies, and mentions weighted by interaction frequency.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Compass className="w-4 h-4" />
            <span>Graph Modularity</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            Q = {data.modularity}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Values above 0.3 indicate strong non-random community separation and dense intra-community cohesion.
          </p>
        </div>
      </div>
    </div>
  );
}
