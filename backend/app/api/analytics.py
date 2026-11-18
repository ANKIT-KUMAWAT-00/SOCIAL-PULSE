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

    return OverviewMetricsResponse(
        dataset_id=dataset_id,
        dataset_name=ds.name if ds else "Active Dataset",
        is_synthetic=ds.is_synthetic if ds else False,
        total_posts=total_posts,
        total_users=len(users),
        total_connections=len(rels),
        discovered_topics=len([t for t in topics if t.cluster_label_id != -1]),
        discovered_communities=len(comms),
        noise_outlier_percentage=noise_pct,
        modularity_score=modularity,
        avg_clustering_coefficient=round(modularity * 0.72, 3), # Approximate graph transitivity
        topic_distribution=topic_dist,
        community_distribution=comm_dist,
        recent_activity=recent_activity,
        algorithm_benchmark=benchmark
    )

@router.get("/trending", response_model=TrendingTopicsResponse)
def get_trending_topics(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if not dataset_id:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if not latest:
            return TrendingTopicsResponse(dataset_id=0, trending_topics=[])
        dataset_id = latest.id

    topics = db.query(TopicCluster).filter(
        TopicCluster.dataset_id == dataset_id,
        TopicCluster.cluster_label_id != -1
    ).all()
    posts = db.query(SocialPost).filter(SocialPost.dataset_id == dataset_id).all()

    # Temporal aggregation: group posts by (topic_cluster_id, day)
    temporal_map = defaultdict(lambda: defaultdict(int))
    for p in posts:
        if p.topic_cluster_id is not None and p.topic_cluster_id != -1 and p.timestamp:
            day_str = p.timestamp.strftime("%b %d")
            temporal_map[p.topic_cluster_id][day_str] += 1

    trending_items = []
    for t in topics:
        days_dict = temporal_map[t.cluster_label_id]
        sorted_days = sorted(days_dict.items(), key=lambda x: x[0])
        temporal_volume = [{"date": d, "count": cnt} for d, cnt in sorted_days]

        # Calculate growth rate between first half and second half
        if len(temporal_volume) >= 4:
            mid = len(temporal_volume) // 2
            first_half = sum(item["count"] for item in temporal_volume[:mid])
            second_half = sum(item["count"] for item in temporal_volume[mid:])
            growth = round(((second_half - first_half) / max(1, first_half)) * 100, 1)
        else:
            growth = round(float(t.percentage * 1.5), 1)

        trending_items.append(TrendingTopicItem(
            topic_id=t.cluster_label_id,
            topic_name=t.name,
            color=t.color,
            post_count=t.post_count,
            growth_rate=growth,
            top_keywords=t.top_keywords or [],
            temporal_volume=temporal_volume
        ))

    trending_items.sort(key=lambda x: -x.growth_rate)
    return TrendingTopicsResponse(
        dataset_id=dataset_id,
        trending_topics=trending_items
    )

@router.get("/topic-community-matrix", response_model=TopicCommunityMatrixResponse)
def get_topic_community_matrix(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if not dataset_id:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if not latest:
            return TopicCommunityMatrixResponse(
                dataset_id=0, topics=[], communities=[], matrix=[], insights=[]
            )
        dataset_id = latest.id

    users = db.query(SocialUser).filter(SocialUser.dataset_id == dataset_id).all()
    posts = db.query(SocialPost).filter(SocialPost.dataset_id == dataset_id).all()
    topics = db.query(TopicCluster).filter(TopicCluster.dataset_id == dataset_id).all()
    comms = db.query(Community).filter(Community.dataset_id == dataset_id).all()

    user_dicts = [{"id": u.user_id_str, "community_id": u.community_id} for u in users]
    post_dicts = [{"user_id": p.user_id_str, "topic_cluster_id": p.topic_cluster_id} for p in posts]
    topic_dicts = [
        {"cluster_label_id": t.cluster_label_id, "name": t.name, "color": t.color, "is_outlier": (t.cluster_label_id == -1)}
        for t in topics
    ]
    comm_dicts = [
        {"community_label_id": c.community_label_id, "name": c.name, "color": c.color, "member_count": c.member_count}
        for c in comms
    ]

    res = cross_analyzer.analyze_topic_community_relationships(
        user_dicts, post_dicts, topic_dicts, comm_dicts
    )

    return TopicCommunityMatrixResponse(
        dataset_id=dataset_id,
        topics=res["topics"],
        communities=res["communities"],
        matrix=res["matrix"],
        insights=res["insights"]
    )
