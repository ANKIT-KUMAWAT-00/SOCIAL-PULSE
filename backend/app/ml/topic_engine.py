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
