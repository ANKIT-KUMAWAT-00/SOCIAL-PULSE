import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.datasets import router as datasets_router, execute_full_dataset_pipeline
from app.api.topics import router as topics_router
from app.api.communities import router as communities_router
from app.api.analytics import router as analytics_router
from app.api.experiments import router as experiments_router
from app.api.jobs import router as jobs_router
from app.models.dataset import Dataset
from app.models.user import SocialUser
from app.models.relationship import UserRelationship
from app.models.post import SocialPost
from app.utils.synthetic_data import generate_synthetic_social_dataset
from app.ml.preprocessor import clean_social_text

# Ensure all tables are created immediately
Base.metadata.create_all(bind=engine)

def init_seed_data():
    db = SessionLocal()
    try:
        existing_ds = db.query(Dataset).first()
        if not existing_ds:
            print("[SocialPulse] Seeding initial SocialPulse Benchmark dataset...")
            ds = Dataset(
                name="SocialPulse Global Tech & Science Graph",
                description="High-realism multi-topic multi-community benchmark featuring AI, Systems, Web3, 3D Graphics, and Longevity.",
                is_synthetic=True,
                num_posts=300,
                num_users=60
            )
            db.add(ds)
            db.commit()
            db.refresh(ds)

            raw_data = generate_synthetic_social_dataset(num_posts=300, num_users=60, outlier_ratio=0.08)

            for u in raw_data["users"]:
                db.add(SocialUser(
                    dataset_id=ds.id,
                    user_id_str=u["user_id_str"],
                    username=u["username"],
                    follower_count=u["follower_count"],
                    following_count=u["following_count"],
                    community_id=u.get("ground_truth_community", 0)
                ))

            for r in raw_data["relationships"]:
                db.add(UserRelationship(
                    dataset_id=ds.id,
                    source_user_id_str=r["source_user_id_str"],
                    target_user_id_str=r["target_user_id_str"],
                    interaction_weight=r["interaction_weight"],
                    relationship_type=r["relationship_type"]
                ))

            for p in raw_data["posts"]:
                db.add(SocialPost(
                    dataset_id=ds.id,
                    post_id_str=p["post_id_str"],
