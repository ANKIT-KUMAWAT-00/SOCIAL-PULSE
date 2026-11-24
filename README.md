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
                       │    (User Discourse Profiles, Affinity Heatmap, Inferences)   │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                                      ▼
                       ┌─────────────────────────────────────────────────────────────┐
                       │                     Persistence Layer                       │
                       │           SQLite / PostgreSQL (SQLAlchemy ORM)              │
                       └─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Machine Learning Pipelines

### Pipeline A: Semantic Topic Discovery
1. **Text Preprocessing**: Tokenization, HTML/URL stripping, regex normalization, stopword elimination, and lemmatization.
2. **Dense Representation**: Generates 384-dimensional semantic embeddings with Sentence Transformers (`all-MiniLM-L6-v2`) or sublinear TF-IDF with SVD projection.
3. **Topological Manifold Reduction**: Non-linear dimensionality reduction via **UMAP** ($n_{\text{components}}=3, \text{metric}=\text{cosine}$) to preserve local and global neighborhood structures.
4. **Unsupervised Density Clustering**: **HDBSCAN** identifies arbitrary cluster shapes and isolates conversational noise ($label=-1$). Centroid-based **K-Means** is available for direct parameter sweep benchmarks.
5. **Topic Distillation (c-TF-IDF)**: Class-based Term Frequency-Inverse Document Frequency extracts the most distinguishing keywords:
   $$W_{t, c} = \text{tf}_{t, c} \times \log\left(1 + \frac{A}{\text{tf}_t}\right)$$
6. **Mathematical Validation**: Evaluates cluster separation using **Silhouette Score**, **Davies-Bouldin Index**, and **Calinski-Harabasz Index**.

### Pipeline B: Graph Community Discovery
1. **Multigraph Modeling**: Constructs a weighted network $G=(V, E)$ where nodes represent users and edges represent interactions (follows, retweets, replies, mentions).
2. **Community Partitioning**: Maximizes graph modularity $Q$ using the **Louvain Method**:
   $$Q = \frac{1}{2m} \sum_{i,j} \left[ A_{ij} - \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)$$
3. **Centrality Metrics**:
   - **PageRank**: Eigen-prestige and structural influence.
   - **Degree Centrality**: Immediate connectivity and broadcasting capacity.
   - **Betweenness Centrality**: Information brokerage across network clusters.
4. **3D Force Layout**: Solves Fruchterman-Reingold spring equations in $\mathbb{R}^3$ to position nodes for Three.js rendering.

### Interconnection: Topic-Community Relationship Analysis
- Computes empirical user discourse vectors $T_u$ from authored posts.
- Aggregates vectors per community to form the normalized affinity matrix $M_{c, t} = P(\text{Topic } t \mid \text{Community } c)$.
- Incurs automated natural language inferences identifying dominant concentrations and shared bridge topics.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js $\ge 18$ (Tested on Node v24)
- Python $\ge 3.10$

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install sentence-transformers umap-learn hdbscan pydantic-settings httpx

# Start FastAPI server
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend initializes the database and automatically seeds an initial benchmark dataset on first boot at `http://127.0.0.1:8000`.
- API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Build & run production server
npm run build
npm start

# Or run in development mode
npm run dev
```
The frontend is available at `http://localhost:3000`.

---

## 🐳 Docker Deployment

Run both backend and frontend in isolated production containers using Docker Compose:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
PYTHONPATH=backend backend/venv/bin/pytest backend/tests/test_api.py -v
```
All tests verify:
- Health check & API availability
- Academic Team verification
- Synthetic data generation & database ingestion
- Full Topic Discovery (UMAP + HDBSCAN + c-TF-IDF)
- Full Community Detection (Louvain + Centralities)
- 3D coordinates & graph payloads
- Live ML experiment execution and evaluation metrics

---

## 📂 Project Structure

```
page-pulse/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint, router mounting, seed hook
│   │   ├── config.py           # Application settings, paths, CORS
│   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   ├── models/             # Dataset, SocialPost, SocialUser, Topic, Community, MLExperiment
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── ml/                 # TopicEngine, CommunityEngine, CrossAnalyzer, Preprocessor, Metrics
│   │   ├── api/                # API route handlers (datasets, topics, communities, analytics, experiments)
│   │   └── utils/              # Synthetic social network & multi-topic dataset generator
│   ├── tests/                  # Test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (Landing + Dashboard pages)
│   │   ├── components/3d/      # HeroSphere, NetworkGraph3D, EmbeddingScatter3D
│   │   ├── lib/                # Typed API client & utilities
│   │   └── types/              # TypeScript schema interfaces
│   ├── tailwind.config.ts      # Midnight & neon glass theme
│   ├── next.config.js          # API proxy & transpilation
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚖️ Academic Integrity & Disclaimer
This application distinguishes between real uploaded data and synthetic benchmarks. Synthetic benchmarks are explicitly tagged `is_synthetic = True` and are provided for educational and evaluation purposes. All metrics, cluster assignments, and graph modularity values are computed dynamically by actual machine learning algorithms.
