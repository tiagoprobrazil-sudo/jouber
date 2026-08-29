import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import type { Product, ProductCategory, ProductVariant } from "@/lib/data/types";
import { getProductById, getProductCategories, createProduct, updateProduct } from "@/lib/data/repository";
import { slugify } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { ProductImagesField } from "@/components/admin/ProductImagesField";
import { PageLoader } from "@/components/layout/PageLoader";

const EMPTY: Omit<Product, "id" | "createdAt"> = {
  slug: "",
  title: "",
  excerpt: "",
  description: "",
  categorySlugs: [],
  price: 0,
  currency: "USD",
  images: [],
  sku: "",
  stock: 0,
  active: true,
  featured: false,
  customizable: false,
};

function TextField({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
      />
    </div>
  );
}

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    getProductCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    getProductById(id).then((p) => {
      if (p) {
        setForm(p);
        setProductId(p.id);
        setSlugTouched(true);
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(slug: string) {
    setForm((f) => ({
      ...f,
      categorySlugs: f.categorySlugs.includes(slug)
        ? f.categorySlugs.filter((c) => c !== slug)
        : [...f.categorySlugs, slug],
    }));
  }

  function addVariant() {
    const variant: ProductVariant = { id: `new-${Date.now()}`, name: "", optionLabel: "Size", inStock: true };
    setForm((f) => ({ ...f, variants: [...(f.variants ?? []), variant] }));
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setForm((f) => ({
      ...f,
      variants: f.variants?.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
  }

  function removeVariant(id: string) {
    setForm((f) => ({ ...f, variants: f.variants?.filter((v) => v.id !== id) }));
  }

  async function handleSave() {
    setSaving(true);
    if (isNew || !productId) {
      const created = await createProduct(form);
      setProductId(created.id);
      navigate(`/admin/products/${created.id}`, { replace: true });
    } else {
      await updateProduct(productId, form);
    }
    setSaving(false);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-charcoal">{isNew ? "New Product" : "Edit Product"}</h1>
        <Button size="sm" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Product"}
        </Button>
      </div>

      <div className="space-y-8">
        <TextField
          label="Title"
          value={form.title}
          onChange={(v) => {
            update("title", v);
            if (!slugTouched) update("slug", slugify(v));
          }}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(v) => {
              setSlugTouched(true);
              update("slug", slugify(v));
            }}
          />
          <TextField label="SKU" value={form.sku} onChange={(v) => update("sku", v)} />
        </div>

        <div>
          <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Excerpt</label>
          <input
            type="text"
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-2 font-sans text-xs uppercase tracking-wide text-warmgray">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.slug)}
                className={`border px-3 py-1.5 font-sans text-xs transition-colors ${
                  form.categorySlugs.includes(c.slug) ? "border-charcoal bg-charcoal text-ivory" : "border-stone-dark text-charcoal hover:border-charcoal"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <TextField label="Price (USD)" type="number" value={form.price} onChange={(v) => update("price", Number(v))} />
          <TextField
            label="Compare-at price"
            type="number"
            value={form.compareAtPrice ?? ""}
            onChange={(v) => update("compareAtPrice", v ? Number(v) : undefined)}
          />
          <TextField label="Stock" type="number" value={form.stock} onChange={(v) => update("stock", Number(v))} />
          <TextField label="Weight" value={form.weight ?? ""} onChange={(v) => update("weight", v)} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TextField label="Dimensions" value={form.dimensions ?? ""} onChange={(v) => update("dimensions", v)} />
          <TextField label="Material" value={form.material ?? ""} onChange={(v) => update("material", v)} />
          <TextField label="Finish" value={form.finish ?? ""} onChange={(v) => update("finish", v)} />
        </div>

        <div>
          <p className="mb-2 font-sans text-xs uppercase tracking-wide text-warmgray">
            Shipping parcel <span className="normal-case text-warmgray/70">— used to quote live carrier rates at checkout</span>
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <TextField
              label="Weight (oz)"
              type="number"
              value={form.shippingWeightOz ?? ""}
              onChange={(v) => update("shippingWeightOz", v ? Number(v) : undefined)}
            />
            <TextField
              label="Length (in)"
              type="number"
              value={form.shippingLengthIn ?? ""}
              onChange={(v) => update("shippingLengthIn", v ? Number(v) : undefined)}
            />
            <TextField
              label="Width (in)"
              type="number"
              value={form.shippingWidthIn ?? ""}
              onChange={(v) => update("shippingWidthIn", v ? Number(v) : undefined)}
            />
            <TextField
              label="Height (in)"
              type="number"
              value={form.shippingHeightIn ?? ""}
              onChange={(v) => update("shippingHeightIn", v ? Number(v) : undefined)}
            />
          </div>
          <p className="mt-2 font-sans text-xs text-warmgray">
            Left blank, checkout uses a generic fallback box so shipping quotes still work — fill this in
            for an accurate rate on this product.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-sans text-xs uppercase tracking-wide text-warmgray">
              Variants <span className="normal-case text-warmgray/70">— e.g. sizes or finishes, each optionally priced differently</span>
            </p>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide text-olive hover:text-olive-dark"
            >
              <Plus size={13} strokeWidth={1.5} />
              Add variant
            </button>
          </div>
          {form.variants?.length ? (
            <div className="space-y-3">
              {form.variants.map((v) => (
                <div key={v.id} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-end gap-3 border border-stone-dark bg-cream p-3">
                  <TextField label="Name" value={v.name} onChange={(val) => updateVariant(v.id, { name: val })} />
                  <TextField label="Option label" value={v.optionLabel} onChange={(val) => updateVariant(v.id, { optionLabel: val })} />
                  <TextField
                    label="Price modifier"
                    type="number"
                    value={v.priceModifier ?? ""}
                    onChange={(val) => updateVariant(v.id, { priceModifier: val ? Number(val) : undefined })}
                  />
                  <label className="flex items-center gap-2 pb-2.5 font-sans text-xs text-charcoal">
                    <input
                      type="checkbox"
                      checked={v.inStock}
                      onChange={(e) => updateVariant(v.id, { inStock: e.target.checked })}
                      className="h-4 w-4 accent-olive"
                    />
                    In stock
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    aria-label={`Remove ${v.name || "variant"}`}
                    className="mb-2.5 text-warmgray hover:text-red-700"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans text-xs text-warmgray">No variants — this product has a single price and no options.</p>
          )}
        </div>

        <ProductImagesField images={form.images} onChange={(images) => update("images", images)} />

        <div className="flex flex-wrap gap-8 border-t border-stone-dark pt-6">
          <label className="flex items-center gap-2.5 font-sans text-sm text-charcoal">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="h-4 w-4 accent-olive" />
            Active
          </label>
          <label className="flex items-center gap-2.5 font-sans text-sm text-charcoal">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 accent-olive" />
            Featured on Home
          </label>
          <label className="flex items-center gap-2.5 font-sans text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.customizable}
              onChange={(e) => update("customizable", e.target.checked)}
              className="h-4 w-4 accent-olive"
            />
            Customizable
          </label>
        </div>
      </div>
    </div>
  );
}
