/**
 * Compresses an image file to a reasonably small JPEG data URL, suitable for
 * storing locally (IndexedDB). Caps the largest dimension and re-encodes.
 */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<string> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Google's image CDN (lh3.googleusercontent.com) resizes on the fly via a
 * `=wNNN` suffix; requesting the display size instead of the full upload makes
 * grids load much faster and the browser caches each variant.
 */
export function sizedImage(url: string, width: number): string {
  if (!url.startsWith("https://lh3.googleusercontent.com/")) return url;
  return `${url.split("=")[0]}=w${width}`;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}
