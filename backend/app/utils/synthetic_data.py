import random
import datetime
from typing import Dict, List, Tuple

# Pre-defined realistic topics and vocabularies
TOPIC_TEMPLATES = {
    "AI & Deep Learning": {
        "keywords": ["transformer", "neural network", "attention mechanism", "diffusion model", "LLM", "inference latency", "fine-tuning", "synthetic data", "loss gradient", "backpropagation", "GPU cluster", "vector embeddings"],
        "templates": [
            "Just finished training our new {keywords[0]} model on a cluster of H100s. The {keywords[5]} dropped by 42%!",
            "Exploring {keywords[1]} architectures for multimodal understanding. Is anyone using {keywords[6]} instead of LoRA?",
            "The debate around {keywords[2]} scaling laws is getting intense. Are we hitting a wall or just need better {keywords[7]}?",
            "Excited to open-source our benchmark comparing {keywords[3]} against autoregressive models. Key takeaway: {keywords[8]} matters most.",
            "Our team reduced {keywords[5]} from 120ms to 24ms using int4 quantization and optimized {keywords[11]}.",
            "Why do modern {keywords[4]}s still hallucinate on simple logic tasks? The key lies in better alignment and {keywords[9]}.",
            "Working on zero-shot reasoning with {keywords[1]}. Combining chain-of-thought with dense {keywords[11]} works wonders."
        ]
    },
    "Cloud & Distributed Systems": {
        "keywords": ["Kubernetes", "microservices", "Docker", "gRPC", "Kafka", "PostgreSQL", "distributed tracing", "Redis cache", "observability", "event-driven", "consensus algorithm", "service mesh"],
        "templates": [
            "Migrated our monolithic pipeline to {keywords[0]} and {keywords[1]}. Cluster utilization improved dramatically.",
            "Dealing with split-brain issues in our {keywords[5]} multi-region setup. Has anyone tuned {keywords[10]} for high write loads?",
            "Why {keywords[3]} is still superior to REST for high-throughput internal services: 5x lower payload serialization overhead.",
            "Setting up real-time {keywords[4]} streaming consumers with exactly-once delivery guarantees. Loving the new {keywords[8]} stack.",
            "Zero downtime database migrations on {keywords[5]} using blue-green deployments and {keywords[7]} warming.",
            "Debugging memory leaks in our {keywords[11]} proxy under 100k requests/sec. Turn on {keywords[6]} immediately!",
            "Building an {keywords[9]} architecture with resilient dead-letter queues. Always plan for downstream partition failures."
        ]
    },
    "Fitness & Biohacking": {
        "keywords": ["hypertrophy", "zone 2 cardio", "progressive overload", "cold plunge", "sleep architecture", "VO2 max", "electrolyte balance", "fasting", "creatine", "myofibrillar", "circadian rhythm", "HRV"],
        "templates": [
            "Consistency is king for {keywords[0]}. Focus on {keywords[2]} and adequate sleep rather than fancy workout splits.",
            "Dialing in my {keywords[4]} by cutting blue light 2 hours before bed. Resting {keywords[11]} increased by 14ms this week.",
            "Why you shouldn't neglect {keywords[1]}: mitochondria density and cardiovascular longevity depend on maintaining your {keywords[5]}.",
            "Breaking down the science of {keywords[8]} monohydrate and cellular hydration. Best supplement with 30+ years of evidence.",
            "Intermittent {keywords[7]} combined with heavy compound lifts. Key lesson: keep your {keywords[6]} optimized during morning sessions.",
            "Mastering your {keywords[10]} will do more for recovery and {keywords[0]} than any expensive supplement stack.",
            "Tracking {keywords[11]} trends over 90 days. Spikes correlate directly with deep sleep percentage and recovery."
        ]
    },
    "Web3 & Cryptography": {
        "keywords": ["zero-knowledge proofs", "smart contract", "ZK-rollup", "liquidity pool", "consensus mechanism", "elliptic curve", "MEV protection", "decentralized validator", "merkle tree", "gas optimization", "st托管", "layer 2"],
        "templates": [
            "Deep dive into recursive {keywords[0]} for scaling throughput on {keywords[11]}. Mind-blowing proof compression.",
            "Auditing a high-TVL {keywords[1]} for reentrancy vulnerabilities. Always use checks-effects-interactions and reentrancy guards.",
            "The economics of {keywords[3]}s during volatile market swings: impermanent loss mitigation via dynamic fees.",
            "How {keywords[2]}s achieve 10,000 TPS while maintaining L1 security through cryptographic {keywords[8]} verifications.",
            "Implemented custom {keywords[6]} to prevent sandwich attacks on our decentralized exchange router.",
            "Math behind {keywords[5]} cryptography and polynomial commitments: why KZG makes stateless verification feasible.",
            "Running a distributed {keywords[7]} set. High uptime, low slashing risk, and robust consensus."
        ]
    },
    "Game Dev & Real-Time 3D": {
        "keywords": ["Unreal Engine 5", "Nanite", "Lumen", "shader programming", "ray tracing", "Blender", "procedural generation", "mesh optimization", "Vulkan API", "spatial audio", "frame pacing", "glTF"],
        "templates": [
            "Testing real-time global illumination with {keywords[2]} and {keywords[1]} in {keywords[0]}. Runs at steady 60fps on RTX 4080!",
            "Writing a custom HLSL compute shader for fluid dynamics and particle simulation. Hooked up via {keywords[8]}.",
            "Procedural world generation using Voronoi diagrams and {keywords[6]}. Infinite terrain with zero stutter thanks to LOD streaming.",
            "Optimizing draw calls and {keywords[7]} for mobile WebGL exports. Always compress textures with KTX2/Basis Universal.",
            "Excited to showcase our indie title built with {keywords[0]} featuring dynamic {keywords[4]} and immersive {keywords[9]}.",
            "PBR material pipeline in {keywords[5]} to {keywords[11]} export workflow. Metallic-roughness textures calibrated to real-world albedo.",
            "Achieving buttery smooth {keywords[10]} by decoupling physics tick rate from render refresh frequency."
        ]
    }
}

