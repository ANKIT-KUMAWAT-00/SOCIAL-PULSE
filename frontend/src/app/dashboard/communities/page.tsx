"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Network,
  Share2,
  TrendingUp,
  Award,
  Search,
  Filter,
  ArrowRight,
  Shield,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { NetworkGraphData, Community, NetworkNode } from "@/types";

export default function CommunityExplorerPage() {
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedUser, setSelectedUser] = useState<NetworkNode | null>(null);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNetworkGraph();
      setData(res);
      if (res.communities.length > 0) {
        setSelectedCommunity(res.communities[0]);
      }
      if (res.nodes.length > 0) {
        setSelectedUser(res.nodes[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load community network data.");
    } finally {
      setLoading(false);
    }
  };

  const communityMembers = data?.nodes.filter((n) =>
    selectedCommunity ? n.community_id === selectedCommunity.community_label_id : true
  ) || [];

  const filteredMembers = communityMembers.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Computing Louvain modularity and network centralities...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <h3 className="text-lg font-semibold text-white">Community Engine Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error || "No data received."}</p>
        <button
          onClick={loadGraphData}
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
            <Users className="w-7 h-7 text-cyan-glow" />
            <span>Social Community Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Louvain modularity optimization partition metrics, network density, and node centrality rankings.
          </p>
        </div>

        <Link
          href="/dashboard/network"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-violet-glow to-cyan-glow text-white font-medium text-xs flex items-center gap-2 shadow-glow-violet hover:brightness-110 transition-all"
        >
          <Network className="w-4 h-4" />
          <span>Launch 3D WebGL Graph</span>
        </Link>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-midnight-900/70 border border-surface-border">
          <div className="text-[10px] font-mono uppercase text-gray-400">Total Users</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{data.num_nodes}</div>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/70 border border-surface-border">
          <div className="text-[10px] font-mono uppercase text-gray-400">Interactions / Edges</div>
          <div className="text-xl font-bold font-mono text-cyan-glow mt-1">{data.num_edges}</div>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/70 border border-surface-border">
          <div className="text-[10px] font-mono uppercase text-gray-400">Graph Modularity</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{data.modularity}</div>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/70 border border-surface-border">
          <div className="text-[10px] font-mono uppercase text-gray-400">Network Density</div>
          <div className="text-xl font-bold font-mono text-violet-glow mt-1">{data.density}</div>
        </div>
      </div>

      {/* Community Pills Bar */}
      <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md">
        {data.communities.map((c) => {
          const isSelected = selectedCommunity?.community_label_id === c.community_label_id;
          return (
            <button
              key={c.community_label_id}
              onClick={() => setSelectedCommunity(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                isSelected
                  ? "bg-white/15 text-white border border-white/30 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
              <span className="font-mono text-[11px] opacity-75">({c.member_count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Member Table & User Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Community Member List */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
            <div>
              <h3 className="font-bold text-white text-base">
                {selectedCommunity?.name || "Community Members"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Internal Density: <strong className="text-cyan-glow font-mono">{selectedCommunity?.internal_density}</strong> • Modularity Share: <strong className="text-emerald-400 font-mono">{selectedCommunity?.modularity_contribution}</strong>
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-midnight-950 border border-surface-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-glow w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950 text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3 font-medium">User Handle</th>
                  <th className="py-2.5 px-3 font-medium">Followers</th>
                  <th className="py-2.5 px-3 font-medium">PageRank</th>
                  <th className="py-2.5 px-3 font-medium">Degree</th>
                  <th className="py-2.5 px-3 font-medium">Betweenness</th>
                  <th className="py-2.5 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-gray-300">
                {filteredMembers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-white/10 text-white" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="py-3 px-3 flex items-center gap-2 font-semibold text-white">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: u.color }}
                        />
                        @{u.username}
                      </td>
                      <td className="py-3 px-3">{u.followers.toLocaleString()}</td>
                      <td className="py-3 px-3 text-cyan-glow font-semibold">
                        {u.pagerank.toFixed(4)}
                      </td>
                      <td className="py-3 px-3">{u.degree.toFixed(3)}</td>
                      <td className="py-3 px-3">{u.betweenness.toFixed(3)}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-violet-soft underline hover:text-white">
                          Select
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected User Telemetry Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md sticky top-6 space-y-5">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                  style={{ backgroundColor: `${selectedUser.color}33`, borderColor: selectedUser.color, borderWidth: 1 }}
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">@{selectedUser.username}</h4>
                  <div className="text-xs font-mono text-cyan-glow mt-0.5">
                    {selectedUser.community_name}
                  </div>
                </div>
              </div>

              {/* Centrality Metrics */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-mono uppercase text-gray-400">Network Centrality</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">PageRank Influence:</span>
                    <span className="text-cyan-glow font-bold">{selectedUser.pagerank.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">Degree Centrality:</span>
                    <span className="text-violet-glow font-bold">{selectedUser.degree.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">Betweenness Centrality:</span>
                    <span className="text-emerald-400 font-bold">{selectedUser.betweenness.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Follower Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border">
                <div className="bg-white/5 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-gray-400">Followers</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedUser.followers.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-gray-400">Following</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedUser.following.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 3D Force Coordinates */}
              <div className="p-3 rounded-xl bg-midnight-950/80 border border-surface-border text-[11px] font-mono text-gray-400">
                <div>3D Coordinate: ({selectedUser.x.toFixed(1)}, {selectedUser.y.toFixed(1)}, {selectedUser.z.toFixed(1)})</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-gray-500">
              Select a user to inspect their network centrality metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
