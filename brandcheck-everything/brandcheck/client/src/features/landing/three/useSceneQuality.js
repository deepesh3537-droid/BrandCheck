import { useState, useEffect } from 'react';

/**
 * Evaluates host hardware capabilities, WebGL support, and user motion preferences.
 * Lower quality or disables 3D on weak or mobile devices (ADR-030).
 * 
 * @returns {{ enabled: boolean, particleCount: number, dpr: number, isLowTier: boolean }}
 */
export function useSceneQuality() {
  const [quality, setQuality] = useState({
    enabled: true,
    particleCount: 160,
    dpr: 1.5,
    isLowTier: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setQuality({ enabled: false, particleCount: 0, dpr: 1, isLowTier: true });
      return;
    }

    // 2. Check WebGL support
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = Boolean(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      hasWebGL = false;
    }

    if (!hasWebGL) {
      setQuality({ enabled: false, particleCount: 0, dpr: 1, isLowTier: true });
      return;
    }

    // 3. Detect mobile or constrained hardware
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    const cores = navigator.hardwareConcurrency || 4;
    const isLowTier = isMobile || cores <= 4;

    if (isLowTier) {
      setQuality({
        enabled: true,
        particleCount: 60,
        dpr: 1,
        isLowTier: true,
      });
    } else {
      setQuality({
        enabled: true,
        particleCount: 180,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        isLowTier: false,
      });
    }
  }, []);

  return quality;
}

export default useSceneQuality;
