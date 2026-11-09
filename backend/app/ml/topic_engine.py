import time
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.cluster import KMeans, DBSCAN
import hdbscan
import umap

from app.ml.preprocessor import preprocess_corpus
from app.ml.metrics import compute_clustering_metrics

# Distinct vibrant color palette for clusters
CLUSTER_COLORS = [
    "#8b5cf6", # Electric Violet
    "#06b6d4", # Cyber Cyan
    "#10b981", # Emerald Pulse
    "#f59e0b", # Solar Amber
    "#ec4899", # Neon Pink
    "#3b82f6", # Blue Wave
    "#14b8a6", # Teal Aura
    "#f97316", # Orange Flame
    "#a855f7", # Purple Glow
    "#6366f1"  # Indigo Spark
]
OUTLIER_COLOR = "#64748b" # Slate gray for outliers / noise

class TopicEngine:
    def __init__(self):
        self._st_model = None

    def _get_embedding_model(self):
        if self._st_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                # Lightweight, fast, high quality 384-dim semantic embedding model
                self._st_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception as e:
                print(f"[TopicEngine] Could not load SentenceTransformer: {e}. Will use TF-IDF + SVD fallback.")
                self._st_model = False
        return self._st_model

    def extract_features(
        self,
        raw_texts: List[str],
        cleaned_texts: List[str],
        extractor_type: str = "embeddings"
    ) -> np.ndarray:
        """
        Extracts semantic embeddings or TF-IDF feature representations.
        """
        if extractor_type == "embeddings":
            model = self._get_embedding_model()
            if model:
                try:
                    embeddings = model.encode(raw_texts, show_progress_bar=False, normalize_embeddings=True)
                    return np.array(embeddings, dtype=np.float32)
                except Exception as e:
                    print(f"[TopicEngine] SentenceTransformer encoding error: {e}. Falling back to TF-IDF.")
            
            # High-fidelity Fallback: TF-IDF with SVD dense projection
            vectorizer = TfidfVectorizer(max_features=2500, ngram_range=(1, 2), sublinear_tf=True)
            tfidf_mat = vectorizer.fit_transform(cleaned_texts)
            n_components = min(128, max(10, tfidf_mat.shape[1] - 1, tfidf_mat.shape[0] - 1))
            svd = TruncatedSVD(n_components=n_components, random_state=42)
            dense_feats = svd.fit_transform(tfidf_mat)
            # L2 normalize
            norms = np.linalg.norm(dense_feats, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return dense_feats / norms

        else: # "tfidf"
            vectorizer = TfidfVectorizer(max_features=2500, ngram_range=(1, 2), sublinear_tf=True)
            tfidf_mat = vectorizer.fit_transform(cleaned_texts)
            n_comp = min(64, max(5, tfidf_mat.shape[1] - 1, tfidf_mat.shape[0] - 1))
            svd = TruncatedSVD(n_components=n_comp, random_state=42)
            return svd.fit_transform(tfidf_mat)

    def reduce_dimensions(
        self,
        features: np.ndarray,
        method: str = "umap",
        n_components: int = 3
    ) -> np.ndarray:
        """
        Reduces feature dimensions to 2D or 3D coordinates for visualization and density clustering.
        """
        n_samples = features.shape[0]
        if n_samples < 5:
            return np.zeros((n_samples, n_components), dtype=np.float32)

        if method == "umap":
            try:
                n_neighbors = min(15, max(3, n_samples - 1))
                reducer = umap.UMAP(
                    n_components=n_components,
                    n_neighbors=n_neighbors,
                    min_dist=0.15,
                    metric="cosine",
                    random_state=42
                )
                coords = reducer.fit_transform(features)
                return coords
            except Exception as e:
                print(f"[TopicEngine] UMAP error: {e}. Falling back to PCA.")
        
        # PCA fallback
        n_comp = min(n_components, features.shape[1], n_samples)
        pca = PCA(n_components=n_comp, random_state=42)
        coords = pca.fit_transform(features)
        if coords.shape[1] < n_components:
            pad = np.zeros((n_samples, n_components - coords.shape[1]))
            coords = np.hstack([coords, pad])
        return coords

    def cluster_data(
        self,
        features: np.ndarray,
        algorithm: str = "hdbscan",
        n_clusters: int = 5,
        min_cluster_size: int = 5,
        eps: float = 0.5,
        min_samples: int = 5
    ) -> np.ndarray:
        """
        Runs unsupervised clustering on extracted feature representations.
        Returns cluster label array (-1 for outliers, 0..K-1 for clusters).
        """
        n_samples = len(features)
        if n_samples < 2:
            return np.zeros(n_samples, dtype=int)

        if algorithm == "hdbscan":
            min_c_size = min(min_cluster_size, max(2, n_samples // 10))
            clusterer = hdbscan.HDBSCAN(
                min_cluster_size=min_c_size,
                metric="euclidean",
                cluster_selection_method="eom"
            )
            labels = clusterer.fit_predict(features)
            # If all are outliers, fall back to K-Means
            if np.all(labels == -1):
                km = KMeans(n_clusters=min(n_clusters, max(2, n_samples // 4)), random_state=42, n_init='auto')
                labels = km.fit_predict(features)
            return labels

        elif algorithm == "kmeans":
            k = min(n_clusters, max(2, n_samples // 3))
            km = KMeans(n_clusters=k, random_state=42, n_init='auto')
            return km.fit_predict(features)

        elif algorithm == "dbscan":
            db = DBSCAN(eps=eps, min_samples=min_samples, metric="cosine")
            labels = db.fit_predict(features)
            return labels

        else:
            raise ValueError(f"Unsupported clustering algorithm: {algorithm}")

