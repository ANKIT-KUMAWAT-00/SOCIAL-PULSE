import numpy as np
from typing import Dict, Any, Optional
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

def compute_clustering_metrics(
    X: np.ndarray,
    labels: np.ndarray,
    ignore_noise: bool = True
) -> Dict[str, Optional[float]]:
    """
    Safely computes Silhouette, Davies-Bouldin, and Calinski-Harabasz scores.
    Handles noise/outliers (label == -1) and edge cases where metrics are mathematically undefined.
    """
    labels = np.array(labels)
    unique_labels = set(labels)

    # Filter out noise points (label == -1) if requested for density/geometry scoring
    if ignore_noise and -1 in unique_labels:
        mask = labels != -1
        X_eval = X[mask]
        labels_eval = labels[mask]
        eval_unique = set(labels_eval)
    else:
        X_eval = X
        labels_eval = labels
        eval_unique = unique_labels

    # Metric evaluation requires at least 2 distinct clusters and at least 2 samples per cluster
    if len(eval_unique) < 2 or len(eval_unique) >= len(labels_eval):
        return {
            "silhouette_score": None,
            "davies_bouldin_score": None,
            "calinski_harabasz_score": None,
            "num_clusters": len([l for l in unique_labels if l != -1]),
            "num_outliers": int(np.sum(labels == -1))
        }

    try:
        sil = float(silhouette_score(X_eval, labels_eval))
    except Exception:
        sil = None

    try:
        db = float(davies_bouldin_score(X_eval, labels_eval))
    except Exception:
        db = None

    try:
        ch = float(calinski_harabasz_score(X_eval, labels_eval))
    except Exception:
        ch = None

    return {
        "silhouette_score": round(sil, 4) if sil is not None else None,
        "davies_bouldin_score": round(db, 4) if db is not None else None,
        "calinski_harabasz_score": round(ch, 2) if ch is not None else None,
        "num_clusters": len([l for l in unique_labels if l != -1]),
        "num_outliers": int(np.sum(labels == -1))
    }
