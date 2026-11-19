import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_root_team_info():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "SocialPulse Intelligence Platform"
    team_names = [m["name"] for m in data["team"]]
    assert "Ankit Kumawat" in team_names
    assert "Konala Venkata Sri Sai Surya" in team_names
    assert "Bhavya Nasa" in team_names

def test_datasets_and_pipeline():
    # 1. Fetch datasets (should contain seeded initial benchmark)
    res = client.get("/api/datasets")
    assert res.status_code == 200
    datasets = res.json()
    assert len(datasets) > 0
    ds_id = datasets[0]["id"]

    # 2. Analytics Overview
    ov_res = client.get(f"/api/analytics/overview?dataset_id={ds_id}")
    assert ov_res.status_code == 200
    ov_data = ov_res.json()
    assert ov_data["total_posts"] > 0
    assert ov_data["total_users"] > 0
    assert ov_data["discovered_topics"] > 0
    assert ov_data["discovered_communities"] > 0
    assert "topic_distribution" in ov_data
    assert "community_distribution" in ov_data

    # 3. Topic Visualization
    t_res = client.get(f"/api/topics/visualization?dataset_id={ds_id}")
    assert t_res.status_code == 200
    t_data = t_res.json()
    assert len(t_data["clusters"]) > 0
    assert len(t_data["points"]) > 0
    # verify 3D coordinates exist on scatter points
    sample_pt = t_data["points"][0]
    assert "x" in sample_pt and "y" in sample_pt and "z" in sample_pt

    # 4. Community Network Graph
    c_res = client.get(f"/api/communities/network?dataset_id={ds_id}")
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert len(c_data["nodes"]) > 0
    assert len(c_data["edges"]) > 0
    sample_node = c_data["nodes"][0]
    assert "pagerank" in sample_node
    assert "degree" in sample_node
    assert "betweenness" in sample_node
    assert "x" in sample_node and "y" in sample_node and "z" in sample_node

    # 5. Trending Topics
    tr_res = client.get(f"/api/analytics/trending?dataset_id={ds_id}")
    assert tr_res.status_code == 200
    tr_data = tr_res.json()
    assert len(tr_data["trending_topics"]) > 0

    # 6. Topic-Community Matrix
    m_res = client.get(f"/api/analytics/topic-community-matrix?dataset_id={ds_id}")
    assert m_res.status_code == 200
    m_data = m_res.json()
    assert len(m_data["topics"]) > 0
    assert len(m_data["communities"]) > 0
    assert len(m_data["matrix"]) > 0
    assert len(m_data["insights"]) > 0

def test_ml_experiment_run():
    datasets = client.get("/api/datasets").json()
    ds_id = datasets[0]["id"]

    # Run K-Means experiment
    exp_res = client.post("/api/experiments/run", json={
        "dataset_id": ds_id,
        "name": "K-Means k=4 Benchmark",
        "algorithm_type": "kmeans",
        "pipeline_type": "topic",
        "parameters": {
            "n_clusters": 4,
            "feature_extractor": "embeddings"
        }
    })
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert exp_data["num_clusters"] == 4
    assert exp_data["silhouette_score"] is not None
    assert exp_data["execution_time_ms"] > 0
