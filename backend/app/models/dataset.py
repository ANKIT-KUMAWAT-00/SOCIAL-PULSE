from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(512), nullable=True)
    num_posts = Column(Integer, default=0)
    num_users = Column(Integer, default=0)
    num_relationships = Column(Integer, default=0)
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("SocialPost", back_populates="dataset", cascade="all, delete-orphan")
    users = relationship("SocialUser", back_populates="dataset", cascade="all, delete-orphan")
    relationships = relationship("UserRelationship", back_populates="dataset", cascade="all, delete-orphan")
    topics = relationship("TopicCluster", back_populates="dataset", cascade="all, delete-orphan")
    communities = relationship("Community", back_populates="dataset", cascade="all, delete-orphan")
    experiments = relationship("MLExperiment", back_populates="dataset", cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="dataset", cascade="all, delete-orphan")
