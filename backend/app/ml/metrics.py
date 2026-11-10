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
