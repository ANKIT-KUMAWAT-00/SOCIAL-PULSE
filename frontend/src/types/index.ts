export interface Dataset {
  id: number;
  name: string;
  description?: string;
  file_path?: string;
  num_posts: number;
  num_users: number;
  num_relationships: number;
  is_synthetic: boolean;
  created_at: string;
}

export interface TopicCluster {
  id: number;
  dataset_id: number;
  cluster_label_id: number;
  name: string;
  top_keywords: string[];
  representative_posts: string[];
  post_count: number;
  percentage: number;
  coherence_score: number;
  color: string;
}

export interface TopicScatterPoint {
  id: number;
  post_id: string;
  user_id: string;
  text: string;
  topic_cluster_id: number;
  topic_name: string;
  color: string;
  x: number;
  y: number;
  z?: number;
  is_outlier: boolean;
  likes: number;
  comments: number;
}

export interface TopicVisualizationData {
  dataset_id: number;
  algorithm: string;
  total_points: number;
  num_clusters: number;
  outliers_count: number;
  clusters: TopicCluster[];
  points: TopicScatterPoint[];
}

export interface Community {
  id: number;
  dataset_id: number;
  community_label_id: number;
  name: string;
  member_count: number;
  internal_density: number;
  modularity_contribution: number;
  top_discussed_topics: {
    topic_id: number;
    name: string;
    affinity: number;
  }[];
  color: string;
}

export interface NetworkNode {
  id: string;
  username: string;
  community_id: number;
  community_name: string;
  color: string;
  degree: number;
  betweenness: number;
  pagerank: number;
  followers: number;
  following: number;
  primary_topic?: string;
  x: number;
  y: number;
  z: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface NetworkGraphData {
  dataset_id: number;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  communities: Community[];
  modularity: number;
  density: number;
  num_nodes: number;
  num_edges: number;
}

export interface OverviewMetrics {
  dataset_id: number | null;
  dataset_name: string;
  is_synthetic: boolean;
  total_posts: number;
  total_users: number;
  total_connections: number;
  discovered_topics: number;
  discovered_communities: number;
  noise_outlier_percentage: number;
  modularity_score: number;
  avg_clustering_coefficient: number;
  topic_distribution: {
    id: number;
    name: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  community_distribution: {
    id: number;
    name: string;
    count: number;
    density: number;
    color: string;
  }[];
  recent_activity: {
    id: number;
    post_id: string;
    author: string;
    text: string;
    likes: number;
    topic_cluster_id: number;
    timestamp: string | null;
  }[];
  algorithm_benchmark: {
    id: number;
    algorithm: string;
    name: string;
    duration_ms: number;
    clusters: number;
    outliers: number;
    silhouette: number | null;
    davies_bouldin: number | null;
    calinski_harabasz: number | null;
    modularity: number | null;
  }[];
}

export interface TrendingTopicItem {
  topic_id: number;
  topic_name: string;
  color: string;
  post_count: number;
  growth_rate: number;
  top_keywords: string[];
  temporal_volume: {
    date: string;
    count: number;
  }[];
}

export interface TopicCommunityMatrixData {
  dataset_id: number;
  topics: {
    id: number;
    name: string;
    color: string;
  }[];
  communities: {
    id: number;
    name: string;
    color: string;
    member_count: number;
  }[];
  matrix: number[][];
  insights: string[];
}

export interface MLExperiment {
  id: number;
  dataset_id: number;
  name: string;
  algorithm_type: string;
  pipeline_type: string;
  parameters: Record<string, any>;
  execution_time_ms: number;
  num_clusters: number;
  num_outliers: number;
  silhouette_score: number | null;
  davies_bouldin_score: number | null;
  calinski_harabasz_score: number | null;
  modularity: number | null;
  metrics_summary: Record<string, any>;
  created_at: string;
}
