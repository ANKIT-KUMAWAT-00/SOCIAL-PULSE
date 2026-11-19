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
    execution_time_ms = Column(Float, default=0.0)
    num_clusters = Column(Integer, default=0)
    num_outliers = Column(Integer, default=0)
    silhouette_score = Column(Float, nullable=True)
    davies_bouldin_score = Column(Float, nullable=True)
    calinski_harabasz_score = Column(Float, nullable=True)
    modularity = Column(Float, nullable=True)
    metrics_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="experiments")
