"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Network, Search, ArrowUpRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { NetworkGraphData, Community, NetworkNode } from "@/types";
import { useDataset } from "@/context/DatasetContext";

export default function CommunityExplorerPage() {
  const { selectedDatasetId } = useDataset();
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedUser, setSelectedUser] = useState<NetworkNode | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const loadGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNetworkGraph(selectedDatasetId ?? undefined);
      setData(res);
      if (res.communities.length > 0) {
        setSelectedCommunity(res.communities[0]);
      } else {
        setSelectedCommunity(null);
      }
      if (res.nodes.length > 0) {
        setSelectedUser(res.nodes[0]);
      } else {
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load community network data.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const communityMembers =
    data?.nodes.filter((n) =>
      selectedCommunity ? n.community_id === selectedCommunity.community_label_id : true
    ) || [];

  const filteredMembers = communityMembers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#FF2E93] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          COMPUTING LOUVAIN MODULARITY & CENTRALITIES...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          COMMUNITY ENGINE ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error || "No data received."}</p>
        <button
          onClick={loadGraphData}
          className="px-5 py-2 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/15">
        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-[#FF2E93] uppercase mb-2">
            03 // PIPELINE B — COMMUNITY DETECTION
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-[#FF2E93]" />
            <span>COMMUNITY EXPLORER</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            LOUVAIN MODULARITY OPTIMIZATION, INTERNAL DENSITY & ACTOR CENTRALITY METRICS
          </p>
        </div>

        <Link
          href="/dashboard/network"
          className="self-start sm:self-auto px-5 py-2.5 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono font-bold text-[10px] tracking-[0.22em] uppercase flex items-center gap-2 transition-colors"
        >
          <Network className="w-3.5 h-3.5" />
          <span>OPEN 3D GRAPH</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Network Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/15 divide-y sm:divide-y-0 sm:divide-x divide-white/15 bg-[#050608]">
        <div className="p-5">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-zinc-500">
            TOTAL USERS
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {data.num_nodes}
          </div>
        </div>
        <div className="p-5">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-zinc-500">
            EDGES / INTERACTIONS
          </div>
          <div className="text-2xl font-bold font-mono text-[#56B4F9] mt-1 tabular-nums">
            {data.num_edges}
          </div>
        </div>
        <div className="p-5">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-zinc-500">
            MODULARITY (Q)
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF2E93] mt-1 tabular-nums">
            {data.modularity}
          </div>
        </div>
        <div className="p-5">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-zinc-500">
            GRAPH DENSITY
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {data.density}
          </div>
        </div>
      </div>

      {/* Community Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-2 border border-white/15 bg-[#050608]">
        {data.communities.map((c) => {
          const isSelected = selectedCommunity?.community_label_id === c.community_label_id;
          return (
            <button
              key={c.community_label_id}
              onClick={() => setSelectedCommunity(c)}
              className={`px-3.5 py-2 font-mono text-[10px] tracking-[0.14em] uppercase flex items-center gap-2 transition-colors border ${
                isSelected
                  ? "bg-white/10 text-white border-[#56B4F9]"
                  : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <span className="w-2 h-2" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Member Directory + Actor Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/15 bg-[#050608] divide-y lg:divide-y-0 lg:divide-x divide-white/15 items-start">
        <div className="lg:col-span-8 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-mono font-bold text-white text-sm uppercase tracking-wider">
                {selectedCommunity?.name || "COMMUNITY MEMBERS"}
              </h3>
              <p className="font-mono text-[11px] text-zinc-500 mt-1">
                INTERNAL DENSITY:{" "}
                <strong className="text-[#56B4F9]">{selectedCommunity?.internal_density}</strong> //
                MODULARITY SHARE:{" "}
                <strong className="text-[#FF2E93]">
                  {selectedCommunity?.modularity_contribution}
                </strong>
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="SEARCH USER..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-black border border-white/15 pl-8 pr-3 py-1.5 font-mono text-[10px] tracking-wider text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9] w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-zinc-500 border-b border-white/15 uppercase text-[10px] tracking-[0.18em]">
                <tr>
                  <th className="py-3 px-3 font-medium">Handle</th>
                  <th className="py-3 px-3 font-medium">Followers</th>
                  <th className="py-3 px-3 font-medium">PageRank</th>
                  <th className="py-3 px-3 font-medium">Degree</th>
                  <th className="py-3 px-3 font-medium">Betweenness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-zinc-300 tabular-nums">
                {filteredMembers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="py-3 px-3 flex items-center gap-2 font-semibold text-white">
                        <span className="w-2 h-2" style={{ backgroundColor: u.color }} />
                        @{u.username}
                      </td>
                      <td className="py-3 px-3">{u.followers.toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#56B4F9] font-semibold">
                        {u.pagerank.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-[#FF2E93]">{u.degree.toFixed(3)}</td>
                      <td className="py-3 px-3">{u.betweenness.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Telemetry Panel */}
        <div className="lg:col-span-4 p-6 space-y-6 sticky top-0">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div
                  className="w-11 h-11 flex items-center justify-center font-display font-bold text-base text-white border"
                  style={{
                    borderColor: selectedUser.color,
                    backgroundColor: `${selectedUser.color}18`,
                  }}
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-mono font-bold text-white text-sm">
                    @{selectedUser.username}
                  </h4>
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#56B4F9] mt-0.5">
                    {selectedUser.community_name}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-mono text-[9px] tracking-[0.28em] uppercase text-zinc-500">
                  CENTRALITY RANKINGS
                </h5>
                <div className="space-y-2.5 text-xs font-mono tabular-nums">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">PageRank Influence</span>
                    <span className="text-[#56B4F9] font-bold">
                      {selectedUser.pagerank.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Degree Centrality</span>
                    <span className="text-[#FF2E93] font-bold">
                      {selectedUser.degree.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Betweenness Centrality</span>
                    <span className="text-white font-bold">
                      {selectedUser.betweenness.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 border border-white/15 divide-x divide-white/15 bg-black text-center">
                <div className="p-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                    FOLLOWERS
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                    {selectedUser.followers.toLocaleString()}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                    FOLLOWING
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                    {selectedUser.following.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black border border-white/10 font-mono text-[10px] text-zinc-500 tabular-nums">
                3D COORD: ({selectedUser.x.toFixed(1)}, {selectedUser.y.toFixed(1)},{" "}
                {selectedUser.z.toFixed(1)})
              </div>
            </>
          ) : (
            <div className="text-center py-12 font-mono text-xs tracking-widest uppercase text-zinc-600">
              SELECT A USER TO INSPECT METRICS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
