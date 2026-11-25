"use client";

import React from "react";
import { Award, BookOpen, Layers, Network } from "lucide-react";

export default function TeamPage() {
  const teamMembers = [
    {
      index: "01",
      name: "Konala Venkata Sri Sai Surya",
      regNo: "12404306",
      accent: "#56B4F9",
    },
    {
      index: "02",
      name: "Ankit Kumawat",
      regNo: "12406586",
      accent: "#FF2E93",
    },
    {
      index: "03",
      name: "Bhavya Nasa",
      regNo: "12405762",
      accent: "#56B4F9",
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/15">
        <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
          09 // CREDENTIALS & METHODOLOGY
        </div>
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
          <Award className="w-6 h-6 text-[#56B4F9]" />
          <span>PROJECT TEAM & DOCS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          SOCIALPULSE — SOCIAL MEDIA TOPIC & COMMUNITY CLUSTERING
        </p>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15 bg-[#050608]">
        {teamMembers.map((member) => (
          <div key={member.regNo} className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[10px] tracking-[0.28em]"
                style={{ color: member.accent }}
              >
                MEMBER {member.index}
              </span>
              <span className="w-2 h-2" style={{ backgroundColor: member.accent }} />
            </div>
            <h3 className="text-base font-semibold text-white">{member.name}</h3>
            <div className="font-mono text-xs tracking-[0.18em] text-zinc-400 pt-3 border-t border-white/10">
              REG NO: <span className="text-white">{member.regNo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Statement */}
      <div className="border border-white/15 bg-[#050608] p-6 sm:p-8 space-y-3">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#FF2E93] flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>PROJECT IDENTIFICATION</span>
        </div>
        <p className="text-white text-sm font-medium">
          SocialPulse — Social Media Topic & Community Clustering
        </p>
        <p className="text-zinc-400 text-xs leading-relaxed">
          SocialPulse is an end-to-end unsupervised machine learning platform that analyzes
          unstructured social media posts and user interaction multigraphs to discover latent
          semantic discussion topics, user social communities, and their cross-sectional
          relationships without labeled training data.
        </p>
      </div>

      {/* Mathematical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15 bg-[#050608]">
        <div className="p-6 sm:p-8 space-y-4">
          <h4 className="font-display text-xs tracking-[0.14em] uppercase text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#56B4F9]" />
            <span>PIPELINE A // TOPIC DISCOVERY</span>
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Dense vector embeddings generated via Sentence Transformers (or TF-IDF TruncatedSVD)
            are projected via UMAP and clustered via HDBSCAN/K-Means. Keywords are extracted via
            class-based TF-IDF (c-TF-IDF):
          </p>
          <div className="p-3.5 bg-black font-mono text-xs text-[#56B4F9] border border-white/10">
            W_(t,c) = tf_(t,c) * log(1 + A / tf_t)
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <h4 className="font-display text-xs tracking-[0.14em] uppercase text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-[#FF2E93]" />
            <span>PIPELINE B // COMMUNITY DETECTION</span>
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Interaction multigraph modeling represents users as nodes and social actions as
            weighted edges. Louvain partitioning maximizes network modularity Q:
          </p>
          <div className="p-3.5 bg-black font-mono text-xs text-[#FF2E93] border border-white/10">
            Q = 1/(2m) * sum_ij [ A_ij - (k_i * k_j)/(2m) ] * delta(c_i, c_j)
          </div>
        </div>
      </div>
    </div>
  );
}
