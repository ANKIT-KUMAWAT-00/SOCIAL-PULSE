from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

class TopicCluster(Base):
    __tablename__ = "topic_clusters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    cluster_label_id = Column(Integer, nullable=False) # e.g. 0, 1, 2, or -1 (outlier)
    name = Column(String(255), nullable=False) # e.g. "Topic #1: AI & Machine Learning"
