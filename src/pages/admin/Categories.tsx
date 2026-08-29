import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { ProductCategory, PostCategory } from "@/lib/data/types";
import {
  getProductCategories,
  createProductCategory,
  deleteProductCategory,
  getPostCategories,
  createPostCategory,
  deletePostCategory,
} from "@/lib/data/repository";
import { slugify } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type Tab = "product" | "post";

export default function Categories() {
  const [tab, setTab] = useState<Tab>("product");
  const [productCategories, setProductCategories] = useState<ProductCategory[] | null>(null);
  const [postCategories, setPostCategories] = useState<PostCategory[] | null>(null);
  const [name, setName] = useState("");

  function reload() {
    getProductCategories().then(setProductCategories);
    getPostCategories().then(setPostCategories);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    if (tab === "product") await createProductCategory({ name: name.trim(), slug: slugify(name) });
    else await createPostCategory({ name: name.trim(), slug: slugify(name) });
    setName("");
    reload();
  }

  async function handleDelete(tab: Tab, id: string) {
    if (!window.confirm("Delete this category? Existing items keep their current tag.")) return;
    if (tab === "product") await deleteProductCategory(id);
    else await deletePostCategory(id);
    reload();
  }

  const list = tab === "product" ? productCategories : postCategories;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-admin-ink">Categories</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">Used across shop filters, navigation and the Journal.</p>

      <div className="mt-6 flex gap-1 border-b border-admin-border">
        {(["product", "post"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 font-sans text-xs uppercase tracking-wide transition-colors",
              tab === t ? "border-b-2 border-olive text-admin-ink" : "text-admin-muted hover:text-admin-ink",
            )}
          >
            {t === "product" ? "Shop categories" : "Journal categories"}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tab === "product" ? "New shop category" : "New Journal category"}
          className="flex-1 border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
        />
        <Button size="sm" icon={<Plus size={14} strokeWidth={1.5} />} onClick={handleCreate}>
          Add
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-admin-border-soft border border-admin-border bg-admin-surface">
        {list?.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="font-sans text-sm text-admin-ink">{c.name}</p>
              <p className="font-mono text-xs text-admin-muted">/{c.slug}</p>
            </div>
            <button type="button" onClick={() => handleDelete(tab, c.id)} aria-label={`Delete ${c.name}`} className="text-admin-muted hover:text-red-700">
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </li>
        ))}
        {list?.length === 0 && <li className="px-5 py-6 font-sans text-sm text-admin-muted">No categories yet.</li>}
      </ul>
    </div>
  );
}
