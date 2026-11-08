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

