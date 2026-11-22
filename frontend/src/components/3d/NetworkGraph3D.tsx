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
