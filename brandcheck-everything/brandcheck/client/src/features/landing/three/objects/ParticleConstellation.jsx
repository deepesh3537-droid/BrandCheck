import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleConstellation({ count = 150 }) {
  const pointsRef = useRef();
  const linesRef = useRef();

  // Generate random 3D points inside a sphere
  const [positions, connections] = useMemo(() => {
    const coords = new Float32Array(count * 3);
    const radius = 12;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;

      const sinPhi = Math.sin(phi);
      coords[i * 3] = r * sinPhi * Math.cos(theta);
      coords[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      coords[i * 3 + 2] = r * Math.cos(phi);
    }

    // Connect close points
    const lineIndices = [];
    const maxDistSq = 4.2 * 4.2;

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = coords[i * 3] - coords[j * 3];
        const dy = coords[i * 3 + 1] - coords[j * 3 + 1];
        const dz = coords[i * 3 + 2] - coords[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistSq) {
          lineIndices.push(i, j);
        }
      }
    }

    return [coords, new Uint16Array(lineIndices)];
  }, [count]);

  // Gentle procedural rotation
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += delta * 0.04;
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group>
      {/* Constellation Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#22D3EE"
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Constellation Connecting Web Lines */}
      {connections.length > 0 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="index"
              count={connections.length}
              array={connections}
              itemSize={1}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#22D3EE"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}
