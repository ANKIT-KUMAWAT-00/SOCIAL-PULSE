"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowUpRight, Clock, Tag, Flame, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { TrendingTopicItem } from "@/types";

export default function TrendingTopicsPage() {
  const [topics, setTopics] = useState<TrendingTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTrendingTopics();
      setTopics(res.trending_topics);
    } catch (err: any) {
      setError(err.message || "Failed to load trending topics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Analyzing temporal topic velocities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Trend Analysis Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error}</p>
        <button
          onClick={loadTrending}
          className="px-4 py-2 bg-violet-glow hover:bg-violet-dark text-white rounded-xl text-xs font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Flame className="w-7 h-7 text-amber-400" />
          <span>Trending & Emerging Topics</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Distinguishing simple post volume from genuine growth velocity using timestamped post distribution curves.
        </p>
      </div>

      {/* Trending Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((t, idx) => {
          const isPositive = t.growth_rate >= 0;
          return (
            <div
              key={t.topic_id}
              className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md flex flex-col justify-between space-y-5 hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                    Rank #{idx + 1}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isPositive ? `+${t.growth_rate}%` : `${t.growth_rate}%`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <h3 className="text-base font-bold text-white truncate">{t.topic_name}</h3>
                </div>

                <div className="text-xs text-gray-400 font-mono mb-4">
                  Total Volume: <strong className="text-white">{t.post_count}</strong> posts
                </div>

                {/* Keyword Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {t.top_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sparkline Temporal Distribution Preview */}
              <div className="pt-3 border-t border-surface-border">
                <div className="text-[10px] font-mono text-gray-500 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Temporal Volume Trajectory</span>
                </div>
                {t.temporal_volume.length > 0 ? (
                  <div className="flex items-end gap-1.5 h-12 w-full pt-2">
                    {t.temporal_volume.map((item, dIdx) => {
                      const maxVal = Math.max(...t.temporal_volume.map((v) => v.count), 1);
                      const heightPct = Math.max(15, (item.count / maxVal) * 100);
                      return (
                        <div
                          key={dIdx}
                          className="flex-1 rounded-t transition-all hover:brightness-125 group relative"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: t.color,
                            opacity: 0.75,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black text-[9px] font-mono text-white whitespace-nowrap pointer-events-none transition-opacity">
                            {item.date}: {item.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 font-mono">No timestamp trend data available</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
