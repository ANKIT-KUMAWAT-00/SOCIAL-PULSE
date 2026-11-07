from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    is_synthetic: bool = False

class DatasetResponse(DatasetBase):
    id: int
    file_path: Optional[str] = None
    num_posts: int = 0
    num_users: int = 0
    num_relationships: int = 0
    is_synthetic: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class SyntheticDatasetRequest(BaseModel):
    name: str = "SocialPulse Alpha Benchmark"
    description: str = "High-realism multi-topic multi-community synthetic benchmark dataset"
    num_posts: int = 500
    num_users: int = 80
    topics_count: int = 5
    outlier_ratio: float = 0.08
