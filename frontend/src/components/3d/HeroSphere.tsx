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
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          vertexColors
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Network Edges */}
      <lineSegments ref={linesRef}>
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
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Ambient Inner Core Glow */}
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.04}
          wireframe
        />
      </mesh>
    </group>
  );
}

export function HeroSphere() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#06b6d4" />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <ParticleNetworkSphere count={240} />
        </Float>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
