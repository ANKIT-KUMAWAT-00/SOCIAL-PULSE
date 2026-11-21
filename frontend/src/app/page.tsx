"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Network,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  GitBranch,
  ShieldCheck,
  Activity,
  Users,
  Compass,
} from "lucide-react";

// Dynamically import 3D Canvas to guarantee SSR safety
const HeroSphere = dynamic(
  () => import("@/components/3d/HeroSphere").then((mod) => mod.HeroSphere),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-violet-glow/40">Loading 3D Engine...</div> }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-midnight-950 text-white overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-radial-highlight pointer-events-none" />
      <div className="absolute top-1/3 -right-60 w-[600px] h-[600px] bg-radial-cyan pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-surface-border backdrop-blur-md bg-midnight-950/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-glow to-cyan-glow flex items-center justify-center shadow-glow-violet group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-gray-400 bg-clip-text text-transparent">
                SOCIALPULSE
              </span>
              <span className="block text-[10px] text-cyan-glow font-mono tracking-widest uppercase">
                Graph Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <Link href="#pipelines" className="hover:text-white transition-colors">
              Pipelines
            </Link>
            <Link href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </Link>
            <Link href="#team" className="hover:text-white transition-colors">
              Team
            </Link>
            <Link href="/dashboard" className="hover:text-cyan-glow transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-glow to-violet-dark hover:brightness-110 text-white font-medium text-sm transition-all shadow-glow-violet flex items-center gap-2 group"
            >
              <span>Explore SocialPulse</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-glow/10 border border-violet-glow/30 text-xs font-mono text-violet-soft backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-glow animate-pulse" />
            <span>Unsupervised ML • Topic & Community Clustering</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
            Understand the conversations.{" "}
            <span className="bg-gradient-to-r from-violet-glow via-cyan-glow to-emerald-400 bg-clip-text text-transparent">
              Discover the communities.
            </span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            An intelligent social network analytics platform that uncovers hidden
            topics, relationships, and communities through unsupervised machine learning.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-glow via-purple-600 to-cyan-glow hover:brightness-110 text-white font-semibold text-sm transition-all shadow-glow-violet flex items-center gap-2.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/network"
              className="px-6 py-3.5 rounded-xl bg-midnight-900/90 hover:bg-midnight-800 border border-surface-border hover:border-cyan-glow/50 text-gray-200 font-medium text-sm transition-all backdrop-blur-md flex items-center gap-2"
            >
              <Network className="w-4 h-4 text-cyan-glow" />
              <span>Explore 3D Network</span>
            </Link>
          </div>

          {/* Quick metric highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-border">
            <div>
              <div className="text-2xl font-bold font-mono text-white">2 Pipelines</div>
              <div className="text-xs text-gray-400 mt-0.5">Topic & Community</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-cyan-glow">3D WebGL</div>
              <div className="text-xs text-gray-400 mt-0.5">Force-Directed Graph</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-violet-glow">Real ML</div>
              <div className="text-xs text-gray-400 mt-0.5">Embeddings & Louvain</div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Sphere */}
        <div className="lg:col-span-6 h-[480px] sm:h-[560px] relative">
          <div className="absolute inset-0 rounded-3xl bg-midnight-900/40 border border-surface-border backdrop-blur-sm overflow-hidden glow-border">
            <HeroSphere />
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-midnight-950/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 pointer-events-none">
            <span>Drag to rotate • Real-time manifold topology</span>
            <span className="text-cyan-glow flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
              Active Nodes
            </span>
          </div>
        </div>
      </section>

      {/* Two Independent Pipelines Section */}
      <section id="pipelines" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-surface-border">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-violet-glow">
            Analytical Foundation
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Two Independent, Interconnected ML Engines
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            SocialPulse processes unstructured social text and interaction multigraphs through
            specialized algorithmic tracks to reveal the hidden mechanics of online discourse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pipeline A */}
          <div className="p-8 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md relative overflow-hidden group hover:border-violet-glow/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-glow/10 border border-violet-glow/30 flex items-center justify-center mb-6 text-violet-glow shadow-glow-violet">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-violet-soft uppercase tracking-wider mb-2">
              Pipeline A
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Topic Discovery</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Transforms raw social posts into dense semantic vector representations, preserves local-global manifold structure with UMAP, and extracts fine-grained topic clusters with automatic keyword distillation via c-TF-IDF.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-glow" />
                Text Preprocessing & Lemmatization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-glow" />
                Sentence Transformers / TF-IDF Vectorization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-glow" />
                UMAP 2D & 3D Manifold Dimensionality Reduction
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-glow" />
                HDBSCAN, K-Means & DBSCAN Cluster Partitioning
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-glow" />
                Class-based TF-IDF Automated Keyword Extraction
              </li>
            </ul>
          </div>

          {/* Pipeline B */}
          <div className="p-8 rounded-2xl bg-midnight-900/60 border border-surface-border backdrop-blur-md relative overflow-hidden group hover:border-cyan-glow/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center mb-6 text-cyan-glow shadow-glow-cyan">
              <Network className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-cyan-soft uppercase tracking-wider mb-2">
              Pipeline B
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Community Discovery</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Constructs an interaction network graph where users are nodes and follows, mentions, and retweets are weighted edges. Discovers social communities using Louvain modularity optimization and ranks influential actors.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                NetworkX Multigraph Topological Modeling
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                Louvain Modularity Maximization Partitioning
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                PageRank, Degree & Betweenness Centrality
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                3D Force-Directed Spring Layout Coordinates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                Cross-Sectional Topic-Community Affinity Matrix
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Roster Section */}
      <section id="team" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-surface-border">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Research & Engineering Team
          </h2>
          <h3 className="text-3xl font-bold text-white">Project Authors</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Konala Venkata Sri Sai Surya",
              reg: "12404306",
              role: "Machine Learning & Graph Systems",
              color: "#8b5cf6",
            },
            {
              name: "Ankit Kumawat",
              reg: "12406586",
              role: "Full-Stack & 3D Interactive UI",
              color: "#06b6d4",
            },
            {
              name: "Bhavya Nasa",
              reg: "12405762",
              role: "NLP Pipelines & Evaluation Architecture",
              color: "#10b981",
            },
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md text-center space-y-3 hover:border-white/20 transition-all"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-mono font-bold text-white text-lg shadow-lg"
                style={{ backgroundColor: `${m.color}25`, borderColor: m.color, borderWidth: 1 }}
              >
                {m.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">{m.name}</h4>
                <div className="text-xs font-mono text-cyan-glow mt-1">
                  Reg No: {m.reg}
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono pt-2 border-t border-white/5">
                {m.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-8 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>SocialPulse • Full-Stack Unsupervised ML Intelligence Platform</div>
          <div>Discover the conversations. Reveal the communities.</div>
        </div>
      </footer>
    </div>
  );
}
