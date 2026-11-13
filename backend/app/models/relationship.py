from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserRelationship(Base):
    __tablename__ = "user_relationships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), index=True, nullable=False)
    source_user_id_str = Column(String(128), index=True, nullable=False)
    target_user_id_str = Column(String(128), index=True, nullable=False)
    relationship_type = Column(String(64), default="follow") # follow, mention, retweet, reply
    interaction_weight = Column(Float, default=1.0)

    dataset = relationship("Dataset", back_populates="relationships")
