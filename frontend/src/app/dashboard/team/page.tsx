"use client";

import React from "react";
import { Award, Users, BookOpen, Layers, Network, ShieldCheck, Cpu } from "lucide-react";

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Konala Venkata Sri Sai Surya",
      regNo: "12404306",
      color: "#8b5cf6",
    },
    {
      name: "Ankit Kumawat",
      regNo: "12406586",
      color: "#06b6d4",
    },
    {
      name: "Bhavya Nasa",
      regNo: "12405762",
      color: "#10b981",
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Award className="w-7 h-7 text-emerald-400" />
          <span>Project Team & Research Documentation</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Academic project details, team credentials, and algorithmic specifications for SocialPulse.
        </p>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md text-center space-y-4 hover:border-white/20 transition-all glow-border"
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-lg"
              style={{
                backgroundColor: `${member.color}25`,
                borderColor: member.color,
                borderWidth: 1.5,
              }}
            >
              {member.name.charAt(0)}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <div className="text-xs font-mono text-cyan-glow mt-1 font-semibold">
                Registration Number: {member.regNo}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Identity & Statement */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md space-y-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-violet-soft flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-glow" />
          <span>Project Identification</span>
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong className="text-white">Project Name:</strong> SocialPulse — Social Media Topic & Community Clustering
        </p>
        <p className="text-gray-400 text-xs leading-relaxed">
          SocialPulse is an end-to-end unsupervised machine learning platform that analyzes unstructured social media posts and user interaction multigraphs to discover latent semantic discussion topics, user social communities, and their cross-sectional relationships without human supervision or labeled training data.
        </p>
      </div>

      {/* Algorithmic Methodology Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-glow" />
            <span>Topic Discovery Pipeline (Pipeline A)</span>
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Unsupervised semantic topic clustering uses dense vector embeddings generated via Sentence Transformers (or TF-IDF TruncatedSVD), projected onto topological manifold coordinates via UMAP, and clustered via HDBSCAN/K-Means. Cluster keywords are extracted using class-based TF-IDF (c-TF-IDF):
          </p>
          <div className="p-3 rounded-xl bg-midnight-950 font-mono text-xs text-violet-soft border border-white/5">
            W_(t,c) = tf_(t,c) * log(1 + A / tf_t)
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-glow" />
            <span>Community Discovery Pipeline (Pipeline B)</span>
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Network graph modeling represents users as nodes and social interactions (follows, retweets, mentions) as weighted edges. Communities are partitioned by maximizing the modularity gain function Q:
          </p>
          <div className="p-3 rounded-xl bg-midnight-950 font-mono text-xs text-cyan-soft border border-white/5">
            Q = 1/(2m) * sum_ij [ A_ij - (k_i * k_j)/(2m) ] * delta(c_i, c_j)
          </div>
        </div>
      </div>
    </div>
  );
}
