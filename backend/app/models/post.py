from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SocialPost(Base):
    __tablename__ = "social_posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    post_id_str = Column(String(128), index=True, nullable=False)
    user_id_str = Column(String(128), index=True, nullable=False)
    text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=True, default=datetime.utcnow)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    topic_cluster_id = Column(Integer, nullable=True, index=True) # -1 for outlier, 0..K for clusters
    embedding_x = Column(Float, nullable=True) # 2D / 3D UMAP coordinate
    embedding_y = Column(Float, nullable=True)
    embedding_z = Column(Float, nullable=True)
    is_outlier = Column(Boolean, default=False)

    dataset = relationship("Dataset", back_populates="posts")
