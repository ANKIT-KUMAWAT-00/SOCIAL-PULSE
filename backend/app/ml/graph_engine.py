import time
import networkx as nx
import community as community_louvain
from typing import List, Dict, Any, Tuple

COMMUNITY_COLORS = [
    "#06b6d4", # Cyber Cyan
    "#8b5cf6", # Electric Violet
    "#10b981", # Emerald Pulse
    "#f59e0b", # Solar Amber
    "#ec4899", # Neon Pink
    "#3b82f6", # Blue Wave
    "#14b8a6", # Teal Aura
    "#f97316", # Orange Flame
    "#a855f7", # Purple Glow
    "#6366f1"  # Indigo Spark
]

class CommunityEngine:
    def run_community_pipeline(
        self,
        users: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]],
        resolution: float = 1.0
    ) -> Dict[str, Any]:
        """
        Executes end-to-end Social Community Discovery pipeline:
        - Builds weighted NetworkX graph
        - Runs Louvain community detection with modularity optimization
        - Computes Degree Centrality, Betweenness Centrality, and PageRank
        - Computes 3D Spring Layout coordinates for Three.js network rendering
        - Returns node properties, edge lists, community stats, and graph modularity
        """
        start_time = time.time()

        # 1. Build Undirected Graph for Louvain
        G = nx.Graph()

        # Add all nodes
        for u in users:
            u_id = u["user_id_str"]
            G.add_node(
                u_id,
                username=u.get("username", u_id),
                followers=u.get("follower_count", 0),
                following=u.get("following_count", 0)
            )

        # Add edges
        for r in relationships:
            src = r["source_user_id_str"]
            tgt = r["target_user_id_str"]
            wt = float(r.get("interaction_weight", 1.0))
            if G.has_edge(src, tgt):
                G[src][tgt]["weight"] += wt
            else:
                G.add_edge(src, tgt, weight=wt, rel_type=r.get("relationship_type", "follow"))

        num_nodes = G.number_of_nodes()
        num_edges = G.number_of_edges()

        if num_nodes == 0:
            return {
                "nodes": [],
                "edges": [],
                "communities": [],
                "modularity": 0.0,
                "density": 0.0,
                "duration_ms": 0.0
            }

        # 2. Compute Louvain Partition & Modularity
        try:
            partition = community_louvain.best_partition(G, resolution=resolution, weight="weight", random_state=42)
            modularity = float(community_louvain.modularity(partition, G, weight="weight"))
        except Exception as e:
            print(f"[CommunityEngine] Louvain error: {e}. Fallback to single partition.")
            partition = {n: 0 for n in G.nodes()}
            modularity = 0.0

        # 3. Compute Network Centrality Metrics
        deg_centrality = nx.degree_centrality(G)

        # Approximate betweenness centrality for performance
        k_samples = min(num_nodes, 80)
        between_centrality = nx.betweenness_centrality(G, k=k_samples, weight="weight", seed=42)

        try:
            pagerank = nx.pagerank(G, weight="weight", alpha=0.85)
        except Exception:
            pagerank = {n: 1.0 / max(1, num_nodes) for n in G.nodes()}

        density = float(nx.density(G))

        # 4. Generate 3D Force-Directed Layout Coordinates for Three.js
        try:
            # 3D Spring layout positions
            pos_3d = nx.spring_layout(G, dim=3, k=0.45, iterations=40, seed=42)
        except Exception:
            pos_3d = {n: [0.0, 0.0, 0.0] for n in G.nodes()}

        # 5. Aggregate Community Stats
        community_members = {}
        for node_id, comm_id in partition.items():
            community_members.setdefault(comm_id, []).append(node_id)

        community_summaries = []
        for comm_id, members in sorted(community_members.items(), key=lambda x: -len(x[1])):
            color = COMMUNITY_COLORS[comm_id % len(COMMUNITY_COLORS)]
            subG = G.subgraph(members)
            internal_density = float(nx.density(subG)) if len(members) > 1 else 1.0

            community_summaries.append({
                "community_label_id": comm_id,
                "name": f"Community #{comm_id + 1} ({len(members)} nodes)",
                "member_count": len(members),
                "internal_density": round(internal_density, 3),
                "modularity_contribution": round(modularity / max(1, len(community_members)), 4),
                "color": color,
                "top_discussed_topics": [] # Populated by cross-analyzer
            })

        # 6. Format Node and Edge Payloads
        node_payloads = []
        for n in G.nodes():
            comm_id = partition.get(n, 0)
            coords = pos_3d.get(n, [0.0, 0.0, 0.0])
            color = COMMUNITY_COLORS[comm_id % len(COMMUNITY_COLORS)]
            node_payloads.append({
                "id": n,
                "username": G.nodes[n].get("username", n),
                "community_id": comm_id,
                "community_name": f"Community #{comm_id + 1}",
                "color": color,
                "degree": round(float(deg_centrality.get(n, 0.0)), 4),
                "betweenness": round(float(between_centrality.get(n, 0.0)), 4),
                "pagerank": round(float(pagerank.get(n, 0.0)), 4),
                "followers": G.nodes[n].get("followers", 0),
                "following": G.nodes[n].get("following", 0),
                "primary_topic": "General",
                "x": round(float(coords[0]) * 100.0, 2), # Scale for 3D world space
                "y": round(float(coords[1]) * 100.0, 2),
                "z": round(float(coords[2]) * 100.0, 2)
            })

        edge_payloads = []
        for u, v, data in G.edges(data=True):
            edge_payloads.append({
                "source": u,
                "target": v,
                "weight": round(float(data.get("weight", 1.0)), 2),
                "type": data.get("rel_type", "follow")
            })

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "nodes": node_payloads,
            "edges": edge_payloads,
            "communities": community_summaries,
            "modularity": round(modularity, 4),
            "density": round(density, 4),
            "num_nodes": num_nodes,
            "num_edges": num_edges,
            "duration_ms": duration_ms
        }

# Global singleton
community_engine = CommunityEngine()
