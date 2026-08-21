import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { ProductCategory } from "@/lib/data/types";
import { getProductCategories, createProductCategory, deleteProductCategory } from "@/lib/data/repository";
import { slugify } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export default function Categories() {
  const [categories, setCategories] = useState<ProductCategory[] | null>(null);
  const [name, setName] = useState("");

  function reload() {
    getProductCategories().then(setCategories);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    await createProductCategory({ name: name.trim(), slug: slugify(name) });
    setName("");
    reload();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this category? Products keep their existing tags.")) return;
    await deleteProductCategory(id);
    reload();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-charcoal">Categories</h1>
      <p className="mt-1 font-sans text-sm text-warmgray">Shop categories used across product filters and navigation.</p>

      <div className="mt-8 flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
        />
        <Button size="sm" icon={<Plus size={14} strokeWidth={1.5} />} onClick={handleCreate}>
          Add
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-stone border border-stone-dark bg-cream">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="font-sans text-sm text-charcoal">{c.name}</p>
              <p className="font-mono text-xs text-warmgray">/{c.slug}</p>
            </div>
            <button type="button" onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.name}`} className="text-warmgray hover:text-red-700">
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
