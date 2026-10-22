import { DURATIONS, EASINGS } from './easings.js';

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      duration: DURATIONS.base,
      delay: custom,
      ease: EASINGS.smooth,
    },
  }),
};

export const riseUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.base,
      delay: custom,
      ease: EASINGS.smooth,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1, transition: { duration: 0.2 } },
  hover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: EASINGS.smooth } },
};
