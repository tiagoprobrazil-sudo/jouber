const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";

/** Uses Supabase's image CDN for responsive WebP delivery, while leaving
 * bundled assets and third-party URLs untouched. */
export function optimizedImageUrl(url: string | undefined, width: number, quality = 75): string | undefined {
  if (!url?.includes(SUPABASE_PUBLIC_OBJECT)) return url;
  const rendered = url.replace(SUPABASE_PUBLIC_OBJECT, "/storage/v1/render/image/public/");
  const separator = rendered.includes("?") ? "&" : "?";
  return `${rendered}${separator}width=${width}&quality=${quality}`;
}

export function optimizedImageSrcSet(url: string | undefined): string | undefined {
  if (!url?.includes(SUPABASE_PUBLIC_OBJECT)) return undefined;
  return [480, 800, 1200, 1920].map((width) => `${optimizedImageUrl(url, width)} ${width}w`).join(", ");
}
