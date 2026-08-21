/**
 * Tiny localStorage-backed persistence used by the mock repository so
 * that admin edits (create/update/delete post or product) survive a
 * page reload during the demo, without needing a backend.
 *
 * Each collection is seeded once from the bundled mock data the first
 * time it's read, then lives entirely in localStorage after that.
 */

const NAMESPACE = "ass:v1:";

function readRaw<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeRaw<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
}

export function getCollection<T>(key: string, seed: T[]): T[] {
  const existing = readRaw<T[]>(key);
  if (existing) return existing;
  writeRaw(key, seed);
  return seed;
}

export function setCollection<T>(key: string, value: T[]): void {
  writeRaw(key, value);
}

export function resetCollection(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NAMESPACE + key);
}
