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
