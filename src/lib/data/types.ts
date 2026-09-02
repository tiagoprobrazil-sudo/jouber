/**
 * Domain types for Atelier Saint Sebastian.
 *
 * These interfaces are written to mirror the planned Supabase schema
 * (see /supabase/migrations) so that swapping the mock repository
 * implementation in `lib/data/repository.ts` for real Supabase queries
 * does not require touching any page or component.
 */

export type ID = string;

export type PostStatus = "draft" | "published" | "scheduled";
export type OrderStatus =
  | "pending"
  | "processing"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export interface ProductCategory {
  id: ID;
  slug: string;
  name: string;
  description?: string;
}

export interface ProductImage {
  id: ID;
  url: string;
  alt: string;
  /** Position in the gallery, 0 = primary/cover image */
  position: number;
}

export interface ProductVariant {
  id: ID;
  name: string;
  /** e.g. "Size", "Finish", "Color" */
  optionLabel: string;
  priceModifier?: number;
  inStock: boolean;
  /** Links this variant to a Printify variant id for automatic fulfillment — see lib/printify. */
  printifyVariantId?: number;
}

export interface Product {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  categorySlugs: string[];
  price: number;
  compareAtPrice?: number;
  currency: "USD";
  images: ProductImage[];
  /** A single .mp4 clip (e.g. a hand-finishing detail or a 360° turn), capped at 20MB — see ProductVideoField. */
  videoUrl?: string;
  variants?: ProductVariant[];
  dimensions?: string;
  material?: string;
  finish?: string;
  weight?: string;
  /**
   * Structured shipping parcel data (distinct from the freeform
   * `weight`/`dimensions` display strings above) used to request live
   * carrier rates from Shippo — see src/lib/shipping. When any of these
   * is missing, checkout falls back to DEFAULT_PARCEL for that line.
   */
  shippingWeightOz?: number;
  shippingLengthIn?: number;
  shippingWidthIn?: number;
  shippingHeightIn?: number;
  sku: string;
  stock: number;
  /** Made-to-order pieces don't ship from existing stock — `leadTime` (e.g. "2-3 weeks") tells the customer how long production takes before dispatch. */
  madeToOrder?: boolean;
  leadTime?: string;
  /**
   * Printify fulfillment linkage. `printifyProductId` identifies the
   * product in the connected Printify shop; `printifyVariantId` is only
   * used when the product has no local `variants` (single-variant item) —
   * when it does, each ProductVariant carries its own printifyVariantId
   * instead. A product with `printifyProductId` set is automatically
   * submitted to Printify for fulfillment when ordered — see lib/printify.
   */
  printifyProductId?: string;
  printifyVariantId?: number;
  active: boolean;
  featured: boolean;
  customizable: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface PostCategory {
  id: ID;
  slug: string;
  name: string;
}

export interface PostImage {
  id: ID;
  url: string;
  alt: string;
  caption?: string;
}

export interface Post {
  id: ID;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  /** Rich HTML produced by the admin's Tiptap editor (bold, italic,
   * headings, links, quotes, inline images). */
  content: string;
  coverImage: PostImage;
  /** A separate image gallery rendered at the end of the article,
   * managed independently of the flowing content above. */
  gallery?: PostImage[];
  category: string;
  status: PostStatus;
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: ID;
  author: string;
  location?: string;
  rating: number;
  text: string;
  productSlug?: string;
  /** Set once an admin has approved/rejected it — see /admin/reviews. Only "approved" reviews are ever shown publicly. */
  status: ReviewStatus;
  /** True when submitted through a purchase-linked review-request link, rather than the open form on the product page. */
  isVerifiedPurchase: boolean;
  email?: string;
  createdAt: string;
}

export interface Customer {
  id: ID;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface OrderItem {
  id: ID;
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: ID;
  customerId?: ID;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  /** Set once this order's Printify-fulfilled items were submitted for printing — see lib/printify. */
  printifyOrderId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface MediaItem {
  id: ID;
  url: string;
  name: string;
  usedIn: "posts" | "products" | "unassigned";
  createdAt: string;
}

export interface Profile {
  id: ID;
  email: string;
  fullName?: string;
  role: "admin" | "customer";
}

export interface ProductFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  search?: string;
}

export interface PostFilters {
  category?: string;
  status?: PostStatus;
  search?: string;
}
