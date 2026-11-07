from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CommunityResponse(BaseModel):
    id: int
    dataset_id: int
    community_label_id: int
    name: str
    member_count: int
    internal_density: float
    modularity_contribution: float
    top_discussed_topics: List[Dict[str, Any]]
    color: str

    class Config:
        from_attributes = True

class CommunityRunRequest(BaseModel):
    dataset_id: int
    resolution: float = 1.0 # Louvain modularity resolution parameter
    weight_field: str = "interaction_weight"

class NetworkNode(BaseModel):
    id: str # user_id_str
    username: str
