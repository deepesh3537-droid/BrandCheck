import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthProvider.jsx';
import HeroHeadline from './HeroHeadline.jsx';
import HeroBackdrop from './HeroBackdrop.jsx';
import { HERO_COPY } from './hero.copy.js';
import { riseUp, fadeIn, cardHover } from '../../animation/variants.js';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-16 pb-24 overflow-hidden">
      {/* 3D Backdrop & atmospheric ambient lighting */}
      <HeroBackdrop />

      {/* Hero content container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Eyebrow badge */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface/80 backdrop-blur-md text-xs text-muted mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-medium text-text">{HERO_COPY.eyebrow.label}</span>
        </motion.div>

        {/* GSAP Split Headline Reveal */}
        <HeroHeadline />

        {/* Lead subheadline */}
        <motion.p
          variants={riseUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed font-normal"
        >
          {HERO_COPY.headline.sub}
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          variants={riseUp}
          initial="hidden"
          animate="visible"
          custom={0.45}
          className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16"
        >
          {user ? (
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-bg font-semibold text-base hover:bg-primary-hover transition-all shadow-glow-primary active:scale-[0.98]"
            >
              <span>{HERO_COPY.cta.primaryAuth}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-bg font-semibold text-base hover:bg-primary-hover transition-all shadow-glow-primary active:scale-[0.98]"
              >
                <span>{HERO_COPY.cta.primaryGuest}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border bg-surface/70 hover:bg-surface-2 text-text font-medium text-base transition-colors"
              >
                <span>{HERO_COPY.cta.secondary}</span>
              </Link>
            </>
          )}

          <a
            href="#product-preview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs text-muted hover:text-primary transition-colors font-mono"
          >
            <span>↓ {HERO_COPY.cta.demo}</span>
          </a>
        </motion.div>

        {/* Verified Capability Cards */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.6}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full text-left"
        >
          {HERO_COPY.capabilities.map((item) => (
            <motion.div
              key={item.id}
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              className="p-5 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-primary font-semibold tracking-wide">
                  {item.tag}
                </span>
                <CheckCircle2 className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-sm font-semibold text-text mb-1 tracking-tight">
                {item.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
