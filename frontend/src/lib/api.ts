import {
  Dataset,
  TopicCluster,
  TopicVisualizationData,
  Community,
  NetworkGraphData,
  OverviewMetrics,
  TrendingTopicItem,
  TopicCommunityMatrixData,
  MLExperiment
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errText || res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`Fetch error at ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Datasets
  getDatasets: () => fetchJson<Dataset[]>("/datasets"),
  getDataset: (id: number) => fetchJson<Dataset>(`/datasets/${id}`),
  deleteDataset: (id: number) => fetchJson<{ message: string }>(`/datasets/${id}`, { method: "DELETE" }),
  createSyntheticDataset: (payload: {
    name?: string;
    description?: string;
    num_posts?: number;
    num_users?: number;
    outlier_ratio?: number;
  }) => fetchJson<Dataset>("/datasets/synthetic", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  uploadDataset: async (file: File, name?: string, description?: string): Promise<Dataset> => {
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);
    if (description) formData.append("description", description);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upload error: ${err}`);
    }
    return await res.json();
  },

  // Topics
  getTopics: (datasetId?: number) =>
    fetchJson<TopicCluster[]>(`/topics${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  getTopicDetail: (clusterId: number) =>
    fetchJson<TopicCluster>(`/topics/${clusterId}`),
  getTopicVisualization: (datasetId?: number) =>
    fetchJson<TopicVisualizationData>(`/topics/visualization${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  runTopicClustering: (payload: {
    dataset_id: number;
    algorithm?: string;
    feature_extractor?: string;
    n_clusters?: number;
    min_cluster_size?: number;
    eps?: number;
    min_samples?: number;
    dim_reduction?: string;
  }) => fetchJson<TopicVisualizationData>("/topics/run", {
    method: "POST",
    body: JSON.stringify(payload)
  }),

  // Communities
  getCommunities: (datasetId?: number) =>
    fetchJson<Community[]>(`/communities${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  getCommunityDetail: (communityId: number) =>
    fetchJson<Community>(`/communities/${communityId}`),
  getNetworkGraph: (datasetId?: number) =>
    fetchJson<NetworkGraphData>(`/communities/network${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  runCommunityDetection: (payload: {
    dataset_id: number;
    resolution?: number;
  }) => fetchJson<NetworkGraphData>("/communities/run", {
    method: "POST",
    body: JSON.stringify(payload)
  }),

  // Analytics
  getOverviewMetrics: (datasetId?: number) =>
    fetchJson<OverviewMetrics>(`/analytics/overview${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  getTrendingTopics: (datasetId?: number) =>
    fetchJson<{ dataset_id: number; trending_topics: TrendingTopicItem[] }>(
      `/analytics/trending${datasetId ? `?dataset_id=${datasetId}` : ""}`
    ),
  getTopicCommunityMatrix: (datasetId?: number) =>
    fetchJson<TopicCommunityMatrixData>(
      `/analytics/topic-community-matrix${datasetId ? `?dataset_id=${datasetId}` : ""}`
    ),

  // ML Experiments
  getExperiments: (datasetId?: number) =>
    fetchJson<MLExperiment[]>(`/experiments${datasetId ? `?dataset_id=${datasetId}` : ""}`),
  runExperiment: (payload: {
    dataset_id: number;
    name?: string;
    algorithm_type: string;
    pipeline_type?: string;
    parameters?: Record<string, any>;
  }) => fetchJson<MLExperiment>("/experiments/run", {
    method: "POST",
    body: JSON.stringify(payload)
  })
};
