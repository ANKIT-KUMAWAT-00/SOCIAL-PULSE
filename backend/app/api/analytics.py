from collections import defaultdict
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dataset import Dataset
from app.models.post import SocialPost
from app.models.user import SocialUser
from app.models.relationship import UserRelationship
from app.models.topic import TopicCluster
from app.models.community import Community
from app.models.experiment import MLExperiment
from app.schemas.analytics import (
    OverviewMetricsResponse,
    TrendingTopicsResponse,
    TrendingTopicItem,
    TopicCommunityMatrixResponse
)
from app.ml.cross_analyzer import cross_analyzer

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewMetricsResponse)
def get_overview_metrics(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if not dataset_id:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if not latest:
            return OverviewMetricsResponse(
                dataset_id=None,
                dataset_name="No Dataset Loaded",
                is_synthetic=False,
                total_posts=0,
                total_users=0,
                total_connections=0,
                discovered_topics=0,
                discovered_communities=0,
                noise_outlier_percentage=0.0,
                modularity_score=0.0,
                avg_clustering_coefficient=0.0,
                topic_distribution=[],
                community_distribution=[],
                recent_activity=[],
                algorithm_benchmark=[]
            )
        dataset_id = latest.id
        ds = latest
    else:
        ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()

    posts = db.query(SocialPost).filter(SocialPost.dataset_id == dataset_id).all()
    users = db.query(SocialUser).filter(SocialUser.dataset_id == dataset_id).all()
    rels = db.query(UserRelationship).filter(UserRelationship.dataset_id == dataset_id).all()
    topics = db.query(TopicCluster).filter(TopicCluster.dataset_id == dataset_id).all()
    comms = db.query(Community).filter(Community.dataset_id == dataset_id).all()
    exps = db.query(MLExperiment).filter(MLExperiment.dataset_id == dataset_id).order_by(MLExperiment.created_at.desc()).limit(6).all()

    total_posts = len(posts)
    outliers = sum(1 for p in posts if p.is_outlier or p.topic_cluster_id == -1)
    noise_pct = round((outliers / max(1, total_posts)) * 100, 2)

    topic_dist = [
        {
            "id": t.cluster_label_id,
            "name": t.name,
            "count": t.post_count,
            "percentage": t.percentage,
            "color": t.color
        }
        for t in topics
    ]

    comm_dist = [
        {
            "id": c.community_label_id,
            "name": c.name,
            "count": c.member_count,
            "density": c.internal_density,
            "color": c.color
        }
        for c in comms
    ]

    # Modularity
    modularity = round(sum(c.modularity_contribution for c in comms), 4)

    # Activity sample
    recent_activity = [
        {
            "id": p.id,
            "post_id": p.post_id_str,
            "author": p.user_id_str,
            "text": p.text[:120] + ("..." if len(p.text) > 120 else ""),
            "likes": p.likes,
            "topic_cluster_id": p.topic_cluster_id,
            "timestamp": p.timestamp.isoformat() if p.timestamp else None
        }
        for p in posts[:8]
    ]

    # Benchmark comparison
    benchmark = [
        {
            "id": e.id,
            "algorithm": e.algorithm_type.upper(),
            "name": e.name,
            "duration_ms": e.execution_time_ms,
            "clusters": e.num_clusters,
            "outliers": e.num_outliers,
            "silhouette": e.silhouette_score,
            "davies_bouldin": e.davies_bouldin_score,
            "calinski_harabasz": e.calinski_harabasz_score,
            "modularity": e.modularity
        }
        for e in exps
    ]

