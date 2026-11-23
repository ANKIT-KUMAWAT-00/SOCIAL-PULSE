"use client";

import React, { useState, useEffect } from "react";
import { Grid3X3, Sparkles, Info, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { TopicCommunityMatrixData } from "@/types";

export default function MatrixPage() {
  const [data, setData] = useState<TopicCommunityMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    commName: string;
    topicName: string;
    affinity: number;
  } | null>(null);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTopicCommunityMatrix();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load relationship matrix.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-10 h-10 border-2 border-violet-glow border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">Computing cross-sectional affinity matrix...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-midnight-900 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Cross-Analysis Error</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">{error || "No matrix data received."}</p>
        <button
          onClick={loadMatrix}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Grid3X3 className="w-7 h-7 text-violet-glow" />
            <span>Topic & Community Relationship Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Cross-pipeline analytical synthesis mapping user community membership against semantic topic discourse.
          </p>
        </div>

        <button
          onClick={loadMatrix}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-surface-border text-xs text-gray-300 hover:text-white flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-glow" />
          <span>Recalculate Matrix</span>
        </button>
      </div>

      {/* Cross-Sectional Natural Language Insights */}
      <div className="p-6 rounded-2xl bg-midnight-900/80 border border-surface-border backdrop-blur-md space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider text-cyan-glow">
          <Sparkles className="w-4 h-4" />
          <span>Automated Cross-Sectional Inferences</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {data.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-midnight-950/80 border border-white/5 text-xs text-gray-300 flex items-start gap-2.5 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow mt-1.5 min-w-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Heatmap Matrix */}
      <div className="p-6 rounded-2xl bg-midnight-900/70 border border-surface-border backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Affinity Heatmap</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Row-normalized probability distribution: P(Topic | Community). Sum across topics per community = 100%.
            </p>
          </div>
          {hoveredCell && (
            <div className="px-3 py-1.5 rounded-xl bg-midnight-950 border border-violet-glow/40 text-xs font-mono text-white">
              <strong className="text-cyan-glow">{hoveredCell.commName}</strong> ➔ <strong className="text-violet-glow">{hoveredCell.topicName}</strong>:{" "}
              <span className="text-emerald-400 font-bold">{(hoveredCell.affinity * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-midnight-950 text-gray-400 border border-surface-border w-56">
                  Community \ Topic
                </th>
                {data.topics.map((t) => (
                  <th
                    key={t.id}
                    className="py-3 px-4 bg-midnight-950 text-gray-200 border border-surface-border text-center min-w-[140px]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.name.split(":")[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.communities.map((c, cIdx) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 bg-midnight-950/90 text-white font-semibold border border-surface-border">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </td>
                  {data.matrix[cIdx]?.map((val, tIdx) => {
                    const topic = data.topics[tIdx];
                    const intensity = Math.min(1.0, val * 1.8);
                    const isHigh = val >= 0.35;

                    return (
                      <td
                        key={tIdx}
                        onMouseEnter={() =>
                          setHoveredCell({
                            commName: c.name,
                            topicName: topic.name,
                            affinity: val,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className="py-3 px-4 border border-surface-border text-center transition-all cursor-crosshair font-semibold"
                        style={{
                          backgroundColor: `rgba(139, 92, 246, ${intensity * 0.75})`,
                          color: isHigh ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {(val * 100).toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 text-xs font-mono text-gray-400">
          <span>Low Affinity (0%)</span>
          <div className="w-32 h-3 rounded-full bg-gradient-to-r from-midnight-950 via-violet-glow/40 to-violet-glow" />
          <span>High Concentration (100%)</span>
        </div>
      </div>
    </div>
  );
}
