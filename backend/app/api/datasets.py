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
        job.message = "Synthesizing Cross-Sectional Topic-Community Matrix..."
        db.commit()

    # Clear previous communities for this dataset
    db.query(Community).filter(Community.dataset_id == dataset_id).delete()

    # Save new Communities
    for c in comm_res["communities"]:
        comm_obj = Community(
            dataset_id=dataset_id,
            community_label_id=c["community_label_id"],
            name=c["name"],
            member_count=c["member_count"],
            internal_density=c["internal_density"],
            modularity_contribution=c["modularity_contribution"],
            top_discussed_topics=[],
            color=c["color"]
        )
        db.add(comm_obj)

    # Update users with community assignments and 3D spring coordinates
    node_map = {n["id"]: n for n in comm_res["nodes"]}
    for u in users:
        if u.user_id_str in node_map:
            n = node_map[u.user_id_str]
            u.community_id = n["community_id"]
            u.degree_centrality = n["degree"]
            u.betweenness_centrality = n["betweenness"]
            u.pagerank = n["pagerank"]
            u.pos_x = n["x"]
            u.pos_y = n["y"]
            u.pos_z = n["z"]

    db.commit()

    # 3. Cross-Analysis
    post_dicts = [
        {"user_id_str": p.user_id_str, "topic_cluster_id": p.topic_cluster_id}
        for p in posts
    ]
    user_briefs = [
        {"user_id_str": u.user_id_str, "community_id": u.community_id}
        for u in users
    ]
    cross_res = cross_analyzer.analyze_topic_community_relationships(
        user_briefs, post_dicts, topic_res["cluster_summaries"], comm_res["communities"]
    )

    # Update communities with top discussed topics
    for c_info in cross_res["communities"]:
        c_db = db.query(Community).filter(
            Community.dataset_id == dataset_id,
            Community.community_label_id == c_info["id"]
        ).first()
        if c_db:
            c_db.top_discussed_topics = c_info.get("top_discussed_topics", [])

    if job_id and job:
        job.status = "completed"
        job.progress = 100.0
        job.message = "Analysis complete"
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            "num_topics": len(topic_res["cluster_summaries"]),
            "num_communities": len(comm_res["communities"]),
            "modularity": comm_res["modularity"],
            "duration_ms": topic_res["duration_ms"] + comm_res["duration_ms"]
        }

    db.commit()

@router.get("", response_model=List[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(ds)
    db.commit()
    return {"message": f"Dataset {dataset_id} deleted successfully"}

@router.post("/synthetic", response_model=DatasetResponse)
def create_synthetic_dataset(
    req: SyntheticDatasetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Create dataset record
    ds = Dataset(
        name=req.name,
