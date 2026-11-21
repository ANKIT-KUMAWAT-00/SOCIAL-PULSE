"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const COMMUNITY_COLORS = [
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

function ParticleNetworkSphere({ count = 220 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  // Generate nodes arranged on an irregular spherical manifold
  const { positions, colors, nodeData, linePositions, lineColors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const nodes: { pos: THREE.Vector3; comm: number }[] = [];

    const radius = 3.2;

    for (let i = 0; i < count; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;

      // Add gentle radial perturbation
      const r = radius + (Math.sin(i * 0.3) * 0.35);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const comm = i % COMMUNITY_COLORS.length;
      const c = new THREE.Color(COMMUNITY_COLORS[comm]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      nodes.push({ pos: new THREE.Vector3(x, y, z), comm });
    }

    // Connect close neighbors with line segments
    const lineCoords: number[] = [];
    const lineCols: number[] = [];

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = nodes[i].pos.distanceTo(nodes[j].pos);
        if (dist < 1.35) {
          lineCoords.push(nodes[i].pos.x, nodes[i].pos.y, nodes[i].pos.z);
          lineCoords.push(nodes[j].pos.x, nodes[j].pos.y, nodes[j].pos.z);

          const c1 = new THREE.Color(COMMUNITY_COLORS[nodes[i].comm]);
          const c2 = new THREE.Color(COMMUNITY_COLORS[nodes[j].comm]);

          lineCols.push(c1.r * 0.7, c1.g * 0.7, c1.b * 0.7);
          lineCols.push(c2.r * 0.7, c2.g * 0.7, c2.b * 0.7);
        }
      }
    }

    return {
      positions: pos,
      colors: col,
      nodeData: nodes,
      linePositions: new Float32Array(lineCoords),
      lineColors: new Float32Array(lineCols),
    };
  }, [count]);

  // Subtle rotation and mouse responsiveness
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x += delta * 0.03;

      // Mouse parallax tilt
      const targetX = (state.mouse.y * Math.PI) / 10;
      const targetY = (state.mouse.x * Math.PI) / 8;
