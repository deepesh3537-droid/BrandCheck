import React, { Suspense, lazy } from 'react';
import { useSceneQuality } from '../../three/useSceneQuality.js';

const LazyHeroScene = lazy(() => import('../../three/HeroScene.jsx'));

export default function HeroBackdrop() {
  const { enabled } = useSceneQuality();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep obsidian ambient glow & gradient overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[250px] bg-suggestion/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Subtle tech grid mesh */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#22D3EE 1px, transparent 1px), linear-gradient(90deg, #22D3EE 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 3. 3D Scene (Lazy-loaded, gracefully omitted if reduced-motion or unsupported) */}
      {enabled && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000">
            <LazyHeroScene />
          </div>
        </Suspense>
      )}

      {/* 4. Contrast vignette over 3D scene (per ADR-030: contrast over 3D) */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg z-1" />
    </div>
  );
}
