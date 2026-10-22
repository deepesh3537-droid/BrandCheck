import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up worker source for browser environments if available
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch (e) {
    // Fallback: workerless or bundle worker
  }
}

async function readFileAsText(file) {
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsText(file, 'UTF-8');
  });
}

async function readFileAsArrayBuffer(file) {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsArrayBuffer(file);
  });
}

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.markdown', '.docx', '.pdf'];

/**
 * Extracts plain text from an uploaded file (.txt, .md, .docx, .pdf).
 * Per TASK-080: PDF and DOCX extraction for draft review submission.
 * 
 * @param {File} file
 * @param {number} [maxBytes=2097152] - Default 2MB limit
 * @returns {Promise<{ text: string, title: string, pageCount?: number, fileType: string }>}
 */
export async function extractTextFromFile(file, maxBytes = 2 * 1024 * 1024) {
  if (!file) {
    throw new Error('No file provided.');
  }

  // 1. File Size Verification
  if (file.size > maxBytes) {
    throw new Error(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is ${(maxBytes / (1024 * 1024)).toFixed(0)} MB.`
    );
  }

  const name = file.name || 'document';
  const ext = '.' + name.split('.').pop().toLowerCase();
  const title = name.replace(/\.[^/.]+$/, '');

  // 2. Plain Text / Markdown (.txt, .md)
  if (ext === '.txt' || ext === '.md' || ext === '.markdown' || file.type === 'text/plain') {
    const text = await readFileAsText(file);
    if (!text || !text.trim()) {
      throw new Error('The text file appears to be empty.');
    }
    return { text, title, fileType: 'text' };
  }

  // 3. Microsoft Word (.docx)
  if (ext === '.docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value ? result.value.trim() : '';

      if (!text) {
        throw new Error('No readable text could be extracted from this DOCX document.');
      }

      return { text, title, fileType: 'docx' };
    } catch (err) {
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  }

  // 4. Adobe Portable Document Format (.pdf)
  if (ext === '.pdf' || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pageTexts = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageString = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        if (pageString.trim()) {
          pageTexts.push(pageString.trim());
        }
      }

      const fullText = pageTexts.join('\n\n');
      if (!fullText.trim()) {
        throw new Error('No readable text layers found in this PDF. (Scanned or image-only PDFs require OCR).');
      }

      return {
        text: fullText,
        title,
        pageCount: numPages,
        fileType: 'pdf',
      };
    } catch (err) {
      if (err.name === 'PasswordException') {
        throw new Error('Cannot extract text from password-protected or encrypted PDF.');
      }
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  throw new Error(
    `Unsupported format "${ext}". Supported formats are: ${SUPPORTED_EXTENSIONS.join(', ')}`
  );
}
