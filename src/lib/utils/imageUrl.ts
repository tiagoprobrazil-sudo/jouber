const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";

/**
 * Uses Supabase's image CDN for responsive WebP delivery, while leaving
 * bundled assets and third-party URLs untouched.
 *
 * IMPORTANT: Supabase's render endpoint does NOT auto-scale the omitted
 * dimension when only `width` is given — confirmed by direct testing: a
 * request for `?width=240` against a 5712×4284 original came back
 * 240×5712 (height left completely untouched), not 240×180 as you'd
 * expect from a normal "resize keeping aspect ratio" behavior. So a
 * `height` (derived from `aspectRatio`, matching the CSS box the image
 * renders into) must always be sent alongside `width`, with
 * `resize=cover` so the CDN itself crops to fill — otherwise the
 * "thumbnail" comes back a wildly wrong shape and gets mangled further
 * by object-cover client-side.
 *
 * @param aspectRatio width/height of the box this image renders into
 *   (e.g. 1 for a square thumbnail, 4/5 for a portrait product photo).
 *   Defaults to 1 (square) — most thumbnail grids in this app are square.
 */
export function optimizedImageUrl(url: string | undefined, width: number, aspectRatio = 1, quality = 75): string | undefined {
  if (!url?.includes(SUPABASE_PUBLIC_OBJECT)) return url;
  const height = Math.max(1, Math.round(width / aspectRatio));
  const rendered = url.replace(SUPABASE_PUBLIC_OBJECT, "/storage/v1/render/image/public/");
  const separator = rendered.includes("?") ? "&" : "?";
  return `${rendered}${separator}width=${width}&height=${height}&resize=cover&quality=${quality}`;
}

export function optimizedImageSrcSet(url: string | undefined, aspectRatio = 1): string | undefined {
  if (!url?.includes(SUPABASE_PUBLIC_OBJECT)) return undefined;
  return [480, 800, 1200, 1920].map((width) => `${optimizedImageUrl(url, width, aspectRatio)} ${width}w`).join(", ");
}
