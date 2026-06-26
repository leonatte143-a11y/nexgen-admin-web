/** Client-side ad asset validation (mirrors backend rules). */

const IMAGE_MAX_BYTES = 500 * 1024;
const VIDEO_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_SEC = 15;
const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 608;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const DIM_TOLERANCE = 24;

export type AdPlacement = 'home_dashboard' | 'partner_live_tracking';
export type AdAssetValidation = { ok: boolean; errors: string[] };

export const AD_ASSET_SPECS = [
  { type: 'Poster (.jpg / .png)', maxSize: '500 KB', duration: 'N/A', dimensions: '1080px × 608px' },
  { type: 'Video (.mp4)', maxSize: '5 MB', duration: '15 seconds', dimensions: '1280px × 720px' },
] as const;

export async function validateAdAssetFile(file: File, mediaType: 'image' | 'video'): Promise<AdAssetValidation> {
  const errors: string[] = [];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (mediaType === 'image') {
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      errors.push('Posters must be JPG or PNG.');
    }
    if (file.size > IMAGE_MAX_BYTES) {
      errors.push('Poster must be 500 KB or smaller.');
    }
    const dims = await readImageDimensions(file);
    if (dims) {
      const wOk = Math.abs(dims.width - POSTER_WIDTH) <= DIM_TOLERANCE;
      const hOk = Math.abs(dims.height - POSTER_HEIGHT) <= DIM_TOLERANCE;
      if (!wOk || !hOk) {
        errors.push(`Poster dimensions must be ${POSTER_WIDTH}px × ${POSTER_HEIGHT}px.`);
      }
    }
  } else {
    if (ext !== 'mp4') errors.push('Videos must be MP4.');
    if (file.size > VIDEO_MAX_BYTES) errors.push('Video must be 5 MB or smaller.');
    const duration = await readVideoDuration(file);
    if (duration != null && duration > VIDEO_MAX_SEC) {
      errors.push(`Video must be ${VIDEO_MAX_SEC} seconds or shorter.`);
    }
    const dims = await readVideoDimensions(file);
    if (dims) {
      const wOk = Math.abs(dims.width - VIDEO_WIDTH) <= DIM_TOLERANCE;
      const hOk = Math.abs(dims.height - VIDEO_HEIGHT) <= DIM_TOLERANCE;
      if (!wOk || !hOk) {
        errors.push(`Video dimensions must be ${VIDEO_WIDTH}px × ${VIDEO_HEIGHT}px.`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

function readVideoDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
