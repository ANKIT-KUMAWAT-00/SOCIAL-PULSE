from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    community_label_id = Column(Integer, nullable=False) # 0, 1, 2...
    name = Column(String(255), nullable=False) # e.g. "Community Alpha (AI & Data Researchers)"
    member_count = Column(Integer, default=0)
    internal_density = Column(Float, default=0.0)
    modularity_contribution = Column(Float, default=0.0)
    top_discussed_topics = Column(JSON, default=list) # [{topic_id, name, score}]
    color = Column(String(32), default="#06b6d4") # Hex color for 3D visualization

    dataset = relationship("Dataset", back_populates="communities")
