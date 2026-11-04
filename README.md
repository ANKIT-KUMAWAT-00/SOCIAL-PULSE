# SocialPulse
### Social Media Topic & Community Clustering | Full-Stack Unsupervised ML Platform

> **Project Identity:** SocialPulse — Discover the conversations. Reveal the communities.

---

## 👥 Research & Engineering Team

1. **Konala Venkata Sri Sai Surya** — Registration Number: **12404306**
2. **Ankit Kumawat** — Registration Number: **12406586**
3. **Bhavya Nasa** — Registration Number: **12405762**

---

## 🌟 Executive Overview

**SocialPulse** is a production-grade unsupervised machine learning intelligence platform that analyzes social media posts and user interaction multigraphs to uncover latent semantic topics, detect social communities, and analyze cross-sectional topic-community relationships—completely without labeled training data or manual supervision.

The platform provides a futuristic, 3D animated command center interface with real-time WebGL manifold projections, force-directed graph physics, reproducible ML benchmark labs, and high-realism synthetic social benchmarks.

---

## 🏛️ System Architecture

```
                       ┌─────────────────────────────────────────────────────────────┐
                       │           Next.js 14 + React Three Fiber Web Client         │
                       │   (Landing 3D Orb, Force-Directed Graph, Embedding Scatter) │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │ REST / WebSocket
                                                      ▼
                       ┌─────────────────────────────────────────────────────────────┐
                       │                  FastAPI Backend Server                     │
                       │          (Async Endpoints, Job Runners, Validators)         │
                       └──────────────┬───────────────────────────────┬──────────────┘
                                      │                               │
            ┌─────────────────────────┴─────────────┐   ┌─────────────┴────────────────────────┐
            │      Pipeline A: Topic Discovery      │   │   Pipeline B: Community Discovery    │
            │  • Sentence Transformers Embeddings   │   │  • NetworkX Multigraph Construction  │
            │  • UMAP 2D/3D Dimension Reduction     │   │  • Louvain Modularity Partitioning   │
            │  • HDBSCAN / K-Means Clustering       │   │  • PageRank, Degree, Betweenness     │
            │  • Class-based TF-IDF (c-TF-IDF)      │   │  • 3D Spring Layout Force Simulation │
            └─────────────────────────┬─────────────┘   └─────────────┬────────────────────────┘
                                      │                               │
                                      └───────────────┬───────────────┘
                                                      │
                                                      ▼
                       ┌─────────────────────────────────────────────────────────────┐
                       │          Topic-Community Cross-Sectional Synthesis          │
