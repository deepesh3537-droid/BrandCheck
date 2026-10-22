import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleConstellation from './objects/ParticleConstellation.jsx';
import { useSceneQuality } from './useSceneQuality.js';

export default function HeroScene() {
  const { particleCount, dpr } = useSceneQuality();

  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      >
        <color attach="background" args={['#0B0F14']} />
        <fog attach="fog" args={['#0B0F14', 10, 25]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22D3EE" />
        <Suspense fallback={null}>
          <ParticleConstellation count={particleCount} />
        </Suspense>
      </Canvas>
    </div>
  );
}
