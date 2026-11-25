"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

const THEME_COMMUNITIES = [
  { color: "#56B4F9", label: "AI & NEURAL NETS" },
  { color: "#FF2E93", label: "CLOUD SYSTEMS" },
  { color: "#38BDF8", label: "ZK CRYPTOGRAPHY" },
  { color: "#F472B6", label: "BIOHACKING" },
  { color: "#E2E8F0", label: "3D SIMULATION" },
];

interface EdgePair {
  a: THREE.Vector3;
  b: THREE.Vector3;
  color: THREE.Color;
  speed: number;
  offset: number;
}

function ParticleNetworkSphere({ count = 280 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const pulsesRef = useRef<THREE.Points>(null!);
  const [hovered, setHovered] = useState(false);

  const {
    positions,
    colors,
    linePositions,
    lineColors,
    edgePairs,
    pulsePositions,
    pulseColors,
    topicAnchors,
  } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const nodes: { pos: THREE.Vector3; comm: number }[] = [];

    // 5 community centers on unit sphere for realistic clustered community topology
    const lobeCenters = [
      new THREE.Vector3(0.85, 0.55, 0.35).normalize(),
      new THREE.Vector3(-0.75, 0.4, 0.55).normalize(),
      new THREE.Vector3(0.2, -0.85, 0.45).normalize(),
      new THREE.Vector3(-0.45, -0.5, -0.75).normalize(),
      new THREE.Vector3(0.45, 0.2, -0.85).normalize(),
    ];

    const radius = 3.05;

    for (let i = 0; i < count; i++) {
      const comm = i % THEME_COMMUNITIES.length;
      const center = lobeCenters[comm];

      // Golden spiral base + pull toward community lobe center for organic clustering
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;
      const raw = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );

      const blended = raw.lerp(center, 0.36).normalize();
      const r = radius + Math.sin(i * 0.47) * 0.32;
      const finalVec = blended.multiplyScalar(r);

      pos[i * 3] = finalVec.x;
      pos[i * 3 + 1] = finalVec.y;
      pos[i * 3 + 2] = finalVec.z;

      const c = new THREE.Color(THEME_COMMUNITIES[comm].color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      nodes.push({ pos: finalVec, comm });
    }

    const lineCoords: number[] = [];
    const lineCols: number[] = [];
    const pairs: EdgePair[] = [];

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = nodes[i].pos.distanceTo(nodes[j].pos);
        const sameComm = nodes[i].comm === nodes[j].comm;
        const maxDist = sameComm ? 1.38 : 1.05;

        if (dist < maxDist) {
          lineCoords.push(nodes[i].pos.x, nodes[i].pos.y, nodes[i].pos.z);
          lineCoords.push(nodes[j].pos.x, nodes[j].pos.y, nodes[j].pos.z);

          const c1 = new THREE.Color(THEME_COMMUNITIES[nodes[i].comm].color);
          const c2 = new THREE.Color(THEME_COMMUNITIES[nodes[j].comm].color);

          const dim = sameComm ? 0.65 : 0.35;
          lineCols.push(c1.r * dim, c1.g * dim, c1.b * dim);
          lineCols.push(c2.r * dim, c2.g * dim, c2.b * dim);

          if (pairs.length < 75 && (i + j) % 5 === 0) {
            pairs.push({
              a: nodes[i].pos,
              b: nodes[j].pos,
              color: sameComm ? c1 : new THREE.Color("#FFFFFF"),
              speed: 0.25 + ((i * 7 + j) % 10) * 0.04,
              offset: ((i + j) % 17) / 17,
            });
          }
        }
      }
    }

    const pPos = new Float32Array(pairs.length * 3);
    const pCol = new Float32Array(pairs.length * 3);
    pairs.forEach((pair, idx) => {
      pPos[idx * 3] = pair.a.x;
      pPos[idx * 3 + 1] = pair.a.y;
      pPos[idx * 3 + 2] = pair.a.z;
      pCol[idx * 3] = pair.color.r;
      pCol[idx * 3 + 1] = pair.color.g;
      pCol[idx * 3 + 2] = pair.color.b;
    });

    const anchors = lobeCenters.map((dir, idx) => ({
      pos: dir.clone().multiplyScalar(radius + 0.65),
      label: THEME_COMMUNITIES[idx].label,
      color: THEME_COMMUNITIES[idx].color,
    }));

    return {
      positions: pos,
      colors: col,
      linePositions: new Float32Array(lineCoords),
      lineColors: new Float32Array(lineCols),
      edgePairs: pairs,
      pulsePositions: pPos,
      pulseColors: pCol,
      topicAnchors: anchors,
    };
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (hovered ? 0.04 : 0.09);
      const targetX = (state.pointer.y * Math.PI) / 12;
      const targetY = (state.pointer.x * Math.PI) / 10;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.02;
    }

    // Animate data packets flowing along edges
    if (pulsesRef.current && edgePairs.length > 0) {
      const attr = pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < edgePairs.length; i++) {
        const edge = edgePairs[i];
        const progress = (t * edge.speed + edge.offset) % 1;
        arr[i * 3] = THREE.MathUtils.lerp(edge.a.x, edge.b.x, progress);
        arr[i * 3 + 1] = THREE.MathUtils.lerp(edge.a.y, edge.b.y, progress);
        arr[i * 3 + 2] = THREE.MathUtils.lerp(edge.a.z, edge.b.z, progress);
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Community Nodes */}
      <points>
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
          size={0.11}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Network Connection Filaments */}
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
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.26}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Traveling Data Signal Pulses */}
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
          size={0.18}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Subtle Bioluminescent Inner Core */}
      <mesh>
        <icosahedronGeometry args={[1.75, 2]} />
        <meshBasicMaterial color="#56B4F9" transparent opacity={0.045} wireframe />
      </mesh>
      <mesh rotation={[0.4, 0.8, 0]}>
        <icosahedronGeometry args={[2.35, 1]} />
        <meshBasicMaterial color="#FF2E93" transparent opacity={0.03} wireframe />
      </mesh>

      {/* Floating Editorial Topic Labels */}
      {topicAnchors.map((anchor, idx) => (
        <Html
          key={idx}
          position={[anchor.pos.x, anchor.pos.y, anchor.pos.z]}
          center
          distanceFactor={12}
        >
          <div className="pointer-events-none select-none flex items-center gap-1.5 px-2 py-0.5 bg-black/75 border border-white/15 backdrop-blur-sm whitespace-nowrap">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: anchor.color }}
            />
            <span className="font-mono text-[8px] tracking-[0.26em] text-zinc-300">
              {anchor.label}
            </span>
          </div>
        </Html>
      ))}
    </group>
  );
}

export function HeroSphere() {
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
      if (!gl) setWebglReady(false);
    } catch {
      setWebglReady(false);
    }
  }, []);

  if (!webglReady) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-72 h-72 rounded-full border border-[#56B4F9]/40 flex items-center justify-center relative">
          <div className="w-52 h-52 rounded-full border border-[#FF2E93]/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      {/* Dual-Rim Volumetric Backlight matching the reference theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 38% 38%, rgba(86, 180, 249, 0.16) 0%, transparent 48%), radial-gradient(circle at 68% 66%, rgba(255, 46, 147, 0.18) 0%, transparent 50%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 8.2], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[-8, 6, 6]} intensity={2.0} color="#56B4F9" />
        <pointLight position={[8, -6, -4]} intensity={2.0} color="#FF2E93" />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
          <ParticleNetworkSphere count={280} />
        </Float>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 1.45}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>
    </div>
  );
}
