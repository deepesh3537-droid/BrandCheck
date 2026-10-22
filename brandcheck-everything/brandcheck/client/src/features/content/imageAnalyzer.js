import Tesseract from 'tesseract.js';

/**
 * Calculates Euclidean distance between two RGB colors (0 to 441).
 * @param {{ r: number, g: number, b: number }} c1
 * @param {{ r: number, g: number, b: number }} c2
 * @returns {number}
 */
export function colorDistance(c1, c2) {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Converts Hex string (#RRGGBB) to RGB object.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const num = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = (num >> 8) & 0xf;
    const g = (num >> 4) & 0xf;
    const b = num & 0xf;
    return { r: (r << 4) | r, g: (g << 4) | g, b: (b << 4) | b };
  }
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

/**
 * Validates image file resolution and dimensions against brand requirements.
 * @param {File} file
 * @param {{ minWidth?: number, minHeight?: number, maxWidth?: number, maxHeight?: number }} [requirements]
 * @returns {Promise<{ width: number, height: number, aspectRatio: string, valid: boolean, errors: string[] }>}
 */
export async function validateImageDimensions(file, requirements = {}) {
  const { minWidth = 400, minHeight = 400, maxWidth = 8000, maxHeight = 8000 } = requirements;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height);
      const aspectRatio = `${width / divisor}:${height / divisor}`;

      const errors = [];
      if (width < minWidth || height < minHeight) {
        errors.push(`Image resolution (${width}x${height}px) is below brand minimum (${minWidth}x${minHeight}px).`);
      }
      if (width > maxWidth || height > maxHeight) {
        errors.push(`Image resolution (${width}x${height}px) exceeds permitted limit (${maxWidth}x${maxHeight}px).`);
      }

      resolve({
        width,
        height,
        aspectRatio,
        valid: errors.length === 0,
        errors,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file. Corrupted or unsupported format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Extracts dominant color palette from an image using canvas sampling.
 * @param {File | HTMLImageElement} imageSource
 * @param {number} [maxColors=4]
 * @returns {Promise<Array<{ hex: string, rgb: { r: number, g: number, b: number }, percentage: number }>>}
 */
export async function extractDominantColors(imageSource, maxColors = 4) {
  if (typeof window === 'undefined') return [];

  let imgElement;
  let objectUrlToRevoke = null;

  if (imageSource instanceof File) {
    imgElement = new Image();
    objectUrlToRevoke = URL.createObjectURL(imageSource);
    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = reject;
      imgElement.src = objectUrlToRevoke;
    });
  } else {
    imgElement = imageSource;
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sampleSize = 64; // downsample for fast processing
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    const buckets = {};
    const totalPixels = sampleSize * sampleSize;

    // Quantize into 32-value bins
    for (let i = 0; i < imageData.length; i += 16) {
      const r = Math.round(imageData[i] / 32) * 32;
      const g = Math.round(imageData[i + 1] / 32) * 32;
      const b = Math.round(imageData[i + 2] / 32) * 32;
      const a = imageData[i + 3];

      if (a > 128) { // ignore transparent pixels
        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }
    }

    const sortedBuckets = Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors);

    return sortedBuckets.map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      const toHex = (c) => Math.min(255, c).toString(16).padStart(2, '0');
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      return {
        hex,
        rgb: { r, g, b },
        percentage: Number(((count / (totalPixels / 4)) * 100).toFixed(1)),
      };
    });
  } finally {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
  }
}

/**
 * Checks extracted image colors against workspace approved brand palette hex codes.
 * @param {Array<{ hex: string, rgb: { r: number, g: number, b: number } }>} extractedColors
 * @param {string[]} approvedPaletteHexes
 * @param {number} [tolerance=45] - max acceptable Euclidean distance
 * @returns {Array<{ hex: string, isApproved: boolean, nearestApprovedHex?: string, distance: number }>}
 */
export function compareWithBrandPalette(extractedColors, approvedPaletteHexes = [], tolerance = 45) {
  if (!approvedPaletteHexes || approvedPaletteHexes.length === 0) {
    return extractedColors.map((c) => ({
      hex: c.hex,
      isApproved: true,
      distance: 0,
    }));
  }

  const approvedRgbs = approvedPaletteHexes.map((hex) => ({
    hex,
    rgb: hexToRgb(hex),
  }));

  return extractedColors.map((extracted) => {
    let nearest = approvedRgbs[0];
    let minDistance = colorDistance(extracted.rgb, nearest.rgb);

    for (let i = 1; i < approvedRgbs.length; i++) {
      const dist = colorDistance(extracted.rgb, approvedRgbs[i].rgb);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = approvedRgbs[i];
      }
    }

    return {
      hex: extracted.hex,
      isApproved: minDistance <= tolerance,
      nearestApprovedHex: nearest.hex,
      distance: Number(minDistance.toFixed(1)),
    };
  });
}

/**
 * Performs local optical character recognition on an image or poster file.
 * Uses Tesseract.js running 100% locally via WebAssembly.
 * @param {File | Blob | string} imageFile
 * @param {Function} [onProgress] - callback reporting progress percentage (0-100)
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export async function extractTextFromPoster(imageFile, onProgress) {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    const text = (result?.data?.text || '').trim();
    const confidence = Number((result?.data?.confidence || 0).toFixed(1));

    return {
      text,
      confidence,
    };
  } catch (err) {
    throw new Error(`OCR processing failed: ${err.message}`);
  }
}
