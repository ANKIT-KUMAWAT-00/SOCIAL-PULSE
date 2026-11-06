from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class MLExperiment(Base):
    __tablename__ = "ml_experiments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    algorithm_type = Column(String(64), nullable=False) # "kmeans", "dbscan", "hdbscan", "louvain"
    pipeline_type = Column(String(64), default="topic") # "topic" or "community"
    parameters = Column(JSON, default=dict) # e.g. {"n_clusters": 5, "eps": 0.5, "metric": "cosine"}
