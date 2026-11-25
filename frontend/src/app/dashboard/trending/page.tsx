"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Clock, Flame, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { TrendingTopicItem } from "@/types";
import { useDataset } from "@/context/DatasetContext";

export default function TrendingTopicsPage() {
  const { selectedDatasetId } = useDataset();
  const [topics, setTopics] = useState<TrendingTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTrendingTopics(selectedDatasetId ?? undefined);
      setTopics(res.trending_topics);
    } catch (err: any) {
      setError(err.message || "Failed to load trending topics.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          ANALYZING TEMPORAL TOPIC VELOCITIES...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          TREND ANALYSIS ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error}</p>
        <button
          onClick={loadTrending}
          className="px-5 py-2 border border-[#56B4F9] text-[#56B4F9] hover:bg-[#56B4F9] hover:text-black font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/15">
        <div className="font-mono text-[10px] tracking-[0.34em] text-[#56B4F9] uppercase mb-2">
          06 // TEMPORAL DYNAMICS
        </div>
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
          <Flame className="w-6 h-6 text-[#FF2E93]" />
          <span>TRENDING TOPICS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          DISTINGUISHING RAW POST VOLUME FROM GENUINE TEMPORAL GROWTH VELOCITY
        </p>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/15 bg-[#050608]">
        {topics.map((t, idx) => {
          const isPositive = t.growth_rate >= 0;
          return (
            <div
              key={t.topic_id}
              className="p-6 border-b border-r border-white/15 flex flex-col justify-between space-y-5 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase px-2 py-0.5 border border-white/15 text-zinc-400">
                    RANK #{idx + 1}
                  </span>
                  <div
                    className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 border tabular-nums ${
                      isPositive
                        ? "border-[#56B4F9]/40 text-[#56B4F9]"
                        : "border-[#FF2E93]/40 text-[#FF2E93]"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{isPositive ? `+${t.growth_rate}%` : `${t.growth_rate}%`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-2.5 h-2.5 min-w-2.5" style={{ backgroundColor: t.color }} />
                  <h3 className="font-mono text-sm font-bold text-white truncate">
                    {t.topic_name}
                  </h3>
                </div>

                <div className="font-mono text-[11px] text-zinc-500 mb-4">
                  TOTAL VOLUME: <strong className="text-white">{t.post_count}</strong> POSTS
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {t.top_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-mono bg-black text-zinc-300 border border-white/10"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>TEMPORAL VOLUME CURVE</span>
                </div>
                {t.temporal_volume.length > 0 ? (
                  <div className="flex items-end gap-1 h-12 w-full pt-2">
                    {t.temporal_volume.map((item, dIdx) => {
                      const maxVal = Math.max(...t.temporal_volume.map((v) => v.count), 1);
                      const heightPct = Math.max(12, (item.count / maxVal) * 100);
                      return (
                        <div
                          key={dIdx}
                          className="flex-1 transition-all hover:brightness-125 group relative"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: t.color,
                            opacity: 0.8,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-black border border-white/20 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none transition-opacity z-10">
                            {item.date}: {item.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="font-mono text-[10px] text-zinc-600">
                    NO TIMESTAMP DISTRIBUTION AVAILABLE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
