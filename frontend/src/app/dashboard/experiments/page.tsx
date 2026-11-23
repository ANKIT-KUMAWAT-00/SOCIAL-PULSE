"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Sliders,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BarChart2
} from "lucide-react";
import { api } from "@/lib/api";
import { MLExperiment, Dataset } from "@/types";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<MLExperiment[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningExp, setRunningExp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [algoType, setAlgoType] = useState<string>("kmeans");
  const [expName, setExpName] = useState<string>("");
  const [nClusters, setNClusters] = useState<number>(5);
  const [featureExtractor, setFeatureExtractor] = useState<string>("embeddings");
  const [dimReduction, setDimReduction] = useState<string>("umap");
  const [eps, setEps] = useState<number>(0.5);
  const [minSamples, setMinSamples] = useState<number>(5);
  const [resolution, setResolution] = useState<number>(1.0);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dsList = await api.getDatasets();
      setDatasets(dsList);
      if (dsList.length > 0) {
        setSelectedDatasetId(dsList[0].id);
        const expList = await api.getExperiments(dsList[0].id);
        setExperiments(expList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize experiments workspace.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-cyan-glow" />
          <span>ML Experiments & Benchmark Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Launch and compare reproducible unsupervised algorithms on actual dataset vectors. Evaluates Silhouette, Davies-Bouldin, and Calinski-Harabasz metrics.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 min-w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Experiment Configurator & Launch Panel */}
      <div className="p-6 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-glow pb-2 border-b border-surface-border">
          <Sliders className="w-4 h-4" />
          <span>Configure Algorithm Experiment</span>
        </div>

        <form onSubmit={handleLaunchExperiment} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Algorithm Select */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Clustering Algorithm
              </label>
              <select
                value={algoType}
                onChange={(e) => setAlgoType(e.target.value)}
                className="w-full bg-midnight-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-glow"
              >
                <option value="kmeans">K-Means (Centroid)</option>
                <option value="hdbscan">HDBSCAN (Hierarchical Density)</option>
                <option value="dbscan">DBSCAN (Density-Based)</option>
                <option value="louvain">Louvain (Graph Community)</option>
              </select>
            </div>

            {/* Experiment Custom Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Experiment Label
              </label>
              <input
                type="text"
                placeholder="e.g. K-Means (k=6, Cosine)"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full bg-midnight-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-glow"
              />
            </div>

            {/* Conditional Parameters based on Algorithm */}
            {algoType === "kmeans" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Number of Clusters (k): {nClusters}
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={nClusters}
                  onChange={(e) => setNClusters(Number(e.target.value))}
                  className="w-full accent-violet-glow"
                />
              </div>
            )}

            {algoType === "dbscan" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Epsilon (eps): {eps}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={eps}
                  onChange={(e) => setEps(Number(e.target.value))}
                  className="w-full accent-cyan-glow"
                />
              </div>
            )}

            {algoType === "hdbscan" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Min Cluster Size: {minSamples}
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={minSamples}
                  onChange={(e) => setMinSamples(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            )}

            {algoType === "louvain" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Resolution Parameter: {resolution}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            )}

            {algoType !== "louvain" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Feature Representation
                </label>
                <select
                  value={featureExtractor}
                  onChange={(e) => setFeatureExtractor(e.target.value)}
                  className="w-full bg-midnight-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-glow"
                >
                  <option value="embeddings">Sentence Transformers (384-dim)</option>
                  <option value="tfidf">TF-IDF Vectorizer (2500 n-grams)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={runningExp}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-glow to-cyan-glow hover:brightness-110 text-white font-semibold text-xs flex items-center gap-2 shadow-glow-violet transition-all disabled:opacity-50"
            >
              {runningExp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Vector Partitions...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Benchmark Experiment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Experiments Benchmark Table */}
      <div className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-4">
        <h3 className="text-base font-semibold text-white">
          Experiment Results & Algorithm Comparison
        </h3>

        {experiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950 text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Experiment Name</th>
                  <th className="py-3 px-4 font-medium">Algorithm</th>
                  <th className="py-3 px-4 font-medium">Clusters</th>
                  <th className="py-3 px-4 font-medium">Outliers</th>
                  <th className="py-3 px-4 font-medium">Silhouette</th>
                  <th className="py-3 px-4 font-medium">Davies-Bouldin</th>
                  <th className="py-3 px-4 font-medium">Calinski-Harabasz</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-gray-300">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-glow" />
                      {exp.name}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-gray-400">
                      {exp.algorithm_type}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{exp.num_clusters}</td>
                    <td className="py-3.5 px-4 text-rose-400">{exp.num_outliers}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {exp.silhouette_score !== null ? exp.silhouette_score.toFixed(4) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.davies_bouldin_score !== null ? exp.davies_bouldin_score.toFixed(4) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.calinski_harabasz_score !== null ? exp.calinski_harabasz_score.toFixed(1) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{exp.execution_time_ms.toFixed(1)}ms</td>
                    <td className="py-3.5 px-4 text-[11px] text-gray-500">
                      {new Date(exp.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            No experiments launched yet. Use the configurator above to run a clustering benchmark.
          </div>
        )}
      </div>
    </div>
  );
}
