from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SocialUser(Base):
    __tablename__ = "social_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id_str = Column(String(128), index=True, nullable=False)
    username = Column(String(128), nullable=False)
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    community_id = Column(Integer, nullable=True, index=True) # Community ID from Louvain
    degree_centrality = Column(Float, default=0.0)
    betweenness_centrality = Column(Float, default=0.0)
    pagerank = Column(Float, default=0.0)
    primary_topic_id = Column(Integer, nullable=True) # dominant topic discovered for this user

    # 3D layout coordinates for network visualization
