/**
 * Shared motion tokens, durations, and easings for the public landing page.
 * Per DESIGN.md: Landing page timings 400-1200ms; product app 120-240ms.
 */

export const DURATIONS = {
  instant: 0.1,
  fast: 0.4,
  base: 0.7,
  slow: 1.0,
  epic: 1.4,
};

export const EASINGS = {
  // GSAP string easings
  power2Out: 'power2.out',
  power3Out: 'power3.out',
  power4Out: 'power4.out',
  expoOut: 'expo.out',
  elasticOut: 'elastic.out(1, 0.75)',

  // Cubic bezier arrays for Framer Motion or CSS
  smooth: [0.16, 1, 0.3, 1], // ease-out-expo feel
  gentle: [0.25, 0.1, 0.25, 1],
  anticipate: [0.68, -0.6, 0.32, 1.6],
};
