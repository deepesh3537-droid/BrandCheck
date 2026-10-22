import { describe, it, expect, vi } from 'vitest';
import { extractTextFromFile, SUPPORTED_EXTENSIONS } from './documentExtractor.js';

describe('documentExtractor (TASK-080)', () => {
  it('exposes the supported extensions including docx and pdf', () => {
    expect(SUPPORTED_EXTENSIONS).toContain('.txt');
    expect(SUPPORTED_EXTENSIONS).toContain('.md');
    expect(SUPPORTED_EXTENSIONS).toContain('.docx');
    expect(SUPPORTED_EXTENSIONS).toContain('.pdf');
  });

  it('rejects files larger than the maximum allowed size', async () => {
    const hugeFile = new File(['a'.repeat(100)], 'large.txt', { type: 'text/plain' });
    Object.defineProperty(hugeFile, 'size', { value: 3 * 1024 * 1024 });

    await expect(extractTextFromFile(hugeFile, 2 * 1024 * 1024)).rejects.toThrow(
      /File is too large/i
    );
  });

  it('rejects unsupported file formats', async () => {
    const unsupportedFile = new File(['content'], 'archive.zip', { type: 'application/zip' });

    await expect(extractTextFromFile(unsupportedFile)).rejects.toThrow(
      /Unsupported format/i
    );
  });

  it('extracts plain text and markdown files cleanly', async () => {
    const textFile = new File(['Hello brand check content!'], 'sample.txt', {
      type: 'text/plain',
    });

    const result = await extractTextFromFile(textFile);
    expect(result.text).toBe('Hello brand check content!');
    expect(result.title).toBe('sample');
    expect(result.fileType).toBe('text');
  });

  it('rejects empty text files', async () => {
    const emptyFile = new File(['   '], 'empty.md', { type: 'text/markdown' });

    await expect(extractTextFromFile(emptyFile)).rejects.toThrow(
      /appears to be empty/i
    );
  });
});
