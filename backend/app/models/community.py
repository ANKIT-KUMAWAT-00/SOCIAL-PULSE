from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    community_label_id = Column(Integer, nullable=False) # 0, 1, 2...
    name = Column(String(255), nullable=False) # e.g. "Community Alpha (AI & Data Researchers)"