OUTLIER_POSTS = [
    "Just spilled boiling hot coffee all over my keyboard... great start to Monday morning.",
    "Anyone know a good quiet cafe near downtown with reliable Wi-Fi and oat milk lattes?",
    "Traffic on Interstate 90 is completely stopped right now. Avoid if possible!",
    "Happy birthday to my amazing sister! Have a wonderful year ahead ❤️",
    "What's your favorite comfort movie when you are feeling sick on the couch?",
    "Lost my sunglasses somewhere at the park today, hoping someone turns them in to lost & found."
]

def generate_synthetic_social_dataset(
    num_posts: int = 500,
    num_users: int = 80,
    outlier_ratio: float = 0.08,
    seed: int = 42
) -> Dict[str, List[Dict]]:
    """
    Generates a realistic social media graph & post dataset with:
    - 5 ground-truth communities with dense intra-community edges
    - Correlated topic discussions within communities
    - Cross-community bridging edges
    - Realistic engagement metrics, timestamps, and outlier posts
    """
    random.seed(seed)
    topic_names = list(TOPIC_TEMPLATES.keys())
    num_communities = len(topic_names)

    # 1. Generate Users across 5 Communities
    users = []
    community_assignments = {}
    users_by_community = {i: [] for i in range(num_communities)}

    user_handles = [
        "alex_neural", "elena_dev", "marcus_fit", "satoshi_zk", "sarah_3d",
        "kai_systems", "maya_ml", "david_cloud", "olivia_lift", "crypto_vikram",
        "chen_unreal", "zack_kernel", "rachel_ai", "liam_runner", "tariq_zkp",
        "hannah_vulkan", "mateo_k8s", "priya_cv", "nathan_crossfit", "ethan_defi",
        "yuki_shaders", "dmitri_distributed", "chloe_deeprl", "jordan_physique", "fatima_web3",
        "lucas_indiedev", "amara_mlops", "ben_golang", "kavita_nutrition", "vitalik_fan",
        "sam_render", "nina_scalability", "leo_nlp", "sofia_marathon", "raj_cryptography"
    ]

    for i in range(num_users):
        u_id = f"user_{i+1:03d}"
        assigned_comm = i % num_communities
        community_assignments[u_id] = assigned_comm
        users_by_community[assigned_comm].append(u_id)

        if i < len(user_handles):
            username = user_handles[i]
        else:
            prefix = ["code", "hyper", "cyber", "data", "deep", "zen", "vector", "cloud", "pixel", "meta"][i % 10]
            username = f"{prefix}_{assigned_comm}_{i}"

        # Preferential attachment follower counts (Power law distribution)
        base_power = random.paretovariate(1.8)
        followers = int(max(40, min(50000, base_power * 350)))
        following = int(random.uniform(50, min(2000, followers * 1.2)))

        users.append({
            "user_id_str": u_id,
            "username": username,
            "follower_count": followers,
            "following_count": following,
            "ground_truth_community": assigned_comm
        })

    # 2. Generate Network Relationships (Graph Edges)
    relationships = []
    edge_set = set()

    for comm_id, member_ids in users_by_community.items():
        # High intra-community connection probability (0.35)
        for i, u1 in enumerate(member_ids):
            for u2 in member_ids[i+1:]:
                if random.random() < 0.38:
                    rel_key = (u1, u2)
                    if rel_key not in edge_set:
                        edge_set.add(rel_key)
                        weight = round(random.uniform(1.2, 5.0), 2)
                        relationships.append({
                            "source_user_id_str": u1,
                            "target_user_id_str": u2,
                            "relationship_type": random.choice(["follow", "retweet", "mention", "reply"]),
                            "interaction_weight": weight
                        })

    # Add cross-community bridge connections (low probability 0.04)
    all_u_ids = [u["user_id_str"] for u in users]
    for _ in range(int(num_users * 1.5)):
        u1 = random.choice(all_u_ids)
        u2 = random.choice(all_u_ids)
        if u1 != u2 and community_assignments[u1] != community_assignments[u2]:
            rel_key = tuple(sorted((u1, u2)))
            if rel_key not in edge_set:
                edge_set.add(rel_key)
                relationships.append({
                    "source_user_id_str": u1,
                    "target_user_id_str": u2,
                    "relationship_type": random.choice(["mention", "reply", "follow"]),
                    "interaction_weight": round(random.uniform(0.5, 2.0), 2)
                })

    # 3. Generate Posts with Realistic Topic Correlation
    posts = []
    base_time = datetime.datetime.utcnow() - datetime.timedelta(days=45)
    num_outliers = int(num_posts * outlier_ratio)
    num_regular_posts = num_posts - num_outliers

    for p_idx in range(num_regular_posts):
        p_id = f"post_{p_idx+1:04d}"
        author = random.choice(users)
        author_id = author["user_id_str"]
        comm_id = community_assignments[author_id]

        # 82% chance the user posts about their primary community topic,
        # 18% chance they post about a cross-over topic
        if random.random() < 0.82:
            chosen_topic = topic_names[comm_id]
        else:
            chosen_topic = random.choice(topic_names)

        topic_data = TOPIC_TEMPLATES[chosen_topic]
        template = random.choice(topic_data["templates"])
        # Format template with random keyword selections
        shuffled_kw = list(topic_data["keywords"])
        random.shuffle(shuffled_kw)
        post_text = template.format(keywords=shuffled_kw)

        # Realistic engagement
        likes = int(random.lognormvariate(2.8, 1.1))
        comments = int(likes * random.uniform(0.05, 0.35))
        shares = int(likes * random.uniform(0.02, 0.20))

        # Time drift
        post_date = base_time + datetime.timedelta(
            days=random.uniform(0, 45),
            hours=random.uniform(0, 24),
            minutes=random.uniform(0, 60)
        )

        posts.append({
            "post_id_str": p_id,
            "user_id_str": author_id,
            "text": post_text,
            "timestamp": post_date,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "ground_truth_topic": chosen_topic,
            "is_outlier": False
        })

    # Add Outlier / Noise Posts
    for o_idx in range(num_outliers):
        p_id = f"post_noise_{o_idx+1:03d}"
        author = random.choice(users)
        post_date = base_time + datetime.timedelta(days=random.uniform(0, 45))

        posts.append({
            "post_id_str": p_id,
            "user_id_str": author["user_id_str"],
            "text": random.choice(OUTLIER_POSTS),
            "timestamp": post_date,
            "likes": random.randint(1, 15),
            "comments": random.randint(0, 3),
            "shares": 0,
            "ground_truth_topic": "Outlier / General",
            "is_outlier": True
        })

    # Shuffle posts
    random.shuffle(posts)

    return {
        "users": users,
        "relationships": relationships,
        "posts": posts
    }
