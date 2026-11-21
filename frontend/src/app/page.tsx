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
