/**
 * Data access layer for the whole app.
 *
 * Every page and admin screen talks to the functions in this file only
 * — never to the mock arrays or localStorage directly. Today these
 * functions read/write a localStorage-backed copy of the bundled mock
 * data (see lib/data/mock/*). When a real Supabase project exists
 * (see /supabase), this file is the only one that needs to change:
 * each function below can be reimplemented with a `supabase.from(...)`
 * call while keeping the same signature, and no page will need to
 * change.
 */

import type {
  Product,
  ProductCategory,
  ProductFilters,
  Post,
  PostCategory,
  PostFilters,
  Review,
  Order,
  MediaItem,
  NewsletterSubscriber,
} from "@/lib/data/types";
import { products as seedProducts } from "@/lib/data/mock/products";
import { posts as seedPosts } from "@/lib/data/mock/posts";
import {
  productCategories as seedProductCategories,
  postCategories as seedPostCategories,
} from "@/lib/data/mock/categories";
import { reviews as seedReviews } from "@/lib/data/mock/reviews";
import { orders as seedOrders } from "@/lib/data/mock/orders";
import { media as seedMedia } from "@/lib/data/mock/media";
import { getCollection, setCollection } from "@/lib/data/localStore";

const LATENCY_MS = 180;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

export async function getProductCategories(): Promise<ProductCategory[]> {
  return delay(getCollection("product_categories", seedProductCategories));
}

export async function createProductCategory(data: Omit<ProductCategory, "id">): Promise<ProductCategory> {
  const list = getCollection("product_categories", seedProductCategories);
  const created: ProductCategory = { ...data, id: nextId("cat") };
  setCollection("product_categories", [...list, created]);
  return delay(created);
}

export async function deleteProductCategory(id: string): Promise<void> {
  const list = getCollection("product_categories", seedProductCategories).filter((c) => c.id !== id);
  setCollection("product_categories", list);
  return delay(undefined);
}

export async function getPostCategories(): Promise<PostCategory[]> {
  return delay(getCollection("post_categories", seedPostCategories));
}

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------

function readProducts(): Product[] {
  return getCollection("products", seedProducts);
}

function applyProductFilters(list: Product[], filters?: ProductFilters): Product[] {
  let result = list.filter((p) => p.active);

  if (filters?.categorySlug) {
    result = result.filter((p) => p.categorySlugs.includes(filters.categorySlug!));
  }
  if (filters?.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }
  if (filters?.featuredOnly) {
    result = result.filter((p) => p.featured);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.categorySlugs.some((c) => c.includes(q)),
    );
  }

  switch (filters?.sort) {
    case "newest":
      result = [...result].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      break;
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    default:
      result = [...result].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return result;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  return delay(applyProductFilters(readProducts(), filters));
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const list = readProducts().filter((p) => p.active && p.featured);
  return delay(list.slice(0, limit));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const found = readProducts().find((p) => p.slug === slug) ?? null;
  return delay(found);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const list = readProducts().filter(
    (p) =>
      p.active &&
      p.id !== product.id &&
      p.categorySlugs.some((c) => product.categorySlugs.includes(c)),
  );
  return delay(list.slice(0, limit));
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt">,
): Promise<Product> {
  const list = readProducts();
  const created: Product = { ...data, id: nextId("prod"), createdAt: new Date().toISOString() };
  setCollection("products", [created, ...list]);
  return delay(created);
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product> {
  const list = readProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  const updated = { ...list[idx], ...patch };
  const next = [...list];
  next[idx] = updated;
  setCollection("products", next);
  return delay(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  const list = readProducts().filter((p) => p.id !== id);
  setCollection("products", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Posts
// --------------------------------------------------------------------------

function readPosts(): Post[] {
  return getCollection("posts", seedPosts);
}

function applyPostFilters(list: Post[], filters?: PostFilters): Post[] {
  let result = list;
  if (filters?.status) {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters?.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q),
    );
  }
  return [...result].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** Public-facing posts (published only). */
export async function getPublishedPosts(filters?: Omit<PostFilters, "status">): Promise<Post[]> {
  return delay(applyPostFilters(readPosts(), { ...filters, status: "published" }));
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const found = readPosts().find((p) => p.slug === slug && p.status === "published") ?? null;
  return delay(found);
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const list = readPosts().filter(
    (p) => p.status === "published" && p.id !== post.id && p.category === post.category,
  );
  const fallback = readPosts().filter(
    (p) => p.status === "published" && p.id !== post.id && !list.includes(p),
  );
  return delay([...list, ...fallback].slice(0, limit));
}

/** Admin: all posts regardless of status. */
export async function getAllPosts(filters?: PostFilters): Promise<Post[]> {
  return delay(applyPostFilters(readPosts(), filters));
}

export async function getPostById(id: string): Promise<Post | null> {
  const found = readPosts().find((p) => p.id === id) ?? null;
  return delay(found);
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
): Promise<Post> {
  const list = readPosts();
  const now = new Date().toISOString();
  const created: Post = { ...data, id: nextId("post"), createdAt: now, updatedAt: now };
  setCollection("posts", [created, ...list]);
  return delay(created);
}

export async function updatePost(id: string, patch: Partial<Post>): Promise<Post> {
  const list = readPosts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Post not found");
  const updated = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  const next = [...list];
  next[idx] = updated;
  setCollection("posts", next);
  return delay(updated);
}

export async function deletePost(id: string): Promise<void> {
  const list = readPosts().filter((p) => p.id !== id);
  setCollection("posts", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Reviews
// --------------------------------------------------------------------------

export async function getReviews(limit?: number): Promise<Review[]> {
  const list = getCollection("reviews", seedReviews);
  return delay(limit ? list.slice(0, limit) : list);
}

// --------------------------------------------------------------------------
// Orders (illustrative only — see lib/data/mock/orders.ts)
// --------------------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  const list = getCollection("orders", seedOrders);
  return delay([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

// --------------------------------------------------------------------------
// Media Library
// --------------------------------------------------------------------------

export async function getMediaLibrary(): Promise<MediaItem[]> {
  const list = getCollection("media", seedMedia);
  return delay([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

/** Reads a File as a data URL and stores it in the media library. Real
 * Supabase Storage uploads (bucket.upload) would replace the body of
 * this function only. */
export async function uploadMedia(file: File, usedIn: MediaItem["usedIn"] = "unassigned"): Promise<MediaItem> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const list = getCollection<MediaItem>("media", seedMedia);
  const created: MediaItem = { id: nextId("media"), url, name: file.name, usedIn, createdAt: new Date().toISOString() };
  setCollection("media", [created, ...list]);
  return delay(created);
}

export async function deleteMedia(id: string): Promise<void> {
  const list = getCollection<MediaItem>("media", seedMedia).filter((m) => m.id !== id);
  setCollection("media", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Newsletter
// --------------------------------------------------------------------------

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
  const list = getCollection<NewsletterSubscriber>("newsletter_subscribers", []);
  const created: NewsletterSubscriber = { id: nextId("news"), email, createdAt: new Date().toISOString() };
  setCollection("newsletter_subscribers", [created, ...list]);
  return delay(created);
}

// --------------------------------------------------------------------------
// Global search
// --------------------------------------------------------------------------

export async function search(query: string): Promise<{ products: Product[]; posts: Post[] }> {
  const q = query.trim().toLowerCase();
  if (!q) return { products: [], posts: [] };
  const productMatches = applyProductFilters(readProducts(), { search: q }).slice(0, 6);
  const postMatches = applyPostFilters(readPosts(), { search: q, status: "published" }).slice(0, 4);
  return delay({ products: productMatches, posts: postMatches });
}
