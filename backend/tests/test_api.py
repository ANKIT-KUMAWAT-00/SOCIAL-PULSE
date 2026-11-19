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
