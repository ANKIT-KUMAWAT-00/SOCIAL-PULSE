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
        raw_matrix = np.zeros((num_comms, num_topics), dtype=np.float32)

        # Map each user to their personal topic distribution
        user_topic_counts = {}

        for p in posts:
            author_id = p.get("user_id") or p.get("user_id_str")
            t_id = p.get("topic_cluster_id")

            if t_id in topic_id_to_idx:
                t_idx = topic_id_to_idx[t_id]
                user_topic_counts.setdefault(author_id, {})
                user_topic_counts[author_id][t_idx] = user_topic_counts[author_id].get(t_idx, 0) + 1

                if author_id in user_community_map:
                    c_id = user_community_map[author_id]
                    if c_id in comm_id_to_idx:
                        c_idx = comm_id_to_idx[c_id]
                        raw_matrix[c_idx][t_idx] += 1.0

        # Row-normalize (Affinity proportion: sum across topics per community = 1.0)
        row_sums = raw_matrix.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        normalized_matrix = raw_matrix / row_sums

        # Attach top discussed topics to each community summary
        enriched_communities = []
        for c in valid_communities:
            c_idx = comm_id_to_idx[c["community_label_id"]]
            c_topics = []
            for t_idx, val in enumerate(normalized_matrix[c_idx]):
                if val > 0.05:
                    c_topics.append({
                        "topic_id": valid_topics[t_idx]["cluster_label_id"],
                        "name": valid_topics[t_idx]["name"],
                        "affinity": round(float(val), 3)
                    })
            c_topics.sort(key=lambda x: -x["affinity"])
            c_copy = dict(c)
            c_copy["top_discussed_topics"] = c_topics[:3]
            enriched_communities.append(c_copy)

        # Generate Natural Language Insights
        insights = []

        # Find dominant topic for each community
        for c_idx, c in enumerate(enriched_communities):
            best_t_idx = int(np.argmax(normalized_matrix[c_idx]))
            affinity = normalized_matrix[c_idx][best_t_idx]
            topic_name = valid_topics[best_t_idx]["name"]
            if affinity >= 0.40:
                insights.append(
                    f"{c['name']} demonstrates high topical concentration ({round(affinity*100, 1)}%) in {topic_name}."
                )

        # Find cross-community bridge topics (topics with high presence across multiple communities)
        topic_spread = np.count_nonzero(normalized_matrix > 0.15, axis=0)
        for t_idx, count in enumerate(topic_spread):
            if count >= 2:
                insights.append(
                    f"{valid_topics[t_idx]['name']} serves as a shared bridge topic discussed across {count} distinct communities."
                )

        if not insights:
            insights.append("Communities show diverse, balanced cross-topic discussions without extreme polarization.")

        return {
            "topics": [
                {
                    "id": t["cluster_label_id"],
                    "name": t["name"],
                    "color": t.get("color", "#8b5cf6")
                }
