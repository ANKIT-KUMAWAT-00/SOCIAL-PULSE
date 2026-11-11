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
