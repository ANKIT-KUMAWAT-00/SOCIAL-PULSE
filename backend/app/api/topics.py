from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dataset import Dataset
from app.models.post import SocialPost
from app.models.topic import TopicCluster
from app.schemas.topic import (
    TopicClusterResponse,
    TopicRunRequest,
    TopicScatterPoint,
    TopicVisualizationResponse
)
from app.ml.topic_engine import topic_engine

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("", response_model=List[TopicClusterResponse])
def get_topics(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TopicCluster)
    if dataset_id:
        query = query.filter(TopicCluster.dataset_id == dataset_id)
    else:
        # Get topics from latest dataset
        latest_ds = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if latest_ds:
            query = query.filter(TopicCluster.dataset_id == latest_ds.id)
    return query.order_by(TopicCluster.post_count.desc()).all()



@router.get("/visualization", response_model=TopicVisualizationResponse)
def get_topic_visualization(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if not dataset_id:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if not latest:
            return TopicVisualizationResponse(
                dataset_id=0, algorithm="none", total_points=0, num_clusters=0,
                outliers_count=0, clusters=[], points=[]
            )
        dataset_id = latest.id

    clusters = db.query(TopicCluster).filter(TopicCluster.dataset_id == dataset_id).all()
    posts = db.query(SocialPost).filter(SocialPost.dataset_id == dataset_id).all()

    color_map = {c.cluster_label_id: c.color for c in clusters}
    name_map = {c.cluster_label_id: c.name for c in clusters}

    points = []
    outliers_count = 0
    for p in posts:
        lbl = p.topic_cluster_id if p.topic_cluster_id is not None else -1
        if lbl == -1 or p.is_outlier:
            outliers_count += 1
        points.append(TopicScatterPoint(
            id=p.id,
            post_id=p.post_id_str,
            user_id=p.user_id_str,
            text=p.text,
            topic_cluster_id=lbl,
            topic_name=name_map.get(lbl, "Outlier / Noise"),
            color=color_map.get(lbl, "#64748b"),
            x=p.embedding_x or 0.0,
            y=p.embedding_y or 0.0,
            z=p.embedding_z or 0.0,
            is_outlier=p.is_outlier or (lbl == -1),
            likes=p.likes,
            comments=p.comments
        ))

    cluster_responses = [
        TopicClusterResponse(
            id=c.id,
            dataset_id=c.dataset_id,
            cluster_label_id=c.cluster_label_id,
            name=c.name,
            top_keywords=c.top_keywords,
            representative_posts=c.representative_posts,
            post_count=c.post_count,
            percentage=c.percentage,
            coherence_score=c.coherence_score,
            color=c.color
        )
        for c in clusters
    ]

    return TopicVisualizationResponse(
        dataset_id=dataset_id,
        algorithm="HDBSCAN / Semantic Embeddings",
        total_points=len(points),
        num_clusters=len([c for c in clusters if c.cluster_label_id != -1]),
        outliers_count=outliers_count,
        clusters=cluster_responses,
        points=points
    )

@router.get("/{cluster_id}", response_model=TopicClusterResponse)
def get_topic_detail(cluster_id: int, db: Session = Depends(get_db)):
    tc = db.query(TopicCluster).filter(TopicCluster.id == cluster_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Topic cluster not found")
    return tc

