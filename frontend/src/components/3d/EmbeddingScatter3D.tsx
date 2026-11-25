"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { TopicScatterPoint, TopicCluster } from "@/types";
import { ThumbsUp, Eye, EyeOff } from "lucide-react";

interface EmbeddingScatter3DProps {
  points: TopicScatterPoint[];
  clusters: TopicCluster[];
  selectedClusterId?: number | null;
  onSelectClusterId?: (id: number | null) => void;
}

function ScatterScene({
  points,
  selectedClusterId,
  hoveredPoint,
  setHoveredPoint,
}: {
  points: TopicScatterPoint[];
  selectedClusterId: number | null;
  hoveredPoint: TopicScatterPoint | null;
  setHoveredPoint: (pt: TopicScatterPoint | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[-50, 50, 50]} intensity={1.7} color="#56B4F9" />
      <pointLight position={[50, -50, -50]} intensity={1.5} color="#FF2E93" />

      {points.map((pt) => {
        const isHovered = hoveredPoint?.id === pt.id;
        const matchesCluster =
          selectedClusterId === null || pt.topic_cluster_id === selectedClusterId;
        const opacity = matchesCluster ? (isHovered ? 1.0 : 0.85) : 0.08;
        const scale = isHovered ? 0.85 : pt.is_outlier ? 0.34 : 0.45;

        const pos: [number, number, number] = [pt.x * 2.5, pt.y * 2.5, (pt.z || 0) * 2.5];
        const pointColor = pt.is_outlier ? "#475569" : pt.color;

        return (
          <group key={pt.id} position={pos}>
            <mesh
              scale={[scale, scale, scale]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPoint(pt);
              }}
              onPointerOut={() => setHoveredPoint(null)}
            >
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial
                color={pointColor}
                emissive={pointColor}
                emissiveIntensity={isHovered ? 0.95 : 0.3}
                transparent
                opacity={opacity}
                roughness={0.25}
              />
            </mesh>

            {isHovered && (
              <Html distanceFactor={36} position={[0, scale + 0.9, 0]} center>
                <div className="pointer-events-none w-72 p-3.5 bg-black/95 border border-white/25 backdrop-blur-sm text-xs text-white shadow-2xl">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/15">
                    <span
                      className="font-mono text-[10px] tracking-wider uppercase truncate"
                      style={{ color: pointColor }}
                    >
                      {pt.topic_name}
                    </span>
                    {pt.is_outlier && (
                      <span className="text-[9px] px-1.5 py-0.5 border border-[#FF2E93]/40 text-[#FF2E93] font-mono uppercase">
                        OUTLIER
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-300 text-[11px] line-clamp-3 leading-relaxed">
                    "{pt.text}"
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/10 text-[10px] text-zinc-500 font-mono">
                    <span>@{pt.user_id}</span>
                    <span className="flex items-center gap-1 text-[#56B4F9]">
                      <ThumbsUp className="w-2.5 h-2.5" /> {pt.likes}
                    </span>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        maxDistance={120}
        minDistance={5}
      />
    </>
  );
}

export function EmbeddingScatter3D({
  points,
  clusters,
  selectedClusterId: controlledClusterId,
  onSelectClusterId,
}: EmbeddingScatter3DProps) {
  const [internalClusterId, setInternalClusterId] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TopicScatterPoint | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");

  const activeClusterId =
    controlledClusterId !== undefined ? controlledClusterId : internalClusterId;

  const setClusterFilter = (id: number | null) => {
    setInternalClusterId(id);
    if (onSelectClusterId) onSelectClusterId(id);
  };

  // Compute 2D SVG normalization bounds
  const { minX, spanX, minY, spanY } = React.useMemo(() => {
    if (!points.length) return { minX: -10, spanX: 20, minY: -10, spanY: 20 };
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const mnX = Math.min(...xs);
    const mxX = Math.max(...xs);
    const mnY = Math.min(...ys);
    const mxY = Math.max(...ys);
    return {
      minX: mnX,
      spanX: Math.max(0.1, mxX - mnX),
      minY: mnY,
      spanY: Math.max(0.1, mxY - mnY),
    };
  }, [points]);

  return (
    <div className="relative w-full h-[540px] bg-black border border-white/15 overflow-hidden">
      {/* Subtle Dual-Rim Backlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 25% 25%, rgba(86, 180, 249, 0.08) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(255, 46, 147, 0.08) 0%, transparent 45%)",
        }}
      />

      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-black/85 p-1.5 border border-white/15 backdrop-blur-sm max-w-4xl">
          <button
            onClick={() => setClusterFilter(null)}
            className={`px-3 py-1 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
              activeClusterId === null
                ? "bg-[#56B4F9] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ALL ({points.length})
          </button>
          {clusters.slice(0, 8).map((c) => (
            <button
              key={c.cluster_label_id}
              onClick={() =>
                setClusterFilter(
                  activeClusterId === c.cluster_label_id ? null : c.cluster_label_id
                )
              }
              className={`px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase flex items-center gap-1.5 border transition-colors ${
                activeClusterId === c.cluster_label_id
                  ? "bg-white/15 text-white border-[#FF2E93]"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2" style={{ backgroundColor: c.color }} />
              {c.cluster_label_id === -1 ? "NOISE" : `T#${c.cluster_label_id + 1}`} ({c.post_count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="px-3 py-1.5 bg-black/85 border border-white/15 hover:border-[#56B4F9] font-mono text-[10px] tracking-[0.2em] text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {viewMode === "3d" ? (
              <Eye className="w-3.5 h-3.5 text-[#56B4F9]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[#FF2E93]" />
            )}
            {viewMode.toUpperCase()} MANIFOLD
          </button>
        </div>
      </div>

      {viewMode === "3d" ? (
        <Canvas
          camera={{ position: [0, 0, 45], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ScatterScene
            points={points}
            selectedClusterId={activeClusterId}
            hoveredPoint={hoveredPoint}
            setHoveredPoint={setHoveredPoint}
          />
        </Canvas>
      ) : (
        /* 2D UMAP Manifold Scatter Projection */
        <div className="w-full h-full flex items-center justify-center p-12 relative">
          <svg className="w-full h-full" viewBox="-10 -10 120 120" preserveAspectRatio="xMidYMid meet">
            {points.map((pt) => {
              const cx = ((pt.x - minX) / spanX) * 100;
              const cy = ((pt.y - minY) / spanY) * 100;
              const match =
                activeClusterId === null || pt.topic_cluster_id === activeClusterId;
              return (
                <circle
                  key={pt.id}
                  cx={cx}
                  cy={cy}
                  r={pt.is_outlier ? 0.9 : 1.3}
                  fill={pt.is_outlier ? "#475569" : pt.color}
                  fillOpacity={match ? 0.88 : 0.12}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
          {hoveredPoint && (
            <div className="absolute bottom-4 left-4 w-80 p-3.5 bg-black/95 border border-white/25 text-xs">
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: hoveredPoint.color }}>
                {hoveredPoint.topic_name}
              </div>
              <p className="text-zinc-300 text-[11px] line-clamp-2">"{hoveredPoint.text}"</p>
            </div>
          )}
        </div>
      )}

      {/* Controls Hint */}
      <div className="absolute bottom-4 right-4 z-10 text-[9px] font-mono tracking-[0.22em] uppercase text-zinc-500 bg-black/80 px-3 py-1.5 border border-white/10 pointer-events-none">
        HOVER POINT FOR POST // DRAG TO ORBIT // 2D & 3D UMAP
      </div>
    </div>
  );
}
