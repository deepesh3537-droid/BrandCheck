import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { contentService } from '../../services/contentService.js';

const SAMPLE_CONTENT_WITH_ISSUES = `Verdant Botanicals is proud to introduce our revolutionary new line of organic restorative beverages, founded in 2018 with over a decade of experience in botanical extraction.

Our flagship drink contains 25g protein per bottle and is guaranteed to boost immunity and eliminate all chronic fatigue. We use natural cane sugar to preserve our crisp botanical flavor.

Experience the miracle of natural wellness with our cheap and accessible daily tonics.`;

import { extractTextFromFile, SUPPORTED_EXTENSIONS } from './documentExtractor.js';
import { extractTextFromPoster } from './imageAnalyzer.js';

export default function SubmitContentModal({ workspaceId, isOpen, onClose, onContentSubmitted }) {
  const [tab, setTab] = useState('paste'); // 'paste' | 'upload'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setOcrProgress(0);

    try {
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

      if (isImage) {
        const { text, confidence } = await extractTextFromPoster(file, (p) => setOcrProgress(p));
        if (!text) {
          throw new Error('No legible text could be detected in this image/poster.');
        }
        setBody(text);
        setFileName(file.name);
        if (!title) {
          setTitle(`Poster Copy: ${file.name.replace(/\.[^/.]+$/, '')}`);
        }
      } else {
        const extracted = await extractTextFromFile(file);
        setBody(extracted.text);
        setFileName(file.name);
        if (!title) {
          setTitle(extracted.title);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to extract text from document or image.');
      setFileName('');
    } finally {
      setExtracting(false);
      setOcrProgress(0);
    }
  };

  const handleLoadSample = () => {
    setTitle('Product Launch Draft (With Deliberate Issues)');
    setBody(SAMPLE_CONTENT_WITH_ISSUES);
    setTab('paste');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Please provide a document title and body text.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await contentService.createContent(workspaceId, {
        title: title.trim(),
        body: body.trim(),
      });
      onContentSubmitted(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit content for review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Submit Content for Review</h3>
            <p className="text-xs text-muted">Upload or paste draft copy to verify against brand guidelines</p>
          </div>
        </div>

        {/* Tab Switcher & Quick Sample button */}
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === 'paste'
                  ? 'bg-primary text-bg shadow-glow-primary'
                  : 'text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              Paste Draft Copy
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === 'upload'
                  ? 'bg-primary text-bg shadow-glow-primary'
                  : 'text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              Upload .txt / .md
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 text-xs text-suggestion hover:text-suggestion/80 font-medium py-1 px-2 rounded hover:bg-surface-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Sample</span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1.5" htmlFor="content-title">
              Document Title
            </label>
            <input
              id="content-title"
              type="text"
              required
              placeholder="e.g. Q3 Summer Campaign Launch Copy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted/60"
            />
          </div>

          {tab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.docx,.pdf,.png,.jpg,.jpeg,.webp,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => !extracting && fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-surface-2/40 hover:bg-surface-2/70"
              >
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-primary mx-auto mb-2">
                  {extracting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-semibold text-text">
                  {extracting
                    ? ocrProgress > 0
                      ? `Scanning poster text (${ocrProgress}%)...`
                      : 'Extracting document text...'
                    : fileName
                    ? `Selected: ${fileName}`
                    : 'Click or drop a document (.txt, .docx, .pdf) or poster (.png, .jpg)'}
                </p>
                <p className="text-[11px] text-muted mt-1">
                  Text, Word, PDF, or Marketing Poster Images (local OCR) up to 2 MB
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-text" htmlFor="content-body">
                Draft Body Text
              </label>
              <span className="text-[11px] font-mono text-muted">
                {body.length} characters
              </span>
            </div>
            <textarea
              id="content-body"
              rows={8}
              required
              placeholder="Paste your marketing copy, blog post, product description, or social caption here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted/60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-bg text-xs font-semibold shadow-glow-primary transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
