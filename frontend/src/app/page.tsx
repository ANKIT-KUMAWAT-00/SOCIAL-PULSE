"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, ArrowUpRight } from "lucide-react";

const HeroSphere = dynamic(
  () => import("@/components/3d/HeroSphere").then((mod) => mod.HeroSphere),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.35em] text-zinc-600 uppercase">
        INITIALIZING 3D MANIFOLD...
      </div>
    ),
  }
);

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Minimalist Architectural Top Bar */}
      <header className="relative z-40 border-b border-white/15 bg-black/90 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          {/* Left: Minimal Two-Bar Editorial Menu Trigger + Brand Mark */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              className="w-8 h-8 flex flex-col justify-center gap-1.5 group focus:outline-none"
            >
              <span className="w-5 h-[1.5px] bg-zinc-300 group-hover:bg-[#56B4F9] transition-colors" />
              <span className="w-3.5 h-[1.5px] bg-zinc-400 group-hover:w-5 group-hover:bg-[#FF2E93] transition-all" />
            </button>

            <Link
              href="/"
              className="font-mono text-[11px] tracking-[0.36em] text-zinc-300 hover:text-white uppercase transition-colors"
            >
              SOCIAL<span className="text-[#56B4F9]">PULSE</span>
            </Link>
          </div>

          {/* Right: Widely-Tracked Minimal Uppercase Links */}
          <nav className="hidden md:flex items-center gap-9 text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-400">
            <Link href="/dashboard" className="hover:text-[#56B4F9] transition-colors">
              EXPLORE
            </Link>
            <Link href="#pipelines" className="hover:text-white transition-colors">
              TECHNOLOGY
            </Link>
            <Link href="/dashboard/network" className="hover:text-[#FF2E93] transition-colors">
              3D GRAPH
            </Link>
            <Link href="/dashboard/experiments" className="hover:text-white transition-colors">
              EXPERIMENTS
            </Link>
            <Link href="#team" className="hover:text-white transition-colors">
              TEAM
            </Link>
          </nav>
        </div>
      </header>

      {/* Slide-down Minimalist Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-8 sm:p-14"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-6">
              <span className="font-mono text-xs tracking-[0.36em] uppercase text-zinc-400">
                NAVIGATION // SOCIALPULSE
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-full border border-white/20 hover:border-[#FF2E93] flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {[
                { num: "01", label: "COMMAND OVERVIEW", href: "/dashboard", accent: "#56B4F9" },
                { num: "02", label: "TOPIC EXPLORER", href: "/dashboard/topics", accent: "#FF2E93" },
                { num: "03", label: "COMMUNITY GRAPH", href: "/dashboard/communities", accent: "#56B4F9" },
                { num: "04", label: "3D NETWORK CANVAS", href: "/dashboard/network", accent: "#FF2E93" },
                { num: "05", label: "AFFINITY MATRIX", href: "/dashboard/matrix", accent: "#56B4F9" },
                { num: "06", label: "ML EXPERIMENTS LAB", href: "/dashboard/experiments", accent: "#FF2E93" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-baseline gap-5 py-3 border-b border-white/10 hover:border-white/35 transition-colors"
                >
                  <span className="font-mono text-xs text-zinc-500">{item.num}</span>
                  <span className="font-display text-xl sm:text-2xl tracking-[0.1em] text-zinc-200 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-zinc-600 group-hover:text-[#56B4F9] transition-colors" />
                </Link>
              ))}
            </div>

            <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase flex justify-between border-t border-white/15 pt-6">
              <span>DISCOVER THE CONVERSATIONS</span>
              <span>REVEAL THE COMMUNITIES</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Canvas (Pure Pitch-Black Void) */}
      <section className="relative max-w-[1400px] mx-auto px-6 sm:px-10 min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 items-center gap-8 py-12 lg:py-0">
        {/* Left Editorial Typography Column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="lg:col-span-6 space-y-8 z-10"
        >
          {/* Kicker matching "A CALMER TOMORROW" */}
          <div className="font-mono text-[11px] tracking-[0.42em] uppercase text-zinc-300 leading-relaxed">
            <div>UNSUPERVISED</div>
            <div>INTELLIGENCE</div>
          </div>

          {/* Stacked Wide Geometric Display Headline matching "HUMAN NEXT" */}
          <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-[4.5rem] leading-[0.96] tracking-[0.06em] uppercase select-none">
            <span className="block text-[#56B4F9] glow-text-blue">SOCIAL</span>
            <span className="block text-[#FF2E93] glow-text-pink mt-1">PULSE</span>
          </h1>

          {/* Split-Tone Tracked Subhead matching "WHERE CREATIVITY MEETS INTELLIGENCE" */}
          <div className="font-mono text-xs sm:text-[13px] tracking-[0.32em] uppercase leading-loose space-y-0.5">
            <div>
              <span className="text-zinc-300">UNDERSTAND THE </span>
              <span className="text-[#56B4F9]">CONVERSATIONS</span>
            </div>
            <div>
              <span className="text-zinc-300">DISCOVER THE </span>
              <span className="text-[#FF2E93]/90">COMMUNITIES</span>
            </div>
          </div>

          {/* Concise Supporting Copy */}
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md font-light">
            An intelligent social network analytics platform that uncovers hidden topics,
            relationships, and communities through unsupervised machine learning.
          </p>

          {/* Signature Circular Arrow CTA + Secondary Link */}
          <div className="pt-2 flex flex-wrap items-center gap-8">
            <Link href="/dashboard" className="group inline-flex items-center gap-5">
              <span className="w-14 h-14 rounded-full border border-[#56B4F9]/60 group-hover:border-[#FF2E93] group-hover:shadow-pink-glow flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-zinc-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </span>
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-zinc-300 group-hover:text-white transition-colors">
                EXPLORE SOCIALPULSE
              </span>
            </Link>

            <Link
              href="/dashboard/network"
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-500 hover:text-[#56B4F9] border-b border-white/15 hover:border-[#56B4F9] pb-1 transition-colors"
            >
              VIEW ANALYTICS ↗
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Seamless Interactive 3D Social Sphere on Void Black */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-6 h-[460px] sm:h-[560px] lg:h-[640px] relative"
        >
          <HeroSphere />

          {/* Subtle Corner Architectural Telemetry */}
          <div className="absolute bottom-4 right-0 pointer-events-none flex items-center gap-4 font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#56B4F9]" />
              280 NODES
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E93]" />
              5 COMMUNITIES
            </span>
            <span className="hidden sm:inline text-zinc-600">DRAG TO ORBIT</span>
          </div>
        </motion.div>
      </section>

      {/* Architectural Specification Strip */}
      <section className="border-t border-b border-white/15 bg-[#040507]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
          {[
            { label: "REPRESENTATION", val: "SENTENCE EMBEDDINGS", accent: "text-[#56B4F9]" },
            { label: "MANIFOLD & CLUSTERING", val: "UMAP + HDBSCAN", accent: "text-[#FF2E93]" },
            { label: "GRAPH PARTITIONING", val: "LOUVAIN MODULARITY", accent: "text-[#56B4F9]" },
            { label: "SPATIAL RENDERING", val: "3D WEBGL FORCE GRAPH", accent: "text-[#FF2E93]" },
          ].map((spec, idx) => (
            <div key={idx} className="px-6 sm:px-10 py-6 space-y-1.5">
              <div className="font-mono text-[9px] tracking-[0.32em] text-zinc-500 uppercase">
                {spec.label}
              </div>
              <div className={`font-mono text-xs tracking-[0.18em] font-semibold ${spec.accent}`}>
                {spec.val}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual ML Pipeline Section (Swiss Editorial Grid) */}
      <section id="pipelines" className="max-w-[1400px] mx-auto border-b border-white/15">
        <div className="px-6 sm:px-10 py-14 border-b border-white/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.36em] text-[#56B4F9] uppercase mb-3">
              ARCHITECTURE // DUAL ENGINE
            </div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white">
              TWO INDEPENDENT ML PIPELINES
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
            Topic clustering and community detection are separated into dedicated algorithmic pipelines,
            then synthesized via a cross-sectional affinity matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/15">
          {/* Pipeline A */}
          <div className="p-8 sm:p-12 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase">
                01 // PIPELINE A
              </span>
              <span className="w-8 h-[1px] bg-[#56B4F9]" />
            </div>

            <h3 className="font-display text-xl sm:text-2xl tracking-[0.08em] uppercase text-white">
              TOPIC DISCOVERY
            </h3>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Transforms unstructured social posts into dense semantic vectors, reduces dimensionality
              via UMAP, isolates noise with HDBSCAN, and extracts domain keywords via c-TF-IDF.
            </p>

            <ul className="space-y-3 pt-2 font-mono text-[11px] tracking-[0.15em] text-zinc-300 uppercase">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#56B4F9]" />
                <span>TEXT CLEANING, TOKENIZATION & NORMALIZATION</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#56B4F9]" />
                <span>SENTENCE TRANSFORMERS / TF-IDF EXTRACTION</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#56B4F9]" />
                <span>UMAP & PCA 2D/3D MANIFOLD PROJECTION</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#56B4F9]" />
                <span>HDBSCAN, K-MEANS & DBSCAN BENCHMARKS</span>
              </li>
            </ul>
          </div>

          {/* Pipeline B */}
          <div className="p-8 sm:p-12 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.34em] text-[#FF2E93] uppercase">
                02 // PIPELINE B
              </span>
              <span className="w-8 h-[1px] bg-[#FF2E93]" />
            </div>

            <h3 className="font-display text-xl sm:text-2xl tracking-[0.08em] uppercase text-white">
              COMMUNITY DISCOVERY
            </h3>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Builds weighted social interaction multigraphs, detects structural user communities via
              Louvain modularity optimization, and ranks network influence.
            </p>

            <ul className="space-y-3 pt-2 font-mono text-[11px] tracking-[0.15em] text-zinc-300 uppercase">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#FF2E93]" />
                <span>NETWORKX WEIGHTED MULTIGRAPH TOPOLOGY</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#FF2E93]" />
                <span>LOUVAIN MODULARITY PARTITION OPTIMIZATION</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#FF2E93]" />
                <span>PAGERANK, DEGREE & BETWEENNESS CENTRALITY</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#FF2E93]" />
                <span>TOPIC-COMMUNITY AFFINITY MATRIX HEATMAP</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Research Team Section */}
      <section id="team" className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.36em] text-[#FF2E93] uppercase mb-2">
              PROJECT CREDENTIALS
            </div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white">
              PROJECT TEAM
            </h2>
          </div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-zinc-500 uppercase">
            SOCIALPULSE — SOCIAL MEDIA TOPIC & COMMUNITY CLUSTERING
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15 bg-[#050608]">
          {[
            {
              index: "01",
              name: "Konala Venkata Sri Sai Surya",
              reg: "12404306",
              accent: "#56B4F9",
            },
            {
              index: "02",
              name: "Ankit Kumawat",
              reg: "12406586",
              accent: "#FF2E93",
            },
            {
              index: "03",
              name: "Bhavya Nasa",
              reg: "12405762",
              accent: "#56B4F9",
            },
          ].map((member) => (
            <div key={member.reg} className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs tracking-[0.25em]"
                  style={{ color: member.accent }}
                >
                  MEMBER {member.index}
                </span>
                <span className="w-2 h-2" style={{ backgroundColor: member.accent }} />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">
                {member.name}
              </h3>
              <div className="font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase pt-3 border-t border-white/10">
                REG NO: <span className="text-white">{member.reg}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/15 py-8 px-6 sm:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-500">
          <div>SOCIALPULSE // UNSUPERVISED INTELLIGENCE PLATFORM</div>
          <div>DISCOVER THE CONVERSATIONS. REVEAL THE COMMUNITIES.</div>
        </div>
      </footer>
    </div>
  );
}
