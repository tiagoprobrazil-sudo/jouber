import type { MediaItem } from "@/lib/data/types";
import { productImages, editorialImages } from "@/lib/data/mock/images";

let n = 0;
function item(url: string, name: string, usedIn: MediaItem["usedIn"]): MediaItem {
  n += 1;
  return { id: `media-seed-${n}`, url, name, usedIn, createdAt: "2026-01-01" };
}

export const media: MediaItem[] = [
  ...Object.entries(productImages).map(([key, url]) => item(url, `${key}.webp`, "products")),
  ...Object.entries(editorialImages).map(([key, url]) => item(url, `${key}.webp`, "posts")),
];
