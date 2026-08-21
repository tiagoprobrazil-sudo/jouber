import type { Order } from "@/lib/data/types";

// Illustrative order records for the admin Dashboard/Orders screens only.
// No real checkout is wired up yet (see pages/Checkout.tsx) — these exist
// purely so the admin CMS has something to display while it's demoed.
export const orders: Order[] = [
  {
    id: "ord-1001",
    customerEmail: "marina.costa@example.com",
    status: "fulfilled",
    items: [
      { id: "oi-1", productSlug: "our-lady-of-aparecida-10-inch-pearl-gold-statue", productTitle: "Our Lady of Aparecida — 10-Inch Statue", quantity: 1, unitPrice: 65 },
    ],
    subtotal: 65,
    createdAt: "2026-07-28",
  },
  {
    id: "ord-1002",
    customerEmail: "daniel.reis@example.com",
    status: "processing",
    items: [
      { id: "oi-2", productSlug: "our-lady-of-aparecida-ivory-gold-statue", productTitle: "Our Lady of Aparecida — Ivory & Gold Statue", quantity: 1, unitPrice: 68 },
      { id: "oi-3", productSlug: "nine-day-novena-prayer-candle", productTitle: "Nine-Day Novena Prayer Candle", quantity: 2, unitPrice: 10 },
    ],
    subtotal: 88,
    createdAt: "2026-08-05",
  },
  {
    id: "ord-1003",
    customerEmail: "helena.ferreira@example.com",
    status: "pending",
    items: [
      { id: "oi-4", productSlug: "our-lady-of-aparecida-shrine-box", productTitle: "Our Lady of Aparecida Shrine Box", quantity: 1, unitPrice: 25 },
    ],
    subtotal: 25,
    createdAt: "2026-08-15",
  },
];
