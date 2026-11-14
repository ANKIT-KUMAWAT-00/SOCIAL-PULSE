import numpy as np
from typing import List, Dict, Any, Tuple

class CrossAnalyzer:
    def analyze_topic_community_relationships(
        self,
        users: List[Dict[str, Any]],
        posts: List[Dict[str, Any]],
        topics: List[Dict[str, Any]],
        communities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Computes the Cross-Pipeline Topic & Community Relationship Matrix:
        1. Maps each user's post activity to discovered topic clusters.
        2. Aggregates user topic vectors by community membership.
        3. Builds a normalized (communities x topics) affinity matrix.
        4. Incurs key natural language structural insights.
        """
        # Map user_id to community_id
        user_community_map = {}
        for u in users:
            uid = u.get("id") or u.get("user_id_str")
            comm_id = u.get("community_id")
            if comm_id is not None:
                user_community_map[uid] = comm_id

        # Non-outlier topics
        valid_topics = [t for t in topics if not t.get("is_outlier", False) and t.get("cluster_label_id", -1) != -1]
        valid_communities = sorted(communities, key=lambda c: c.get("community_label_id", 0))

        if not valid_topics or not valid_communities:
            return {
                "topics": [],
                "communities": [],
                "matrix": [],
                "insights": ["Insufficient topics or communities to construct cross-affinity matrix."]
            }

        topic_id_to_idx = {t["cluster_label_id"]: idx for idx, t in enumerate(valid_topics)}
        comm_id_to_idx = {c["community_label_id"]: idx for idx, c in enumerate(valid_communities)}

        num_comms = len(valid_communities)
        num_topics = len(valid_topics)

        # Raw counts: matrix[comm_idx][topic_idx]
