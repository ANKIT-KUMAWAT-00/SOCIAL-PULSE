"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { NetworkNode, NetworkEdge, Community } from "@/types";
import { Search, Filter, ZoomIn, RefreshCw, Eye, EyeOff } from "lucide-react";

interface NetworkGraph3DProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  communities: Community[];
  onSelectNode?: (node: NetworkNode | null) => void;
}

function GraphScene({
  nodes,
  edges,
  selectedCommunity,
  searchQuery,
  hoveredNodeId,
  setHoveredNodeId,
  selectedNode,
  setSelectedNode,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedCommunity: number | null;
  searchQuery: string;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedNode: NetworkNode | null;
  setSelectedNode: (node: NetworkNode | null) => void;
}) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Edges geometry
  const { linePositions, lineColors } = useMemo(() => {
    const coords: number[] = [];
    const cols: number[] = [];

    edges.forEach((e) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (!src || !tgt) return;

      const isSrcMatch = selectedCommunity === null || src.community_id === selectedCommunity;
      const isTgtMatch = selectedCommunity === null || tgt.community_id === selectedCommunity;
      const isVisible = isSrcMatch && isTgtMatch;

      coords.push(src.x, src.y, src.z);
      coords.push(tgt.x, tgt.y, tgt.z);

      const baseCol = new THREE.Color(src.color);
      const alpha = isVisible ? 0.35 : 0.04;
      cols.push(baseCol.r * alpha, baseCol.g * alpha, baseCol.b * alpha);
      cols.push(baseCol.r * alpha, baseCol.g * alpha, baseCol.b * alpha);
    });

    return {
      linePositions: new Float32Array(coords),
      lineColors: new Float32Array(cols),
    };
  }, [edges, nodeMap, selectedCommunity]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[60, 60, 60]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-60, -60, -60]} intensity={1.2} color="#06b6d4" />

      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={lineColors.length / 3}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNode?.id === node.id;
        const matchesCommunity =
          selectedCommunity === null || node.community_id === selectedCommunity;
        const matchesSearch =
          !searchQuery ||
          node.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.id.toLowerCase().includes(searchQuery.toLowerCase());

        const opacity = matchesCommunity && matchesSearch ? 1.0 : 0.12;

        // Scale size by PageRank
        const baseRadius = 1.4 + Math.min(3.5, (node.pagerank || 0.01) * 75);
        const scale = isHovered || isSelected ? baseRadius * 1.5 : baseRadius;

        return (
          <group key={node.id} position={[node.x, node.y, node.z]}>
            <mesh
              scale={[scale, scale, scale]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredNodeId(node.id);
              }}
              onPointerOut={() => setHoveredNodeId(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(isSelected ? null : node);
              }}
            >
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? "#f59e0b" : node.color}
                emissive={isSelected ? "#f59e0b" : node.color}
                emissiveIntensity={isHovered || isSelected ? 0.8 : 0.25}
                transparent
                opacity={opacity}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Label for influential nodes or on hover */}
            {(isHovered || isSelected || node.pagerank > 0.04) && matchesCommunity && (
              <Html distanceFactor={60} position={[0, scale + 1.5, 0]} center>
                <div
                  className={`pointer-events-none px-2.5 py-1 rounded-md text-xs font-mono font-medium backdrop-blur-md transition-all shadow-lg whitespace-nowrap ${
                    isSelected
                      ? "bg-amber-500/90 text-black border border-amber-300"
                      : isHovered
                      ? "bg-midnight-800/90 text-cyan-300 border border-cyan-500/50"
                      : "bg-midnight-900/75 text-gray-300 border border-white/10"
                  }`}
                >
                  @{node.username}
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
        maxDistance={250}
        minDistance={10}
      />
    </>
  );
}

export function NetworkGraph3D({
  nodes,
  edges,
  communities,
  onSelectNode,
}: NetworkGraph3DProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");

  const hoveredNode = useMemo(
    () => (hoveredNodeId ? nodes.find((n) => n.id === hoveredNodeId) : null),
    [hoveredNodeId, nodes]
  );

  const activeNode = selectedNode || hoveredNode;

  const handleSelect = (node: NetworkNode | null) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-midnight-950 border border-surface-border shadow-glow-card">
      {/* Top Interactive HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Community Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-midnight-900/80 p-1.5 rounded-xl backdrop-blur-md border border-surface-border">
          <button
            onClick={() => setSelectedCommunity(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedCommunity === null
                ? "bg-violet-glow text-white shadow-glow-violet"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All Communities ({communities.length})
          </button>
          {communities.map((c) => (
            <button
              key={c.community_label_id}
              onClick={() =>
                setSelectedCommunity(
                  selectedCommunity === c.community_label_id ? null : c.community_label_id
                )
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                selectedCommunity === c.community_label_id
                  ? "bg-white/15 text-white border border-white/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.name.split(" ")[0]} ({c.member_count})
            </button>
          ))}
        </div>

        {/* Right: Search & View Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-midnight-900/80 backdrop-blur-md border border-surface-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-glow/60 w-44 transition-all"
            />
