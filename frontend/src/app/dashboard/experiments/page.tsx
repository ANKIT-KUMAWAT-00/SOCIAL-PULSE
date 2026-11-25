"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FlaskConical, Play, Sliders, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { MLExperiment } from "@/types";
import { useDataset } from "@/context/DatasetContext";

export default function ExperimentsPage() {
  const { selectedDatasetId } = useDataset();
  const [experiments, setExperiments] = useState<MLExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningExp, setRunningExp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [algoType, setAlgoType] = useState<string>("kmeans");
  const [expName, setExpName] = useState<string>("");
  const [nClusters, setNClusters] = useState<number>(5);
  const [featureExtractor, setFeatureExtractor] = useState<string>("embeddings");
  const [dimReduction, setDimReduction] = useState<string>("umap");
  const [eps, setEps] = useState<number>(0.5);
  const [minSamples, setMinSamples] = useState<number>(5);
  const [resolution, setResolution] = useState<number>(1.0);

  const loadExperiments = useCallback(async () => {
    if (!selectedDatasetId) return;
    try {
      setLoading(true);
      setError(null);
      const expList = await api.getExperiments(selectedDatasetId);
      setExperiments(expList);
    } catch (err: any) {
      setError(err.message || "Failed to load experiments.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const handleLaunchExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) return;

    try {
      setRunningExp(true);
      setError(null);

      const params: Record<string, any> = {};
      if (algoType === "kmeans") {
        params.n_clusters = nClusters;
        params.feature_extractor = featureExtractor;
        params.dim_reduction = dimReduction;
      } else if (algoType === "dbscan") {
        params.eps = eps;
        params.min_samples = minSamples;
        params.feature_extractor = featureExtractor;
        params.dim_reduction = dimReduction;
      } else if (algoType === "hdbscan") {
        params.min_cluster_size = minSamples;
        params.feature_extractor = featureExtractor;
        params.dim_reduction = dimReduction;
      } else if (algoType === "louvain") {
        params.resolution = resolution;
      }

      const res = await api.runExperiment({
        dataset_id: selectedDatasetId,
        name: expName || undefined,
        algorithm_type: algoType,
        pipeline_type: algoType === "louvain" ? "community" : "topic",
        parameters: params,
      });

      setExperiments([res, ...experiments]);
      setExpName("");
    } catch (err: any) {
      setError(err.message || "Experiment run failed.");
    } finally {
      setRunningExp(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/15">
        <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
          07 // BENCHMARK LAB
        </div>
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-[#56B4F9]" />
          <span>ML EXPERIMENTS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          COMPARE K-MEANS, HDBSCAN, DBSCAN & LOUVAIN WITH EMPIRICAL SILHOUETTE, DAVIES-BOULDIN & CALINSKI-HARABASZ SCORES
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#050608] border border-[#FF2E93]/50 text-[#FF2E93] font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 min-w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Configurator */}
      <div className="border border-white/15 bg-[#050608] p-6 space-y-6">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase text-[#56B4F9] pb-3 border-b border-white/10">
          <Sliders className="w-3.5 h-3.5" />
          <span>CONFIGURE ALGORITHM RUN</span>
        </div>

        <form onSubmit={handleLaunchExperiment} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                Algorithm
              </label>
              <select
                value={algoType}
                onChange={(e) => setAlgoType(e.target.value)}
                className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#56B4F9]"
              >
                <option value="kmeans">K-Means (Centroid)</option>
                <option value="hdbscan">HDBSCAN (Density)</option>
                <option value="dbscan">DBSCAN (Epsilon)</option>
                <option value="louvain">Louvain (Graph)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                Experiment Label
              </label>
              <input
                type="text"
                placeholder="e.g. K-Means k=6 Embeddings"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9]"
              />
            </div>

            {algoType === "kmeans" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Clusters (k): {nClusters}
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={nClusters}
                  onChange={(e) => setNClusters(Number(e.target.value))}
                  className="w-full accent-[#56B4F9]"
                />
              </div>
            )}

            {algoType === "dbscan" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Epsilon (eps): {eps}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={eps}
                  onChange={(e) => setEps(Number(e.target.value))}
                  className="w-full accent-[#FF2E93]"
                />
              </div>
            )}

            {algoType === "hdbscan" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Min Cluster Size: {minSamples}
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={minSamples}
                  onChange={(e) => setMinSamples(Number(e.target.value))}
                  className="w-full accent-[#56B4F9]"
                />
              </div>
            )}

            {algoType === "louvain" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Resolution: {resolution}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full accent-[#FF2E93]"
                />
              </div>
            )}

            {algoType !== "louvain" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Feature Vectorizer
                </label>
                <select
                  value={featureExtractor}
                  onChange={(e) => setFeatureExtractor(e.target.value)}
                  className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#56B4F9]"
                >
                  <option value="embeddings">Sentence Transformers</option>
                  <option value="tfidf">TF-IDF Matrix</option>
                </select>
              </div>
            )}

            {algoType !== "louvain" && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Manifold Reducer
                </label>
                <select
                  value={dimReduction}
                  onChange={(e) => setDimReduction(e.target.value)}
                  className="w-full bg-black border border-white/15 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#56B4F9]"
                >
                  <option value="umap">UMAP</option>
                  <option value="pca">PCA</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={runningExp || !selectedDatasetId}
              className="px-6 py-2.5 bg-[#56B4F9] hover:bg-[#7CC8FF] text-black font-mono font-bold text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 transition-colors disabled:opacity-40"
            >
              {runningExp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>EXECUTING BENCHMARK...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>LAUNCH EXPERIMENT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="border border-white/15 bg-[#050608] p-6 space-y-4">
        <h3 className="font-display text-sm tracking-[0.12em] uppercase text-white">
          RECORDED BENCHMARK RUNS
        </h3>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-zinc-500">LOADING...</div>
        ) : experiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-zinc-500 border-b border-white/15 uppercase text-[10px] tracking-[0.16em]">
                <tr>
                  <th className="py-3 px-4 font-medium">Experiment</th>
                  <th className="py-3 px-4 font-medium">Algorithm</th>
                  <th className="py-3 px-4 font-medium">Clusters</th>
                  <th className="py-3 px-4 font-medium">Outliers</th>
                  <th className="py-3 px-4 font-medium">Silhouette</th>
                  <th className="py-3 px-4 font-medium">Davies-Bouldin</th>
                  <th className="py-3 px-4 font-medium">Calinski-Harabasz</th>
                  <th className="py-3 px-4 font-medium">Modularity</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-zinc-300 tabular-nums">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#56B4F9]" />
                      {exp.name}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-zinc-400">
                      {exp.algorithm_type}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{exp.num_clusters}</td>
                    <td className="py-3.5 px-4 text-[#FF2E93]">{exp.num_outliers}</td>
                    <td className="py-3.5 px-4 text-[#56B4F9] font-bold">
                      {exp.silhouette_score !== null ? exp.silhouette_score.toFixed(4) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.davies_bouldin_score !== null ? exp.davies_bouldin_score.toFixed(4) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.calinski_harabasz_score !== null
                        ? exp.calinski_harabasz_score.toFixed(1)
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-[#FF2E93]">
                      {exp.modularity !== null ? exp.modularity.toFixed(4) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {exp.execution_time_ms.toFixed(1)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-600">
            NO EXPERIMENTS LAUNCHED FOR THIS DATASET YET.
          </div>
        )}
      </div>
    </div>
  );
}
