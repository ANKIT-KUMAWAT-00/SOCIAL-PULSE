from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ExperimentRunRequest(BaseModel):
    dataset_id: int
    name: Optional[str] = None
    algorithm_type: str # "kmeans", "dbscan", "hdbscan", "louvain"
    pipeline_type: str = "topic" # "topic" or "community"
    parameters: Dict[str, Any] = {}

class ExperimentResponse(BaseModel):
    id: int
    dataset_id: int
    name: str
    algorithm_type: str
    pipeline_type: str
    parameters: Dict[str, Any]
    execution_time_ms: float
    num_clusters: int
    num_outliers: int
    silhouette_score: Optional[float] = None
    davies_bouldin_score: Optional[float] = None
    calinski_harabasz_score: Optional[float] = None
    modularity: Optional[float] = None
    metrics_summary: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    job_id: str
    dataset_id: Optional[int] = None
    job_type: str
    status: str
    progress: float
    message: str
    result_summary: Dict[str, Any] = {}
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
