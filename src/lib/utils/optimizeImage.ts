const MAX_IMAGE_DIMENSION = 2000;
const WEBP_QUALITY = 0.82;

function webpName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "") || "image"}.webp`;
}

/**
 * Normalizes admin uploads before they ever reach Storage. A 2000px edge
 * remains sharp in the product gallery while avoiding multi-megabyte camera
 * originals. Encoding happens in the browser, so no server-side image worker
 * is required.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process this image.");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Your browser could not convert this image to WebP.")),
        "image/webp",
        WEBP_QUALITY,
      );
    });

    return new File([blob], webpName(file.name), { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
