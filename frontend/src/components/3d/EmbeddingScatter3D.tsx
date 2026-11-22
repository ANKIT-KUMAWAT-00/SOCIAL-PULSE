"use client";

import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { TopicScatterPoint, TopicCluster } from "@/types";
import { Filter, Layers, MessageSquare, ThumbsUp } from "lucide-react";

interface EmbeddingScatter3DProps {
  points: TopicScatterPoint[];
  clusters: TopicCluster[];
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
      <ambientLight intensity={0.7} />
      <pointLight position={[50, 50, 50]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-50, -50, -50]} intensity={1.2} color="#06b6d4" />

      {points.map((pt) => {
        const isHovered = hoveredPoint?.id === pt.id;
        const matchesCluster =
          selectedClusterId === null || pt.topic_cluster_id === selectedClusterId;
        const opacity = matchesCluster ? (isHovered ? 1.0 : 0.8) : 0.08;
        const scale = isHovered ? 0.8 : pt.is_outlier ? 0.35 : 0.45;

        // Scale coordinates to fit nicely in 3D viewport
        const pos: [number, number, number] = [pt.x * 2.5, pt.y * 2.5, (pt.z || 0) * 2.5];

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
                color={pt.is_outlier ? "#64748b" : pt.color}
                emissive={pt.is_outlier ? "#64748b" : pt.color}
                emissiveIntensity={isHovered ? 0.9 : 0.25}
                transparent
                opacity={opacity}
                roughness={0.3}
              />
            </mesh>

            {isHovered && (
              <Html distanceFactor={35} position={[0, scale + 0.8, 0]} center>
                <div className="pointer-events-none w-64 p-3 rounded-xl bg-midnight-900/95 backdrop-blur-md border border-white/20 shadow-2xl text-xs text-white">
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/10">
                    <span
                      className="font-medium text-[11px] truncate"
                      style={{ color: pt.color }}
                    >
                      {pt.topic_name}
                    </span>
                    {pt.is_outlier && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                        OUTLIER
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-[11px] line-clamp-3 leading-relaxed">
                    "{pt.text}"
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-gray-400 font-mono">
                    <span>@{pt.user_id}</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-2.5 h-2.5" /> {pt.likes}
                    </span>
                  </div>
                </div>
              </Html>
            )}
