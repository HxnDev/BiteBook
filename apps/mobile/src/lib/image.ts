/**
 * Google's image CDN (lh3.googleusercontent.com) can resize on the fly via a
 * `=wNNN` suffix. Requesting the display size instead of the full upload makes
 * lists load much faster. expo-image then caches the result on disk.
 */
export function sizedImage(
  url: string | null,
  width: number,
): string | null {
  if (!url) return null;
  if (!url.startsWith("https://lh3.googleusercontent.com/")) return url;
  return `${url.split("=")[0]}=w${width}`;
}
