"use client";

import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { NetworkNode, NetworkEdge, Community } from "@/types";
import { Search, Eye, EyeOff, RotateCcw } from "lucide-react";

interface NetworkGraph3DProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  communities: Community[];
  onSelectNode?: (node: NetworkNode | null) => void;
  initialCommunityFilter?: number | null;
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
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const pulsesRef = useRef<THREE.Points>(null!);
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const { linePositions, lineColors, activeEdges, pulsePositions, pulseColors } = useMemo(() => {
    const coords: number[] = [];
    const cols: number[] = [];
    const visibleEdges: { src: NetworkNode; tgt: NetworkNode; color: THREE.Color; speed: number; offset: number }[] = [];

    edges.forEach((e, idx) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (!src || !tgt) return;

      const isSrcMatch = selectedCommunity === null || src.community_id === selectedCommunity;
      const isTgtMatch = selectedCommunity === null || tgt.community_id === selectedCommunity;
      const isVisible = isSrcMatch && isTgtMatch;

      coords.push(src.x, src.y, src.z);
      coords.push(tgt.x, tgt.y, tgt.z);

      const baseCol = new THREE.Color(src.color);
      const alpha = isVisible ? 0.38 : 0.04;
      cols.push(baseCol.r * alpha, baseCol.g * alpha, baseCol.b * alpha);
      cols.push(baseCol.r * alpha, baseCol.g * alpha, baseCol.b * alpha);

      if (isVisible && visibleEdges.length < 90 && idx % 2 === 0) {
        visibleEdges.push({
          src,
          tgt,
          color: baseCol,
          speed: 0.3 + (idx % 7) * 0.06,
          offset: (idx % 13) / 13,
        });
      }
    });

    const pPos = new Float32Array(visibleEdges.length * 3);
    const pCol = new Float32Array(visibleEdges.length * 3);
    visibleEdges.forEach((ve, i) => {
      pPos[i * 3] = ve.src.x;
      pPos[i * 3 + 1] = ve.src.y;
      pPos[i * 3 + 2] = ve.src.z;
      pCol[i * 3] = ve.color.r;
      pCol[i * 3 + 1] = ve.color.g;
      pCol[i * 3 + 2] = ve.color.b;
    });

    return {
      linePositions: new Float32Array(coords),
      lineColors: new Float32Array(cols),
      activeEdges: visibleEdges,
      pulsePositions: pPos,
      pulseColors: pCol,
    };
  }, [edges, nodeMap, selectedCommunity]);

  const targetVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smoothly focus camera target on selected node (or reset to origin)
    if (controlsRef.current) {
      if (selectedNode) {
        targetVec.set(selectedNode.x, selectedNode.y, selectedNode.z);
      } else {
        targetVec.set(0, 0, 0);
      }
      controlsRef.current.target.lerp(targetVec, 0.08);
      controlsRef.current.update();
    }

    // Animate particles flowing along active edges
    if (pulsesRef.current && activeEdges.length > 0) {
      const attr = pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < activeEdges.length; i++) {
        const edge = activeEdges[i];
        const p = (t * edge.speed + edge.offset) % 1;
        arr[i * 3] = THREE.MathUtils.lerp(edge.src.x, edge.tgt.x, p);
        arr[i * 3 + 1] = THREE.MathUtils.lerp(edge.src.y, edge.tgt.y, p);
        arr[i * 3 + 2] = THREE.MathUtils.lerp(edge.src.z, edge.tgt.z, p);
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[-65, 65, 65]} intensity={1.8} color="#56B4F9" />
      <pointLight position={[65, -65, -65]} intensity={1.6} color="#FF2E93" />

      {/* Graph Edges */}
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

      {/* Traveling Data Signals */}
      {activeEdges.length > 0 && (
        <points ref={pulsesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pulsePositions.length / 3}
              array={pulsePositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={pulseColors.length / 3}
              array={pulseColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={1.6}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* User Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNode?.id === node.id;
        const matchesCommunity =
          selectedCommunity === null || node.community_id === selectedCommunity;
        const matchesSearch =
          !searchQuery ||
          node.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.id.toLowerCase().includes(searchQuery.toLowerCase());

        const isHighlighted = matchesCommunity && matchesSearch;
        const opacity = isHighlighted ? 1.0 : 0.1;

        const baseRadius = 1.4 + Math.min(3.5, (node.pagerank || 0.01) * 75);
        const scale = isHovered || isSelected ? baseRadius * 1.45 : baseRadius;
        const activeColor = isSelected ? "#FF2E93" : node.color;

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
                color={activeColor}
                emissive={activeColor}
                emissiveIntensity={isHovered || isSelected ? 0.9 : 0.3}
                transparent
                opacity={opacity}
                roughness={0.2}
                metalness={0.75}
              />
            </mesh>

            {(isHovered || isSelected || (node.pagerank > 0.04 && isHighlighted)) && (
              <Html distanceFactor={62} position={[0, scale + 1.6, 0]} center>
                <div
                  className={`pointer-events-none px-2 py-0.5 text-[10px] font-mono tracking-wider whitespace-nowrap border ${
                    isSelected
                      ? "bg-[#FF2E93] text-white border-white"
                      : isHovered
                      ? "bg-black/95 text-[#56B4F9] border-[#56B4F9]/60"
                      : "bg-black/80 text-zinc-300 border-white/15"
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
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        maxDistance={260}
        minDistance={12}
      />
    </>
  );
}

export function NetworkGraph3D({
  nodes,
  edges,
  communities,
  onSelectNode,
  initialCommunityFilter = null,
}: NetworkGraph3DProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(initialCommunityFilter);
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
    <div className="relative w-full h-[640px] bg-black border border-white/15 overflow-hidden">
      {/* Dual-Rim Atmospheric Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(86, 180, 249, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255, 46, 147, 0.08) 0%, transparent 45%)",
        }}
      />

      {/* Top Interactive HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Community Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-black/85 p-1.5 border border-white/15 backdrop-blur-sm">
          <button
            onClick={() => setSelectedCommunity(null)}
            className={`px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors ${
              selectedCommunity === null
                ? "bg-[#56B4F9] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ALL ({communities.length})
          </button>
          {communities.map((c) => (
            <button
              key={c.community_label_id}
              onClick={() =>
                setSelectedCommunity(
                  selectedCommunity === c.community_label_id ? null : c.community_label_id
                )
              }
              className={`px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase flex items-center gap-1.5 transition-colors border ${
                selectedCommunity === c.community_label_id
                  ? "bg-white/15 text-white border-[#FF2E93]"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2" style={{ backgroundColor: c.color }} />
              {c.name.split(" ")[0]} ({c.member_count})
            </button>
          ))}
        </div>

        {/* Right: Search, Reset Focus & View Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH USER NODE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/85 border border-white/15 pl-8 pr-3 py-1.5 font-mono text-[10px] tracking-wider text-white placeholder-zinc-600 focus:outline-none focus:border-[#56B4F9] w-48 transition-colors"
            />
          </div>

          {selectedNode && (
            <button
              onClick={() => handleSelect(null)}
              className="px-2.5 py-1.5 bg-black/85 border border-[#FF2E93]/60 font-mono text-[10px] tracking-wider text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white transition-colors flex items-center gap-1"
              title="Reset Camera Focus"
            >
              <RotateCcw className="w-3 h-3" />
              RESET
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="px-3 py-1.5 bg-black/85 border border-white/15 hover:border-[#56B4F9] font-mono text-[10px] tracking-[0.2em] text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Toggle 2D / 3D Canvas Projection"
          >
            {viewMode === "3d" ? (
              <Eye className="w-3.5 h-3.5 text-[#56B4F9]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[#FF2E93]" />
            )}
            {viewMode.toUpperCase()}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      {viewMode === "3d" ? (
        <Canvas
          camera={{ position: [0, 0, 95], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <GraphScene
            nodes={nodes}
            edges={edges}
            selectedCommunity={selectedCommunity}
            searchQuery={searchQuery}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            selectedNode={selectedNode}
            setSelectedNode={handleSelect}
          />
        </Canvas>
      ) : (
        /* 2D SVG Fallback Projection */
        <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
          <svg className="w-full h-full max-w-4xl" viewBox="-65 -65 130 130">
            {edges.map((e, idx) => {
              const src = nodes.find((n) => n.id === e.source);
              const tgt = nodes.find((n) => n.id === e.target);
              if (!src || !tgt) return null;
              const match =
                selectedCommunity === null ||
                (src.community_id === selectedCommunity &&
                  tgt.community_id === selectedCommunity);
              return (
                <line
                  key={idx}
                  x1={src.x * 0.7}
                  y1={src.y * 0.7}
                  x2={tgt.x * 0.7}
                  y2={tgt.y * 0.7}
                  stroke={src.color}
                  strokeOpacity={match ? 0.35 : 0.05}
                  strokeWidth={0.4}
                />
              );
            })}
            {nodes.map((n) => {
              const match =
                selectedCommunity === null || n.community_id === selectedCommunity;
              return (
                <circle
                  key={n.id}
                  cx={n.x * 0.7}
                  cy={n.y * 0.7}
                  r={1.5 + n.pagerank * 30}
                  fill={n.color}
                  fillOpacity={match ? 0.95 : 0.15}
                  className="cursor-pointer hover:stroke-white hover:stroke-1"
                  onClick={() => handleSelect(n)}
                />
              );
            })}
          </svg>
        </div>
      )}

      {/* Floating HUD: Active Node Telemetry Panel */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 z-10 w-72 p-4 bg-black/95 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: activeNode.color }} />
              <span className="font-mono font-semibold text-white text-xs tracking-wider">
                @{activeNode.username}
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] px-2 py-0.5 border border-white/15 text-zinc-300">
              {activeNode.community_name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="bg-[#08090c] border border-white/10 p-2">
              <div className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                PageRank
              </div>
              <div className="text-xs font-mono font-semibold text-[#56B4F9] mt-0.5 tabular-nums">
                {activeNode.pagerank.toFixed(4)}
              </div>
            </div>
            <div className="bg-[#08090c] border border-white/10 p-2">
              <div className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                Degree
              </div>
              <div className="text-xs font-mono font-semibold text-[#FF2E93] mt-0.5 tabular-nums">
                {activeNode.degree.toFixed(3)}
              </div>
            </div>
            <div className="bg-[#08090c] border border-white/10 p-2">
              <div className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                Between
              </div>
              <div className="text-xs font-mono font-semibold text-white mt-0.5 tabular-nums">
                {activeNode.betweenness.toFixed(3)}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono tracking-wider text-zinc-400 flex justify-between items-center pt-1">
            <span>
              FOLLOWERS: <strong className="text-white">{activeNode.followers.toLocaleString()}</strong>
            </span>
            <span>
              FOLLOWING: <strong className="text-white">{activeNode.following.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Controls Hint Overlay */}
      <div className="absolute bottom-4 right-4 z-10 text-[9px] font-mono tracking-[0.22em] uppercase text-zinc-500 bg-black/80 px-3 py-1.5 border border-white/10 pointer-events-none">
        CLICK NODE TO FOCUS // DRAG TO ORBIT // SCROLL TO ZOOM
      </div>
    </div>
  );
}
