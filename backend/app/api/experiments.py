import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dataset import Dataset
from app.models.post import SocialPost
from app.models.user import SocialUser
from app.models.relationship import UserRelationship
from app.models.experiment import MLExperiment
from app.schemas.experiment import ExperimentRunRequest, ExperimentResponse
from app.ml.topic_engine import topic_engine
from app.ml.graph_engine import community_engine

router = APIRouter(prefix="/experiments", tags=["ML Experiments"])

@router.get("", response_model=List[ExperimentResponse])
def list_experiments(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MLExperiment)
    if dataset_id:
        query = query.filter(MLExperiment.dataset_id == dataset_id)
    return query.order_by(MLExperiment.created_at.desc()).all()

@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(MLExperiment).filter(MLExperiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/run", response_model=ExperimentResponse)
def run_experiment(req: ExperimentRunRequest, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    algo = req.algorithm_type.lower()
    start_time = time.time()

    if req.pipeline_type == "community" or algo == "louvain":
        # Graph community detection experiment
        users = db.query(SocialUser).filter(SocialUser.dataset_id == req.dataset_id).all()
        rels = db.query(UserRelationship).filter(UserRelationship.dataset_id == req.dataset_id).all()

        user_dicts = [
            {"user_id_str": u.user_id_str, "username": u.username, "follower_count": u.follower_count, "following_count": u.following_count}
            for u in users
        ]
        rel_dicts = [
            {"source_user_id_str": r.source_user_id_str, "target_user_id_str": r.target_user_id_str, "interaction_weight": r.interaction_weight, "relationship_type": r.relationship_type}
            for r in rels
        ]

        resolution = float(req.parameters.get("resolution", 1.0))
        res = community_engine.run_community_pipeline(user_dicts, rel_dicts, resolution=resolution)

        duration_ms = round((time.time() - start_time) * 1000, 2)
        exp = MLExperiment(
            dataset_id=req.dataset_id,
            name=req.name or f"Louvain (Resolution={resolution})",
            algorithm_type="louvain",
            pipeline_type="community",
            parameters={"resolution": resolution},
            execution_time_ms=duration_ms,
            num_clusters=len(res["communities"]),
            num_outliers=0,
            modularity=res["modularity"],
            metrics_summary={
                "density": res["density"],
                "num_nodes": res["num_nodes"],
                "num_edges": res["num_edges"]
            }
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp

    else:
        # Topic clustering experiment (K-Means, DBSCAN, HDBSCAN)
        posts = db.query(SocialPost).filter(SocialPost.dataset_id == req.dataset_id).all()
        if not posts:
            raise HTTPException(status_code=400, detail="No posts available for clustering")

        raw_texts = [p.text for p in posts]
        feature_extractor = req.parameters.get("feature_extractor", "embeddings")
        dim_reduction = req.parameters.get("dim_reduction", "umap")
        n_clusters = int(req.parameters.get("n_clusters", 5))
        min_cluster_size = int(req.parameters.get("min_cluster_size", 5))
        eps = float(req.parameters.get("eps", 0.5))
        min_samples = int(req.parameters.get("min_samples", 5))

        res = topic_engine.run_full_pipeline(
            raw_texts=raw_texts,
            algorithm=algo,
            feature_extractor=feature_extractor,
            n_clusters=n_clusters,
            min_cluster_size=min_cluster_size,
            eps=eps,
            min_samples=min_samples,
            dim_reduction=dim_reduction
        )

        metrics = res["metrics"]
        duration_ms = res["duration_ms"]

        exp = MLExperiment(
            dataset_id=req.dataset_id,
            name=req.name or f"{algo.upper()} ({feature_extractor.title()})",
            algorithm_type=algo,
            pipeline_type="topic",
            parameters=req.parameters,
            execution_time_ms=duration_ms,
            num_clusters=metrics["num_clusters"],
            num_outliers=metrics["num_outliers"],
            silhouette_score=metrics.get("silhouette_score"),
            davies_bouldin_score=metrics.get("davies_bouldin_score"),
            calinski_harabasz_score=metrics.get("calinski_harabasz_score"),
            metrics_summary=metrics
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp
