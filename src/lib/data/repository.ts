/**
 * Data access layer for the whole app.
 *
 * Every page and admin screen talks to the functions in this file only —
 * never to the mock arrays, localStorage or Supabase directly. Each
 * function below branches on `isSupabaseConfigured`: with a real Supabase
 * project connected (VITE_SUPABASE_URL/ANON_KEY), it reads/writes the real
 * tables from supabase/migrations; otherwise it falls back to a
 * localStorage-backed copy of the bundled mock data (see lib/data/mock/*)
 * so `npm run dev` keeps working with zero setup.
 */

import type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductImage,
  ProductVariant,
  Post,
  PostCategory,
  PostFilters,
  PostImage,
  Review,
  Order,
  OrderItem,
  MediaItem,
  NewsletterSubscriber,
} from "@/lib/data/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
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

function db() {
  // Callers only reach here after checking isSupabaseConfigured.
  return supabase!;
}

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

function mapProductCategoryRow(row: { id: string; slug: string; name: string; description: string | null }): ProductCategory {
  return { id: row.id, slug: row.slug, name: row.name, description: row.description ?? undefined };
}

function mapPostCategoryRow(row: { id: string; slug: string; name: string }): PostCategory {
  return { id: row.id, slug: row.slug, name: row.name };
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("product_categories").select("*").order("name");
    if (error) throw error;
    return data.map(mapProductCategoryRow);
  }
  return delay(getCollection("product_categories", seedProductCategories));
}

export async function createProductCategory(data: Omit<ProductCategory, "id">): Promise<ProductCategory> {
  if (isSupabaseConfigured) {
    const { data: row, error } = await db()
      .from("product_categories")
      .insert({ slug: data.slug, name: data.name, description: data.description ?? null })
      .select()
      .single();
    if (error) throw error;
    return mapProductCategoryRow(row);
  }
  const list = getCollection("product_categories", seedProductCategories);
  const created: ProductCategory = { ...data, id: nextId("cat") };
  setCollection("product_categories", [...list, created]);
  return delay(created);
}

export async function deleteProductCategory(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await db().from("product_categories").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const list = getCollection("product_categories", seedProductCategories).filter((c) => c.id !== id);
  setCollection("product_categories", list);
  return delay(undefined);
}

export async function getPostCategories(): Promise<PostCategory[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("post_categories").select("*").order("name");
    if (error) throw error;
    return data.map(mapPostCategoryRow);
  }
  return delay(getCollection("post_categories", seedPostCategories));
}

export async function createPostCategory(data: Omit<PostCategory, "id">): Promise<PostCategory> {
  if (isSupabaseConfigured) {
    const { data: row, error } = await db()
      .from("post_categories")
      .insert({ slug: data.slug, name: data.name })
      .select()
      .single();
    if (error) throw error;
    return mapPostCategoryRow(row);
  }
  const list = getCollection("post_categories", seedPostCategories);
  const created: PostCategory = { ...data, id: nextId("pcat") };
  setCollection("post_categories", [...list, created]);
  return delay(created);
}

export async function deletePostCategory(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await db().from("post_categories").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const list = getCollection("post_categories", seedPostCategories).filter((c) => c.id !== id);
  setCollection("post_categories", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------

const PRODUCT_SELECT = "*, product_images(*), product_variants(*), product_category_map(category_slug)";

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  dimensions: string | null;
  material: string | null;
  finish: string | null;
  weight: string | null;
  shipping_weight_oz: number | null;
  shipping_length_in: number | null;
  shipping_width_in: number | null;
  shipping_height_in: number | null;
  sku: string | null;
  stock: number;
  active: boolean;
  featured: boolean;
  customizable: boolean;
  created_at: string;
  product_images: { id: string; url: string; alt: string; position: number }[];
  product_variants: { id: string; name: string; option_label: string; price_modifier: number | null; in_stock: boolean }[];
  product_category_map: { category_slug: string }[];
}

function mapProductRow(row: ProductRow, rating?: { rating: number; count: number }): Product {
  const images: ProductImage[] = [...(row.product_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ id: i.id, url: i.url, alt: i.alt, position: i.position }));
  const variants: ProductVariant[] | undefined = row.product_variants?.length
    ? row.product_variants.map((v) => ({
        id: v.id,
        name: v.name,
        optionLabel: v.option_label,
        priceModifier: v.price_modifier != null ? Number(v.price_modifier) : undefined,
        inStock: v.in_stock,
      }))
    : undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    description: row.description,
    categorySlugs: (row.product_category_map ?? []).map((c) => c.category_slug),
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    currency: "USD",
    images,
    variants,
    dimensions: row.dimensions ?? undefined,
    material: row.material ?? undefined,
    finish: row.finish ?? undefined,
    weight: row.weight ?? undefined,
    shippingWeightOz: row.shipping_weight_oz != null ? Number(row.shipping_weight_oz) : undefined,
    shippingLengthIn: row.shipping_length_in != null ? Number(row.shipping_length_in) : undefined,
    shippingWidthIn: row.shipping_width_in != null ? Number(row.shipping_width_in) : undefined,
    shippingHeightIn: row.shipping_height_in != null ? Number(row.shipping_height_in) : undefined,
    sku: row.sku ?? "",
    stock: row.stock,
    active: row.active,
    featured: row.featured,
    customizable: row.customizable,
    rating: rating?.rating,
    reviewCount: rating?.count,
    createdAt: row.created_at,
  };
}

/** Reviews aren't denormalized onto products, so ratings are computed from the `reviews` table for whichever product ids were just fetched. */
async function computeRatings(productIds: string[]): Promise<Map<string, { rating: number; count: number }>> {
  const result = new Map<string, { rating: number; count: number }>();
  if (productIds.length === 0) return result;
  const { data, error } = await db().from("reviews").select("product_id, rating").in("product_id", productIds);
  if (error || !data) return result;
  const byProduct = new Map<string, number[]>();
  for (const r of data as { product_id: string | null; rating: number }[]) {
    if (!r.product_id) continue;
    const arr = byProduct.get(r.product_id) ?? [];
    arr.push(r.rating);
    byProduct.set(r.product_id, arr);
  }
  for (const [id, ratings] of byProduct) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    result.set(id, { rating: Math.round(avg * 10) / 10, count: ratings.length });
  }
  return result;
}

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
  if (isSupabaseConfigured) {
    const useInnerCategory = Boolean(filters?.categorySlug);
    const select = useInnerCategory
      ? "*, product_images(*), product_variants(*), product_category_map!inner(category_slug)"
      : PRODUCT_SELECT;
    let query = db().from("products").select(select).eq("active", true);

    if (useInnerCategory) query = query.eq("product_category_map.category_slug", filters!.categorySlug);
    if (filters?.minPrice != null) query = query.gte("price", filters.minPrice);
    if (filters?.maxPrice != null) query = query.lte("price", filters.maxPrice);
    if (filters?.inStockOnly) query = query.gt("stock", 0);
    if (filters?.featuredOnly) query = query.eq("featured", true);
    if (filters?.search) {
      const q = filters.search.replace(/[%_]/g, "");
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    switch (filters?.sort) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = data as unknown as ProductRow[];
    const ratings = await computeRatings(rows.map((r) => r.id));
    return rows.map((r) => mapProductRow(r, ratings.get(r.id)));
  }
  return delay(applyProductFilters(readProducts(), filters));
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  if (isSupabaseConfigured) {
    return getProducts({ featuredOnly: true, sort: "newest" }).then((list) => list.slice(0, limit));
  }
  const list = readProducts().filter((p) => p.active && p.featured);
  return delay(list.slice(0, limit));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as ProductRow;
    const ratings = await computeRatings([row.id]);
    return mapProductRow(row, ratings.get(row.id));
  }
  const found = readProducts().find((p) => p.slug === slug) ?? null;
  return delay(found);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const results = await Promise.all(product.categorySlugs.map((slug) => getProducts({ categorySlug: slug })));
    const seen = new Map<string, Product>();
    for (const list of results) {
      for (const p of list) {
        if (p.id !== product.id && !seen.has(p.id)) seen.set(p.id, p);
      }
    }
    return Array.from(seen.values()).slice(0, limit);
  }
  const list = readProducts().filter(
    (p) =>
      p.active &&
      p.id !== product.id &&
      p.categorySlugs.some((c) => product.categorySlugs.includes(c)),
  );
  return delay(list.slice(0, limit));
}

async function syncProductChildren(productId: string, data: Omit<Product, "id" | "createdAt">) {
  const client = db();
  await client.from("product_category_map").delete().eq("product_id", productId);
  if (data.categorySlugs.length) {
    await client
      .from("product_category_map")
      .insert(data.categorySlugs.map((slug) => ({ product_id: productId, category_slug: slug })));
  }

  await client.from("product_images").delete().eq("product_id", productId);
  if (data.images.length) {
    await client.from("product_images").insert(
      data.images.map((img) => ({ product_id: productId, url: img.url, alt: img.alt, position: img.position })),
    );
  }

  await client.from("product_variants").delete().eq("product_id", productId);
  if (data.variants?.length) {
    await client.from("product_variants").insert(
      data.variants.map((v) => ({
        product_id: productId,
        name: v.name,
        option_label: v.optionLabel,
        price_modifier: v.priceModifier ?? null,
        in_stock: v.inStock,
      })),
    );
  }
}

function productColumns(data: Partial<Omit<Product, "id" | "createdAt">>) {
  return {
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.compareAtPrice !== undefined && { compare_at_price: data.compareAtPrice ?? null }),
    ...(data.dimensions !== undefined && { dimensions: data.dimensions ?? null }),
    ...(data.material !== undefined && { material: data.material ?? null }),
    ...(data.finish !== undefined && { finish: data.finish ?? null }),
    ...(data.weight !== undefined && { weight: data.weight ?? null }),
    ...(data.shippingWeightOz !== undefined && { shipping_weight_oz: data.shippingWeightOz ?? null }),
    ...(data.shippingLengthIn !== undefined && { shipping_length_in: data.shippingLengthIn ?? null }),
    ...(data.shippingWidthIn !== undefined && { shipping_width_in: data.shippingWidthIn ?? null }),
    ...(data.shippingHeightIn !== undefined && { shipping_height_in: data.shippingHeightIn ?? null }),
    ...(data.sku !== undefined && { sku: data.sku || null }),
    ...(data.stock !== undefined && { stock: data.stock }),
    ...(data.active !== undefined && { active: data.active }),
    ...(data.featured !== undefined && { featured: data.featured }),
    ...(data.customizable !== undefined && { customizable: data.customizable }),
  };
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data: row, error } = await db().from("products").insert(productColumns(data)).select().single();
    if (error) throw error;
    await syncProductChildren(row.id, data);
    const created = await getProductBySlug(row.slug);
    if (!created) throw new Error("Product created but could not be reloaded");
    return created;
  }
  const list = readProducts();
  const created: Product = { ...data, id: nextId("prod"), createdAt: new Date().toISOString() };
  setCollection("products", [created, ...list]);
  return delay(created);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured) {
    const columns = productColumns(patch);
    if (Object.keys(columns).length) {
      const { error } = await db().from("products").update(columns).eq("id", id);
      if (error) throw error;
    }
    if (patch.categorySlugs || patch.images || patch.variants) {
      const { data: current, error } = await db().from("products").select(PRODUCT_SELECT).eq("id", id).single();
      if (error) throw error;
      const currentProduct = mapProductRow(current as unknown as ProductRow);
      await syncProductChildren(id, { ...currentProduct, ...patch } as Omit<Product, "id" | "createdAt">);
    }
    const { data: row, error } = await db().from("products").select("slug").eq("id", id).single();
    if (error) throw error;
    const updated = await getProductBySlug(row.slug);
    if (!updated) throw new Error("Product not found after update");
    return updated;
  }
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
  if (isSupabaseConfigured) {
    const { error } = await db().from("products").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const list = readProducts().filter((p) => p.id !== id);
  setCollection("products", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Posts
// --------------------------------------------------------------------------

interface PostRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  gallery: PostImage[] | null;
  category: string | null;
  status: Post["status"];
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

function mapPostRow(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: { id: `${row.id}-cover`, url: row.cover_image_url ?? "", alt: row.cover_image_alt ?? "" },
    gallery: row.gallery?.length ? row.gallery : undefined,
    category: row.category ?? "",
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function postColumns(data: Partial<Omit<Post, "id" | "createdAt" | "updatedAt">>) {
  return {
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.subtitle !== undefined && { subtitle: data.subtitle ?? null }),
    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.coverImage !== undefined && {
      cover_image_url: data.coverImage.url || null,
      cover_image_alt: data.coverImage.alt || null,
    }),
    ...(data.gallery !== undefined && { gallery: data.gallery ?? [] }),
    ...(data.category !== undefined && { category: data.category || null }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.publishedAt !== undefined && { published_at: data.publishedAt ?? null }),
    ...(data.scheduledFor !== undefined && { scheduled_for: data.scheduledFor ?? null }),
  };
}

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

async function queryPosts(filters?: PostFilters): Promise<Post[]> {
  let query = db().from("posts").select("*");
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.search) {
    const q = filters.search.replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }
  query = query.order("updated_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as PostRow[]).map(mapPostRow);
}

/** Public-facing posts (published only). */
export async function getPublishedPosts(filters?: Omit<PostFilters, "status">): Promise<Post[]> {
  if (isSupabaseConfigured) return queryPosts({ ...filters, status: "published" });
  return delay(applyPostFilters(readPosts(), { ...filters, status: "published" }));
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    if (error) throw error;
    return data ? mapPostRow(data as unknown as PostRow) : null;
  }
  const found = readPosts().find((p) => p.slug === slug && p.status === "published") ?? null;
  return delay(found);
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  if (isSupabaseConfigured) {
    const sameCategory = await queryPosts({ category: post.category, status: "published" });
    const filtered = sameCategory.filter((p) => p.id !== post.id);
    if (filtered.length >= limit) return filtered.slice(0, limit);
    const rest = await queryPosts({ status: "published" });
    const fallback = rest.filter((p) => p.id !== post.id && !filtered.some((f) => f.id === p.id));
    return [...filtered, ...fallback].slice(0, limit);
  }
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
  if (isSupabaseConfigured) return queryPosts(filters);
  return delay(applyPostFilters(readPosts(), filters));
}

export async function getPostById(id: string): Promise<Post | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("posts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapPostRow(data as unknown as PostRow) : null;
  }
  const found = readPosts().find((p) => p.id === id) ?? null;
  return delay(found);
}

export async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post> {
  if (isSupabaseConfigured) {
    const { data: row, error } = await db().from("posts").insert(postColumns(data)).select().single();
    if (error) throw error;
    return mapPostRow(row as unknown as PostRow);
  }
  const list = readPosts();
  const now = new Date().toISOString();
  const created: Post = { ...data, id: nextId("post"), createdAt: now, updatedAt: now };
  setCollection("posts", [created, ...list]);
  return delay(created);
}

export async function updatePost(id: string, patch: Partial<Post>): Promise<Post> {
  if (isSupabaseConfigured) {
    const { data: row, error } = await db().from("posts").update(postColumns(patch)).eq("id", id).select().single();
    if (error) throw error;
    return mapPostRow(row as unknown as PostRow);
  }
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
  if (isSupabaseConfigured) {
    const { error } = await db().from("posts").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const list = readPosts().filter((p) => p.id !== id);
  setCollection("posts", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Reviews
// --------------------------------------------------------------------------

export async function getReviews(limit?: number): Promise<Review[]> {
  if (isSupabaseConfigured) {
    let query = db().from("reviews").select("*").order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data as { id: string; product_id: string | null; author: string; location: string | null; rating: number; body: string; created_at: string }[]).map(
      (r) => ({
        id: r.id,
        author: r.author,
        location: r.location ?? undefined,
        rating: r.rating,
        text: r.body,
        productSlug: r.product_id ?? undefined,
        createdAt: r.created_at,
      }),
    );
  }
  const list = getCollection("reviews", seedReviews);
  return delay(limit ? list.slice(0, limit) : list);
}

// --------------------------------------------------------------------------
// Orders
// --------------------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await db()
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    interface OrderRow {
      id: string;
      customer_id: string | null;
      customer_email: string;
      status: Order["status"];
      subtotal: number;
      created_at: string;
      order_items: { id: string; product_id: string | null; product_title: string; variant: string | null; quantity: number; unit_price: number }[];
    }
    return (data as unknown as OrderRow[]).map((row) => ({
      id: row.id,
      customerId: row.customer_id ?? undefined,
      customerEmail: row.customer_email,
      status: row.status,
      items: row.order_items.map(
        (item): OrderItem => ({
          id: item.id,
          productSlug: item.product_id ?? "",
          productTitle: item.product_title,
          variant: item.variant ?? undefined,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
        }),
      ),
      subtotal: Number(row.subtotal),
      createdAt: row.created_at,
    }));
  }
  const list = getCollection("orders", seedOrders);
  return delay([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

// --------------------------------------------------------------------------
// Media Library
// --------------------------------------------------------------------------

function mapMediaRow(row: { id: string; url: string; name: string; used_in: MediaItem["usedIn"]; created_at: string }): MediaItem {
  return { id: row.id, url: row.url, name: row.name, usedIn: row.used_in, createdAt: row.created_at };
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await db().from("media").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(mapMediaRow);
  }
  const list = getCollection("media", seedMedia);
  return delay([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

/** Uploads to the `media` Storage bucket and records it in the `media` table (real Supabase), or reads the File into a data URL for the local mock. */
export async function uploadMedia(file: File, usedIn: MediaItem["usedIn"] = "unassigned"): Promise<MediaItem> {
  if (isSupabaseConfigured) {
    const client = db();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
    const { error: uploadError } = await client.storage.from("media").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: publicUrl } = client.storage.from("media").getPublicUrl(path);
    const { data: row, error } = await client
      .from("media")
      .insert({ url: publicUrl.publicUrl, name: file.name, used_in: usedIn })
      .select()
      .single();
    if (error) throw error;
    return mapMediaRow(row);
  }
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
  if (isSupabaseConfigured) {
    const client = db();
    const { data: row } = await client.from("media").select("url").eq("id", id).maybeSingle();
    const marker = "/object/public/media/";
    const path = row?.url?.includes(marker) ? row.url.split(marker)[1] : null;
    if (path) await client.storage.from("media").remove([path]);
    const { error } = await client.from("media").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const list = getCollection<MediaItem>("media", seedMedia).filter((m) => m.id !== id);
  setCollection("media", list);
  return delay(undefined);
}

// --------------------------------------------------------------------------
// Newsletter
// --------------------------------------------------------------------------

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
  if (isSupabaseConfigured) {
    const client = db();
    const { data: row, error } = await client.from("newsletter_subscribers").insert({ email }).select().single();
    if (!error) return { id: row.id, email: row.email, createdAt: row.created_at };
    // Unique violation (already subscribed) — treat as success and return the existing row.
    if (error.code === "23505") {
      const { data: existing, error: fetchError } = await client
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email)
        .single();
      if (fetchError) throw fetchError;
      return { id: existing.id, email: existing.email, createdAt: existing.created_at };
    }
    throw error;
  }
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
  if (isSupabaseConfigured) {
    const [products, posts] = await Promise.all([
      getProducts({ search: q }).then((list) => list.slice(0, 6)),
      queryPosts({ search: q, status: "published" }).then((list) => list.slice(0, 4)),
    ]);
    return { products, posts };
  }
  const productMatches = applyProductFilters(readProducts(), { search: q }).slice(0, 6);
  const postMatches = applyPostFilters(readPosts(), { search: q, status: "published" }).slice(0, 4);
  return delay({ products: productMatches, posts: postMatches });
}
