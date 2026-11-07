from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class TopicClusterResponse(BaseModel):
    id: int
    dataset_id: int
    cluster_label_id: int
    name: str
    top_keywords: List[str]
    representative_posts: List[str]
    post_count: int
    percentage: float
    coherence_score: float
    color: str

    class Config:
        from_attributes = True

class TopicRunRequest(BaseModel):
    dataset_id: int
    algorithm: str = "hdbscan"  # "kmeans", "hdbscan", "dbscan"
    feature_extractor: str = "embeddings" # "embeddings" or "tfidf"
    n_clusters: Optional[int] = 5 # for kmeans
    min_cluster_size: Optional[int] = 5 # for hdbscan
    eps: Optional[float] = 0.5 # for dbscan
    min_samples: Optional[int] = 5 # for dbscan
    dim_reduction: str = "umap" # "umap" or "pca"

class TopicScatterPoint(BaseModel):
    id: int
    post_id: str
    user_id: str
    text: str
    topic_cluster_id: int
    topic_name: str
    color: str
    x: float
    y: float
    z: Optional[float] = 0.0
    is_outlier: bool
    likes: int
    comments: int

class TopicVisualizationResponse(BaseModel):
    dataset_id: int
    algorithm: str
    total_points: int
    num_clusters: int
    outliers_count: int
    clusters: List[TopicClusterResponse]
    points: List[TopicScatterPoint]
