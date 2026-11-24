"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";
import { Dataset } from "@/types";

export default function DatasetManagementPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Synthetic Generator Form State
  const [synthName, setSynthName] = useState("AI & Distributed Systems Cohort");
  const [numPosts, setNumPosts] = useState(400);
  const [numUsers, setNumUsers] = useState(60);
  const [outlierRatio, setOutlierRatio] = useState(0.08);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await api.getDatasets();
      setDatasets(data);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to load datasets." });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSynthetic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setStatusMsg(null);
      const newDs = await api.createSyntheticDataset({
        name: synthName,
        description: `Synthetic benchmark with ${numPosts} posts, ${numUsers} users, and ${Math.round(outlierRatio * 100)}% outliers.`,
        num_posts: numPosts,
        num_users: numUsers,
        outlier_ratio: outlierRatio,
      });
      setStatusMsg({
        type: "success",
        text: `Generated and analyzed dataset "${newDs.name}" successfully!`,
      });
      loadDatasets();
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
      const newDs = await api.uploadDataset(uploadFile, uploadName, uploadDesc);
      setStatusMsg({
        type: "success",
        text: `Uploaded and processed "${newDs.name}" with ${newDs.num_posts} posts!`,
      });
      setUploadFile(null);
      setUploadName("");
      setUploadDesc("");
      loadDatasets();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "File upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await api.deleteDataset(id);
      setDatasets(datasets.filter((d) => d.id !== id));
      setStatusMsg({ type: "success", text: "Dataset deleted." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete dataset." });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Database className="w-7 h-7 text-cyan-glow" />
          <span>Dataset Management & Generation</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Upload custom social media posts and interaction multigraphs (CSV/JSON), or generate multi-topic synthetic benchmarks with configurable noise.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="w-4 h-4 min-w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 min-w-4 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Two Action Panels: File Upload & Synthetic Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: CSV / JSON Upload */}
        <div className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border text-xs font-mono uppercase text-violet-soft">
            <Upload className="w-4 h-4 text-violet-glow" />
            <span>Upload Real Dataset (CSV or JSON)</span>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Dataset File (.csv or .json)
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-glow/20 file:text-violet-soft hover:file:bg-violet-glow/30 cursor-pointer"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Supported columns: post_id, user_id, text, likes, comments, shares
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Dataset Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Twitter Tech Discussions Q3"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full bg-midnight-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-glow"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full py-2.5 rounded-xl bg-violet-glow hover:bg-violet-dark text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-glow-violet"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing & Running ML Pipelines...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Analyze Dataset</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Synthetic Dataset Generator */}
        <div className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border text-xs font-mono uppercase text-cyan-soft">
            <Sparkles className="w-4 h-4 text-cyan-glow" />
            <span>Generate Realistic Synthetic Benchmark</span>
          </div>

          <form onSubmit={handleGenerateSynthetic} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Benchmark Name
              </label>
              <input
                type="text"
                value={synthName}
                onChange={(e) => setSynthName(e.target.value)}
                className="w-full bg-midnight-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-glow"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Posts Count: {numPosts}
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={numPosts}
                  onChange={(e) => setNumPosts(Number(e.target.value))}
                  className="w-full accent-cyan-glow"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Users Count: {numUsers}
                </label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="10"
                  value={numUsers}
                  onChange={(e) => setNumUsers(Number(e.target.value))}
                  className="w-full accent-violet-glow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Noise / Outlier Ratio: {(outlierRatio * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={outlierRatio}
                onChange={(e) => setOutlierRatio(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-glow to-violet-glow hover:brightness-110 text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-glow-cyan"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Graph & Embeddings...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate & Index Benchmark</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Available Datasets Table */}
      <div className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-4">
        <h3 className="text-base font-semibold text-white">Loaded Datasets</h3>

        {datasets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950 text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Dataset</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Posts</th>
                  <th className="py-3 px-4 font-medium">Users</th>
                  <th className="py-3 px-4 font-medium">Connections</th>
                  <th className="py-3 px-4 font-medium">Created At</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-gray-300">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{d.name}</div>
                      {d.description && (
                        <div className="text-[11px] text-gray-500 font-sans truncate max-w-sm mt-0.5">
                          {d.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.is_synthetic ? (
                        <span className="px-2 py-0.5 rounded bg-violet-glow/15 text-violet-soft border border-violet-glow/30 text-[10px]">
                          SYNTHETIC
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-cyan-glow/15 text-cyan-soft border border-cyan-glow/30 text-[10px]">
                          UPLOADED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{d.num_posts}</td>
                    <td className="py-3.5 px-4">{d.num_users}</td>
                    <td className="py-3.5 px-4">{d.num_relationships}</td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete dataset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            No datasets currently available. Use the forms above to generate or upload data.
          </div>
        )}
      </div>
    </div>
  );
}
