import os
import json
import uuid
import pandas as pd
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import UPLOAD_DIR
from app.models.dataset import Dataset
from app.models.post import SocialPost
from app.models.user import SocialUser
from app.models.relationship import UserRelationship
from app.models.topic import TopicCluster
from app.models.community import Community
from app.models.job import ProcessingJob
from app.schemas.dataset import DatasetResponse, SyntheticDatasetRequest
from app.utils.synthetic_data import generate_synthetic_social_dataset
from app.ml.preprocessor import clean_social_text
from app.ml.topic_engine import topic_engine
from app.ml.graph_engine import community_engine
from app.ml.cross_analyzer import cross_analyzer

router = APIRouter(prefix="/datasets", tags=["Datasets"])

def execute_full_dataset_pipeline(dataset_id: int, db: Session, job_id: Optional[str] = None):
    """
    Executes Topic Discovery, Community Detection, and Cross-Analysis in one coordinated pass.
    Saves all results into DB models.
    """
    if job_id:
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if job:
            job.status = "processing"
            job.progress = 10.0
            job.message = "Running Topic Discovery (embeddings + clustering)..."
            db.commit()

    # Fetch posts, users, relationships
    posts = db.query(SocialPost).filter(SocialPost.dataset_id == dataset_id).all()
    users = db.query(SocialUser).filter(SocialUser.dataset_id == dataset_id).all()
    rels = db.query(UserRelationship).filter(UserRelationship.dataset_id == dataset_id).all()

    if not posts or not users:
        if job_id and job:
            job.status = "failed"
            job.message = "Dataset has no posts or users to analyze"
            db.commit()
        return

    # 1. Topic Discovery Pipeline
    raw_texts = [p.text for p in posts]
    topic_res = topic_engine.run_full_pipeline(
        raw_texts=raw_texts,
        algorithm="hdbscan",
        feature_extractor="embeddings"
    )

    if job_id and job:
        job.progress = 50.0
        job.message = "Running Community Discovery (graph + Louvain modularity)..."
        db.commit()

    # Clear previous topics for this dataset
    db.query(TopicCluster).filter(TopicCluster.dataset_id == dataset_id).delete()

    # Save new TopicClusters
    topic_label_to_id = {}
    for t in topic_res["cluster_summaries"]:
        tc = TopicCluster(
            dataset_id=dataset_id,
            cluster_label_id=t["cluster_label_id"],
            name=t["name"],
            top_keywords=t["top_keywords"],
            representative_posts=t["representative_posts"],
            post_count=t["post_count"],
            percentage=t["percentage"],
            coherence_score=t["coherence_score"],
            color=t["color"]
        )
        db.add(tc)
        db.flush()
        topic_label_to_id[t["cluster_label_id"]] = tc.id

    # Update posts with topic assignment and 3D UMAP coordinates
    labels = topic_res["labels"]
    coords = topic_res["coords_3d"]
    for i, p in enumerate(posts):
        p.topic_cluster_id = labels[i]
        p.is_outlier = (labels[i] == -1)
        p.embedding_x = float(coords[i][0])
        p.embedding_y = float(coords[i][1])
        p.embedding_z = float(coords[i][2]) if len(coords[i]) > 2 else 0.0

    # 2. Community Discovery Pipeline
    user_dicts = [
        {
            "user_id_str": u.user_id_str,
            "username": u.username,
            "follower_count": u.follower_count,
            "following_count": u.following_count
        }
        for u in users
    ]
    rel_dicts = [
        {
            "source_user_id_str": r.source_user_id_str,
            "target_user_id_str": r.target_user_id_str,
            "interaction_weight": r.interaction_weight,
            "relationship_type": r.relationship_type
        }
        for r in rels
    ]

    comm_res = community_engine.run_community_pipeline(user_dicts, rel_dicts)

    if job_id and job:
        job.progress = 80.0
