/** Client-side ad asset validation (mirrors backend rules). */

const IMAGE_MAX_BYTES = 500 * 1024;
const VIDEO_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_SEC = 15;

export type AdAssetValidation = { ok: boolean; errors: string[] };

export async function validateAdAssetFile(file: File, mediaType: 'image' | 'video'): Promise<AdAssetValidation> {
  const errors: string[] = [];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (mediaType === 'image') {
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      errors.push('Images must be WebP, PNG, or JPG.');
    }
    if (file.size > IMAGE_MAX_BYTES) {
      errors.push('Image must be 500 KB or smaller.');
    }
    const dims = await readImageDimensions(file);
    if (dims) {
      const ratio = dims.width / dims.height;
      const is169 = Math.abs(ratio - 16 / 9) < 0.08;
      const is916 = Math.abs(ratio - 9 / 16) < 0.08;
      if (!is169 && !is916) {
        errors.push('Use 16:9 (dashboard) or 9:16 (full-screen) aspect ratio.');
      }
    }
  } else {
    if (ext !== 'mp4') errors.push('Videos must be MP4 (H.264).');
    if (file.size > VIDEO_MAX_BYTES) errors.push('Video must be 5 MB or smaller.');
    const duration = await readVideoDuration(file);
    if (duration != null && duration > VIDEO_MAX_SEC) {
      errors.push(`Video must be ${VIDEO_MAX_SEC} seconds or shorter.`);
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

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
