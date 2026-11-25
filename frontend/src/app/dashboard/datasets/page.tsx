"use client";

import React, { useState } from "react";
import {
  Database,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useDataset } from "@/context/DatasetContext";

export default function DatasetManagementPage() {
  const { datasets, selectedDatasetId, setSelectedDatasetId, refreshDatasets } = useDataset();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [synthName, setSynthName] = useState("AI & Distributed Systems Cohort");
  const [numPosts, setNumPosts] = useState(400);
  const [numUsers, setNumUsers] = useState(60);
  const [outlierRatio, setOutlierRatio] = useState(0.08);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");

  const handleGenerateSynthetic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setStatusMsg(null);
      const newDs = await api.createSyntheticDataset({
        name: synthName,
        description: `Synthetic benchmark with ${numPosts} posts, ${numUsers} users, and ${Math.round(
          outlierRatio * 100
        )}% outliers.`,
        num_posts: numPosts,
        num_users: numUsers,
        outlier_ratio: outlierRatio,
      });
      await refreshDatasets(true);
      setStatusMsg({
        type: "success",
        text: `Generated and analyzed "${newDs.name}" successfully.`,
      });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Synthetic generation failed." });
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setStatusMsg(null);
      const newDs = await api.uploadDataset(uploadFile, uploadName);
      await refreshDatasets(true);
      setStatusMsg({
        type: "success",
        text: `Uploaded and processed "${newDs.name}" (${newDs.num_posts} posts).`,
      });
      setUploadFile(null);
      setUploadName("");
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "File upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this dataset and all associated clusters/communities?")) return;
    try {
      await api.deleteDataset(id);
      await refreshDatasets(false);
      setStatusMsg({ type: "success", text: "Dataset deleted." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete dataset." });
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/15">
        <div className="font-mono text-[10px] tracking-[0.34em] text-[#FF2E93] uppercase mb-2">
          08 // DATA INGESTION
        </div>
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
          <Database className="w-6 h-6 text-[#FF2E93]" />
          <span>DATASET MANAGEMENT</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          INGEST CSV/JSON SOCIAL CORPORA OR SYNTHESIZE LABELED MULTI-COMMUNITY BENCHMARKS
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 border font-mono text-xs flex items-center gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-[#050608] border-[#56B4F9] text-[#56B4F9]"
              : "bg-[#050608] border-[#FF2E93] text-[#FF2E93]"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="w-4 h-4 min-w-4" />
          ) : (
            <AlertCircle className="w-4 h-4 min-w-4" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upload & Synthetic Generator Architectural Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border border-white/15 divide-y lg:divide-y-0 lg:divide-x divide-white/15 bg-[#050608]">
        {/* Upload Real Dataset */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 font-mono text-[10px] tracking-[0.26em] uppercase text-[#56B4F9]">
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD REAL DATASET (.CSV / .JSON)</span>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-mono text-zinc-400 file:mr-4 file:py-2 file:px-4 file:border file:border-[#56B4F9]/50 file:bg-black file:text-[10px] file:font-mono file:uppercase file:tracking-wider file:text-[#56B4F9] hover:file:bg-[#56B4F9] hover:file:text-black cursor-pointer"
                required
              />
              <p className="font-mono text-[10px] text-zinc-600 mt-2">
                COLUMNS: post_id, user_id, text, likes, comments, shares
              </p>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                Dataset Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Discourse Export Q4"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9]"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="w-full py-2.5 bg-[#56B4F9] hover:bg-[#7CC8FF] text-black font-mono font-bold text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>INDEXING & RUNNING ML...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>UPLOAD & ANALYZE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Synthetic Generator */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 font-mono text-[10px] tracking-[0.26em] uppercase text-[#FF2E93]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SYNTHESIZE BENCHMARK GRAPH</span>
          </div>

          <form onSubmit={handleGenerateSynthetic} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                Benchmark Name
              </label>
              <input
                type="text"
                value={synthName}
                onChange={(e) => setSynthName(e.target.value)}
                className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#FF2E93]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 mb-2">
                  Posts: {numPosts}
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={numPosts}
                  onChange={(e) => setNumPosts(Number(e.target.value))}
                  className="w-full accent-[#56B4F9]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 mb-2">
                  Users: {numUsers}
                </label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="10"
                  value={numUsers}
                  onChange={(e) => setNumUsers(Number(e.target.value))}
                  className="w-full accent-[#FF2E93]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 mb-2">
                Outlier Ratio: {(outlierRatio * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={outlierRatio}
                onChange={(e) => setOutlierRatio(Number(e.target.value))}
                className="w-full accent-[#FF2E93]"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-[#FF2E93] hover:bg-[#FF66B2] text-white font-mono font-bold text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SYNTHESIZING GRAPH...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GENERATE BENCHMARK</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Loaded Datasets Registry */}
      <div className="border border-white/15 bg-[#050608] p-6 space-y-4">
        <h3 className="font-display text-sm tracking-[0.12em] uppercase text-white">
          DATASET REGISTRY
        </h3>

        {datasets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-zinc-500 border-b border-white/15 uppercase text-[10px] tracking-[0.16em]">
                <tr>
                  <th className="py-3 px-4 font-medium">Dataset</th>
                  <th className="py-3 px-4 font-medium">Origin</th>
                  <th className="py-3 px-4 font-medium">Posts</th>
                  <th className="py-3 px-4 font-medium">Users</th>
                  <th className="py-3 px-4 font-medium">Edges</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-zinc-300 tabular-nums">
                {datasets.map((d) => {
                  const isActive = d.id === selectedDatasetId;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDatasetId(d.id)}
                      className={`cursor-pointer transition-colors ${
                        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 ${
                              isActive ? "bg-[#56B4F9]" : "bg-zinc-600"
                            }`}
                          />
                          <span>{d.name}</span>
                        </div>
                        {d.description && (
                          <div className="text-[11px] text-zinc-500 font-sans truncate max-w-sm mt-0.5 pl-4">
                            {d.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[9px] tracking-[0.18em] uppercase border ${
                            d.is_synthetic
                              ? "border-[#FF2E93]/40 text-[#FF2E93]"
                              : "border-[#56B4F9]/40 text-[#56B4F9]"
                          }`}
                        >
                          {d.is_synthetic ? "SYNTHETIC" : "UPLOADED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{d.num_posts}</td>
                      <td className="py-3.5 px-4">{d.num_users}</td>
                      <td className="py-3.5 px-4">{d.num_relationships}</td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d.id);
                          }}
                          className="text-zinc-500 hover:text-[#FF2E93] transition-colors p-1"
                          title="Delete dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-600">
            NO DATASETS CURRENTLY AVAILABLE.
          </div>
        )}
      </div>
    </div>
  );
}
