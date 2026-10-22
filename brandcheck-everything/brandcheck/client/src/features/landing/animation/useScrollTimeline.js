import { useLayoutEffect, useEffect, useRef } from 'react';
import { gsap } from './gsap.js';

// Use isomorphic layout effect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Custom hook wrapping gsap.context for scoped selector queries and clean unmount disposal.
 * Per RULES.md: Clean up every GSAP resource on unmount.
 * 
 * @param {Function} effect - function receiving context as argument
 * @param {React.RefObject | React.MutableRefObject} [scopeRef] - container element ref for scoped selectors
 * @param {Array} [deps=[]] - dependency array
 */
export function useScrollTimeline(effect, scopeRef, deps = []) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useIsomorphicLayoutEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const scope = scopeRef?.current || undefined;
    const ctx = gsap.context((context) => {
      effectRef.current(context);
    }, scope);

    return () => {
      ctx.revert(); // Automatically kills all timelines and ScrollTriggers created in this context
    };
  }, deps);
}

export default useScrollTimeline;
