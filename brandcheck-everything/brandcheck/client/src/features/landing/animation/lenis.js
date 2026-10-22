import Lenis from 'lenis';
import { ScrollTrigger } from './gsap.js';

/**
 * Initializes Lenis smooth scrolling, synchronized with GSAP ScrollTrigger.
 * Respects prefers-reduced-motion (ADR-030).
 * @param {Object} options
 * @returns {{ lenis: Lenis | null, destroy: () => void }}
 */
export function initLenis(options = {}) {
  if (typeof window === 'undefined') {
    return { lenis: null, destroy: () => {} };
  }

  // Check prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    return { lenis: null, destroy: () => {} };
  }

  try {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      ...options,
    });

    // Synchronize Lenis scroll position with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    const gsapInstance = ScrollTrigger.core?.gsap || window.gsap;
    if (gsapInstance) {
      gsapInstance.ticker.add(tickerCallback);
      gsapInstance.ticker.lagSmoothing(0);
    }

    return {
      lenis,
      destroy: () => {
        if (gsapInstance) {
          gsapInstance.ticker.remove(tickerCallback);
        }
        lenis.destroy();
      },
    };
  } catch (err) {
    console.warn('[Landing] Lenis failed to initialize, falling back to standard scroll:', err);
    return { lenis: null, destroy: () => {} };
  }
}
