"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Grid3X3, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { TopicCommunityMatrixData } from "@/types";
import { useDataset } from "@/context/DatasetContext";

export default function MatrixPage() {
  const { selectedDatasetId } = useDataset();
  const [data, setData] = useState<TopicCommunityMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    commName: string;
    topicName: string;
    affinity: number;
  } | null>(null);

  const loadMatrix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTopicCommunityMatrix(selectedDatasetId ?? undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load relationship matrix.");
    } finally {
      setLoading(false);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
        <div className="w-8 h-8 border-2 border-[#56B4F9] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-500">
          SYNTHESIZING TOPIC-COMMUNITY AFFINITY MATRIX...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#050608] border border-[#FF2E93]/40 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-7 h-7 text-[#FF2E93] mx-auto mb-3" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-white">
          CROSS-ANALYSIS ERROR
        </h3>
        <p className="text-xs text-zinc-400 mt-2 mb-5">{error || "No matrix data received."}</p>
        <button
          onClick={loadMatrix}
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/15">
        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-[#FF2E93] uppercase mb-2">
            05 // CROSS-PIPELINE SYNTHESIS
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-white flex items-center gap-3">
            <Grid3X3 className="w-6 h-6 text-[#FF2E93]" />
            <span>TOPIC-COMMUNITY MATRIX</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            PROBABILITY DISTRIBUTION P(TOPIC | COMMUNITY) FROM USER POST-TO-GRAPH MAPPING
          </p>
        </div>

        <button
          onClick={loadMatrix}
          className="self-start sm:self-auto px-4 py-2 bg-[#050608] border border-white/15 hover:border-[#56B4F9] font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#56B4F9]" />
          <span>RECALCULATE</span>
        </button>
      </div>

      {/* Automated Cross-Sectional Inferences */}
      <div className="border border-white/15 bg-[#050608] p-6 space-y-4">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#56B4F9]">
          AUTOMATED CROSS-SECTIONAL INFERENCES (CORRELATIONAL OBSERVATIONS)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-black border border-white/10 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 bg-[#FF2E93] mt-1.5 min-w-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="border border-white/15 bg-[#050608] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-display text-sm tracking-[0.12em] uppercase text-white">
              AFFINITY HEATMAP
            </h3>
            <p className="font-mono text-[11px] text-zinc-500 mt-1">
              Row-normalized share across discovered topics per community (sum = 100%).
            </p>
          </div>
          {hoveredCell && (
            <div className="px-3 py-1.5 bg-black border border-[#56B4F9]/50 text-xs font-mono text-white">
              <strong className="text-[#56B4F9]">{hoveredCell.commName}</strong> →{" "}
              <strong className="text-[#FF2E93]">{hoveredCell.topicName}</strong>:{" "}
              <span className="font-bold">{(hoveredCell.affinity * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-black text-zinc-500 border border-white/15 w-56 uppercase text-[10px] tracking-[0.16em]">
                  Community \ Topic
                </th>
                {data.topics.map((t) => (
                  <th
                    key={t.id}
                    className="py-3 px-4 bg-black text-zinc-200 border border-white/15 text-center min-w-[130px]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.name.split(":")[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.communities.map((c, cIdx) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 bg-black text-white font-semibold border border-white/15">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </td>
                  {data.matrix[cIdx]?.map((val, tIdx) => {
                    const topic = data.topics[tIdx];
                    const intensity = Math.min(1.0, val * 1.85);
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
                        className="py-3 px-4 border border-white/15 text-center transition-colors cursor-crosshair font-semibold"
                        style={{
                          backgroundColor: isHigh
                            ? `rgba(255, 46, 147, ${Math.min(0.85, intensity * 0.72)})`
                            : `rgba(86, 180, 249, ${intensity * 0.55})`,
                          color: isHigh ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
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

        {/* Scale Legend */}
        <div className="flex items-center justify-end gap-3 text-[10px] font-mono tracking-[0.18em] uppercase text-zinc-500">
          <span>0%</span>
          <div className="w-36 h-2.5 bg-gradient-to-r from-black via-[#56B4F9]/60 to-[#FF2E93]" />
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
