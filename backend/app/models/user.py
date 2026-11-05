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
