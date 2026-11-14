from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OverviewMetricsResponse(BaseModel):
    dataset_id: Optional[int]
    dataset_name: Optional[str]
    is_synthetic: bool
    total_posts: int
    total_users: int
    total_connections: int
    discovered_topics: int
    discovered_communities: int
    noise_outlier_percentage: float
    modularity_score: float
    avg_clustering_coefficient: float
    topic_distribution: List[Dict[str, Any]]
    community_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    algorithm_benchmark: List[Dict[str, Any]]

class TrendingTopicItem(BaseModel):
    topic_id: int
    topic_name: str
    color: str
    post_count: int
    growth_rate: float
    top_keywords: List[str]
    temporal_volume: List[Dict[str, Any]] # e.g. [{"date": "2026-11-01", "count": 12}, ...]

class TrendingTopicsResponse(BaseModel):
    dataset_id: int
    trending_topics: List[TrendingTopicItem]

class TopicCommunityMatrixResponse(BaseModel):
    dataset_id: int
    topics: List[Dict[str, Any]] # [{id, name, color}]
    communities: List[Dict[str, Any]] # [{id, name, color, member_count}]
    matrix: List[List[float]] # communities x topics normalized affinity matrix
    insights: List[str] # Key automatically inferred cross-sectional insights
