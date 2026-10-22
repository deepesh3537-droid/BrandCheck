import React from 'react';
import { Users, Code2, Cpu, ShieldCheck } from 'lucide-react';

const VALUES = [
  {
    icon: Cpu,
    title: 'Local-First Inference',
    description:
      'Engineered to run on everyday consumer hardware (RTX 3050 Laptop GPU / 16GB RAM) using Ollama and ONNX. Zero cloud API keys required.',
  },
  {
    icon: ShieldCheck,
    title: 'Human-in-Control Governance',
    description:
      'AI models formulate diffs and link citations, but human creators and reviewers retain absolute decision authority over what gets published.',
  },
  {
    icon: Code2,
    title: 'Transparent & Permissive',
    description:
      'All code, local model runtimes, and dependencies operate strictly under verified Apache 2.0, MIT, and BSD licenses.',
  },
];

export default function TeamSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 bg-bg border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-primary mb-3">
            <span>Built by Team Voxen</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text mb-4">
            Engineered with integrity.
          </h2>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Crafted for the Inkloom AI Challenge. Built on the conviction that brand compliance tools should empower authors rather than replace them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border/80 bg-surface/50 backdrop-blur-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-primary mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
