import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Terminal, Cpu } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative w-full border-t border-border/60 bg-surface/40 backdrop-blur-md pt-16 pb-12 px-4 sm:px-6 text-xs text-muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shadow-glow-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base text-text tracking-tight">BrandCheck</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Local-first pre-publication brand governance. Review marketing drafts, posters, and specs grounded in brand truth.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border text-[11px] font-mono text-primary">
              <Cpu className="w-3 h-3" />
              <span>100% Local Inference (₹0)</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-mono mb-3">
              Application
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/app" className="hover:text-primary transition-colors">
                  Workspace Demo
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Models */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-mono mb-3">
              Local Runtimes
            </h4>
            <ul className="space-y-2 text-muted">
              <li>Ollama · Qwen2.5-3B (Diffs & Fixes)</li>
              <li>Hugging Face ONNX · MiniLM (Vectors)</li>
              <li>Hugging Face ONNX · DeBERTa (Tone)</li>
              <li>Tesseract.js (Client Poster OCR)</li>
            </ul>
          </div>

          {/* Col 4: Project Info */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-mono mb-3">
              Compliance & Ethics
            </h4>
            <ul className="space-y-2 text-muted">
              <li>ADR-032 Honesty & Integrity Policy</li>
              <li>WCAG 2.1 AA Content Accessibility</li>
              <li>Immutable Draft Protection</li>
              <li>Apache 2.0 & MIT Open-Source</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted/80">
          <div>
            BrandCheck by Team Voxen · Inkloom AI Challenge
          </div>
          <div className="flex items-center gap-4">
            <span>₹0 API Budget</span>
            <span>·</span>
            <span>Local PostgreSQL</span>
            <span>·</span>
            <span>Human-in-Control</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
