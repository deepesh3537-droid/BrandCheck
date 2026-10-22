import React, { useRef } from 'react';
import { useScrollTimeline } from '../../animation/useScrollTimeline.js';
import { gsap } from '../../animation/gsap.js';
import { EASINGS, DURATIONS } from '../../animation/easings.js';
import { HERO_COPY } from './hero.copy.js';

export default function HeroHeadline() {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  useScrollTimeline(() => {
    if (!wordsRef.current || wordsRef.current.length === 0) return;

    // GSAP staggered word reveal
    gsap.fromTo(
      wordsRef.current,
      {
        opacity: 0,
        y: 28,
        rotateX: -20,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: DURATIONS.base,
        ease: EASINGS.smooth,
        stagger: 0.05,
        clearProps: 'transform,rotateX', // clean up inline styles after animation
      }
    );
  }, containerRef);

  const { lead, accent } = HERO_COPY.headline;
  const leadWords = lead.split(' ');
  const accentWords = accent.split(' ');

  let wordIndex = 0;

  return (
    <h1
      ref={containerRef}
      className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-text leading-[1.1] mb-6 perspective-[1000px]"
    >
      <span className="block mb-1 sm:mb-2">
        {leadWords.map((word, i) => {
          const currentIndex = wordIndex++;
          return (
            <React.Fragment key={`lead-${i}`}>
              <span
                ref={(el) => (wordsRef.current[currentIndex] = el)}
                className="inline-block mr-2 sm:mr-3"
              >
                {word}
              </span>{' '}
            </React.Fragment>
          );
        })}
      </span>
      <span className="bg-gradient-to-r from-primary via-cyan-200 to-primary bg-clip-text text-transparent block">
        {accentWords.map((word, i) => {
          const currentIndex = wordIndex++;
          return (
            <React.Fragment key={`accent-${i}`}>
              <span
                ref={(el) => (wordsRef.current[currentIndex] = el)}
                className="inline-block mr-2 sm:mr-3"
              >
                {word}
              </span>{' '}
            </React.Fragment>
          );
        })}
      </span>
    </h1>
  );
}
