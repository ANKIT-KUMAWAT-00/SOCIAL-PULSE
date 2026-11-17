from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dataset import Dataset
from app.models.user import SocialUser
from app.models.relationship import UserRelationship
from app.models.community import Community
from app.schemas.community import (
    CommunityResponse,
    CommunityRunRequest,
    NetworkNode,
    NetworkEdge,
    NetworkGraphResponse
)
from app.ml.graph_engine import community_engine

router = APIRouter(prefix="/communities", tags=["Communities"])

@router.get("", response_model=List[CommunityResponse])
def get_communities(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Community)
    if dataset_id:
        query = query.filter(Community.dataset_id == dataset_id)
    else:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if latest:
            query = query.filter(Community.dataset_id == latest.id)
    return query.order_by(Community.member_count.desc()).all()



@router.get("/network", response_model=NetworkGraphResponse)
def get_network_graph(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if not dataset_id:
        latest = db.query(Dataset).order_by(Dataset.id.desc()).first()
        if not latest:
            return NetworkGraphResponse(
                dataset_id=0, nodes=[], edges=[], communities=[],
                modularity=0.0, density=0.0, num_nodes=0, num_edges=0
            )
        dataset_id = latest.id

    users = db.query(SocialUser).filter(SocialUser.dataset_id == dataset_id).all()
    rels = db.query(UserRelationship).filter(UserRelationship.dataset_id == dataset_id).all()
    comms = db.query(Community).filter(Community.dataset_id == dataset_id).all()

    color_map = {c.community_label_id: c.color for c in comms}
    name_map = {c.community_label_id: c.name for c in comms}

    nodes = []
    for u in users:
        cid = u.community_id if u.community_id is not None else 0
        nodes.append(NetworkNode(
            id=u.user_id_str,
            username=u.username,
            community_id=cid,
            community_name=name_map.get(cid, f"Community #{cid+1}"),
            color=color_map.get(cid, "#06b6d4"),
            degree=round(u.degree_centrality or 0.0, 4),
            betweenness=round(u.betweenness_centrality or 0.0, 4),
            pagerank=round(u.pagerank or 0.0, 4),
            followers=u.follower_count or 0,
            following=u.following_count or 0,
            primary_topic="General",
            x=u.pos_x or 0.0,
            y=u.pos_y or 0.0,
            z=u.pos_z or 0.0
        ))

    edges = [
        NetworkEdge(
            source=r.source_user_id_str,
            target=r.target_user_id_str,
            weight=r.interaction_weight or 1.0,
            type=r.relationship_type or "follow"
        )
        for r in rels
    ]

    comm_responses = [
        CommunityResponse(
            id=c.id,
            dataset_id=c.dataset_id,
            community_label_id=c.community_label_id,
            name=c.name,
            member_count=c.member_count,
            internal_density=c.internal_density,
            modularity_contribution=c.modularity_contribution,
            top_discussed_topics=c.top_discussed_topics or [],
            color=c.color
        )
        for c in comms
    ]

    total_possible_edges = (len(users) * (len(users) - 1)) / 2 if len(users) > 1 else 1
    density = round(len(edges) / max(1, total_possible_edges), 4)

    return NetworkGraphResponse(
        dataset_id=dataset_id,
        nodes=nodes,
        edges=edges,
        communities=comm_responses,
        modularity=round(sum(c.modularity_contribution for c in comms), 4),
        density=density,
        num_nodes=len(nodes),
        num_edges=len(edges)
    )

@router.get("/{community_id}", response_model=CommunityResponse)
def get_community_detail(community_id: int, db: Session = Depends(get_db)):
    c = db.query(Community).filter(Community.id == community_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Community not found")
    return c

@router.post("/run", response_model=NetworkGraphResponse)
def run_community_detection(
    req: CommunityRunRequest,
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    users = db.query(SocialUser).filter(SocialUser.dataset_id == req.dataset_id).all()
    rels = db.query(UserRelationship).filter(UserRelationship.dataset_id == req.dataset_id).all()

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

    res = community_engine.run_community_pipeline(user_dicts, rel_dicts, resolution=req.resolution)

    # Replace communities
    db.query(Community).filter(Community.dataset_id == req.dataset_id).delete()

    created_comms = []
    for c in res["communities"]:
        c_obj = Community(
            dataset_id=req.dataset_id,
            community_label_id=c["community_label_id"],
            name=c["name"],
            member_count=c["member_count"],
            internal_density=c["internal_density"],
            modularity_contribution=c["modularity_contribution"],
            top_discussed_topics=[],
            color=c["color"]
        )
        db.add(c_obj)
        created_comms.append(c_obj)

    # Update users
    node_map = {n["id"]: n for n in res["nodes"]}
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

    comm_responses = [
        CommunityResponse(
            id=c.id or 0,
            dataset_id=c.dataset_id,
            community_label_id=c.community_label_id,
            name=c.name,
            member_count=c.member_count,
            internal_density=c.internal_density,
            modularity_contribution=c.modularity_contribution,
            top_discussed_topics=[],
            color=c.color
        )
        for c in created_comms
    ]

    return NetworkGraphResponse(
        dataset_id=req.dataset_id,
        nodes=[NetworkNode(**n) for n in res["nodes"]],
        edges=[NetworkEdge(**e) for e in res["edges"]],
        communities=comm_responses,
        modularity=res["modularity"],
        density=res["density"],
        num_nodes=res["num_nodes"],
        num_edges=res["num_edges"]
    )


