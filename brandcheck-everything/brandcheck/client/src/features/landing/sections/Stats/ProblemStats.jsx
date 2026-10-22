import React from 'react';
import { ShieldAlert, FileX2, Coins, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, riseUp, cardHover } from '../../animation/variants.js';

const PAIN_POINTS = [
  {
    icon: FileX2,
    tag: 'FRAGMENTATION',
    title: 'Guideline Drift Across Teams',
    description:
      'Brand guidelines buried in PDFs or Notion wikis get ignored as publishing deadlines loom. Content creators guess preferred terminology and unverified specs.',
    impact: 'Inconsistent brand voice and conflicting product facts.',
  },
  {
    icon: ShieldAlert,
    tag: 'AUTOMATION RISKS',
    title: 'Silent AI Overwriting',
    description:
      'Generic writing assistants silently rewrite entire sentences, erasing author nuance, creating fictional claims, and leaving zero revision trail.',
    impact: 'Loss of creative ownership and unchecked hallucinations.',
  },
  {
    icon: Coins,
    tag: 'PRIVACY & COSTS',
    title: 'Cloud Leaks & Token Bills',
    description:
      'Sending unpublished press releases and confidential roadmaps to external cloud APIs risks intellectual property leaks and adds recurring SaaS subscription costs.',
    impact: '₹0 budget violation and data exposure risks.',
  },
];

export default function ProblemStats() {
  return (
    <section className="relative py-24 px-4 sm:px-6 bg-bg border-t border-border/40 overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-primary mb-3">
            <span>The Brand Governance Challenge</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text mb-4">
            Why pre-publication review matters.
          </h2>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Publishing ungrounded drafts risks brand credibility, legal exposure, and customer trust. Here is why conventional linters fall short.
          </p>
        </div>

        {/* 3 Pain Point Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.tag}
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                className="p-6 rounded-xl border border-border bg-surface/70 backdrop-blur-md flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-semibold tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {item.tag}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-primary group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-text mb-2.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-mono text-warning">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <span className="truncate">{item.impact}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
