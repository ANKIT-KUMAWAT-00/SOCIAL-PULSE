from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(64), primary_key=True, index=True) # UUID string
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=True)
    job_type = Column(String(64), nullable=False) # "generate_synthetic", "run_topic_clustering", "run_community_detection", "run_full_pipeline"
    status = Column(String(32), default="pending") # "pending", "processing", "completed", "failed"
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    message = Column(Text, default="Initialized")
    result_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    dataset = relationship("Dataset", back_populates="jobs")
