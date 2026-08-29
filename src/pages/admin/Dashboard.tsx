import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order, Post, Product } from "@/lib/data/types";
import { getOrders, getAllPosts, getProducts } from "@/lib/data/repository";
import { formatDate, formatPrice } from "@/lib/utils/format";

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-admin-border bg-admin-surface p-6">
      <p className="font-sans text-xs uppercase tracking-[0.16em] text-admin-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-admin-ink">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getProducts({}).then(setProducts);
    getAllPosts().then(setPosts);
    getOrders().then(setOrders);
  }, []);

  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;

  return (
    <div>
      <h1 className="font-serif text-3xl text-admin-ink">Dashboard</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">An overview of the atelier's shop and journal.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total Products" value={products.length} />
        <StatTile label="Orders" value={orders.length} />
        <StatTile label="Published Posts" value={publishedPosts} />
        <StatTile label="Draft Posts" value={draftPosts} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="border border-admin-border bg-admin-surface">
          <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
            <h2 className="font-serif text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="font-sans text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-admin-border-soft">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="font-sans text-sm text-admin-ink">{o.customerEmail}</p>
                  <p className="font-sans text-xs text-admin-muted">{formatDate(o.createdAt)} · {o.status}</p>
                </div>
                <span className="font-sans text-sm">{formatPrice(o.subtotal)}</span>
              </li>
            ))}
            {orders.length === 0 && <li className="px-6 py-6 font-sans text-sm text-admin-muted">No orders yet.</li>}
          </ul>
        </div>

        <div className="border border-admin-border bg-admin-surface">
          <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
            <h2 className="font-serif text-lg">Recent Posts</h2>
            <Link to="/admin/posts" className="font-sans text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-admin-border-soft">
            {posts.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-3.5">
                <p className="font-sans text-sm text-admin-ink">{p.title}</p>
                <span className="font-sans text-xs uppercase tracking-wide text-admin-muted">{p.status}</span>
              </li>
            ))}
            {posts.length === 0 && <li className="px-6 py-6 font-sans text-sm text-admin-muted">No posts yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
