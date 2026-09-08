import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import type { Coupon, CouponDiscountType, Product, ProductCategory } from "@/lib/data/types";
import { getCouponById, createCoupon, updateCoupon, getProducts, getProductCategories } from "@/lib/data/repository";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/layout/PageLoader";
import { cn } from "@/lib/utils/cn";

type CouponForm = Omit<Coupon, "id" | "usageCount" | "createdAt" | "updatedAt">;

const EMPTY: CouponForm = {
  code: "",
  description: "",
  discountType: "percent",
  amount: 0,
  freeShipping: false,
  expiryDate: undefined,
  minimumAmount: undefined,
  maximumAmount: undefined,
  individualUseOnly: false,
  excludeSaleItems: false,
  productIds: [],
  excludedProductIds: [],
  productCategories: [],
  excludedProductCategories: [],
  allowedEmails: [],
  usageLimit: undefined,
  usageLimitPerUser: undefined,
  limitUsageToXItems: undefined,
  active: true,
};

const TABS = [
  { key: "general", label: "General" },
  { key: "restriction", label: "Usage restriction" },
  { key: "limits", label: "Usage limits" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const DISCOUNT_TYPES: { value: CouponDiscountType; label: string }[] = [
  { value: "percent", label: "Percentage discount" },
  { value: "fixed_cart", label: "Fixed cart discount" },
  { value: "fixed_product", label: "Fixed product discount" },
];

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-admin-muted">{label}</label>
      {children}
      {hint && <p className="mt-1.5 font-sans text-xs text-admin-muted">{hint}</p>}
    </div>
  );
}

const inputClass = "w-full border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none";

function TextInput({ value, onChange, type = "text", placeholder }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
}

function Checkbox({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div>
      <label className="flex items-center gap-2.5 font-sans text-sm text-admin-ink">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-olive" />
        {label}
      </label>
      {hint && <p className="mt-1 ml-[26px] font-sans text-xs text-admin-muted">{hint}</p>}
    </div>
  );
}

function PillSelect({
  options,
  selected,
  onToggle,
  empty,
}: {
  options: { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
  empty: string;
}) {
  if (options.length === 0) return <p className="font-sans text-xs text-admin-muted">{empty}</p>;
  return (
    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
      {options.map((o) => {
        const isSelected = selected.includes(o.key);
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(o.key)}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 font-sans text-xs transition-colors",
              isSelected ? "border-charcoal bg-charcoal text-ivory" : "border-admin-border text-admin-ink hover:border-charcoal",
            )}
          >
            {isSelected && <Check size={12} strokeWidth={2} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CouponEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<CouponForm>(EMPTY);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [allowedEmailsText, setAllowedEmailsText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts({}).then(setProducts);
    getProductCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    getCouponById(id).then((c) => {
      if (c) {
        setForm(c);
        setCouponId(c.id);
        setUsageCount(c.usageCount);
        setAllowedEmailsText(c.allowedEmails.join(", "));
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function update<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleInList<K extends "productIds" | "excludedProductIds" | "productCategories" | "excludedProductCategories">(key: K, value: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  }

  async function handleSave() {
    if (!form.code.trim()) {
      setError("A coupon code is required.");
      setTab("general");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CouponForm = {
      ...form,
      allowedEmails: allowedEmailsText
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    };
    try {
      if (isNew || !couponId) {
        const created = await createCoupon(payload);
        setCouponId(created.id);
        navigate(`/admin/coupons/${created.id}`, { replace: true });
      } else {
        await updateCoupon(couponId, payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "A coupon with this code may already exist.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-admin-ink">{isNew ? "New Coupon" : "Edit Coupon"}</h1>
          <p className="mt-1 font-sans text-sm text-admin-muted">Discount rules, modeled on WooCommerce's coupon options.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="h-4 w-4 accent-olive" />
            Active
          </label>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save Coupon"}
          </Button>
        </div>
      </div>

      {error && <p className="mb-6 border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">{error}</p>}

      <div className="flex gap-1 border-b border-admin-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 font-sans text-xs uppercase tracking-wide transition-colors",
              tab === t.key ? "border-b-2 border-olive text-admin-ink" : "text-admin-muted hover:text-admin-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-8">
        {tab === "general" && (
          <>
            <Field label="Coupon code" hint="Case-insensitive — shoppers can type it in any case.">
              <TextInput value={form.code} onChange={(v) => update("code", v.toUpperCase())} placeholder="SUMMER25" />
            </Field>

            <Field label="Description (admin only)">
              <textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Discount type">
                <select
                  value={form.discountType}
                  onChange={(e) => update("discountType", e.target.value as CouponDiscountType)}
                  className={inputClass}
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={form.discountType === "percent" ? "Coupon amount (%)" : "Coupon amount ($)"}>
                <TextInput type="number" value={form.amount} onChange={(v) => update("amount", Number(v))} />
              </Field>
            </div>

            <Checkbox
              label="Allow free shipping"
              checked={form.freeShipping}
              onChange={(v) => update("freeShipping", v)}
              hint="Waives the computed shipping cost at checkout when this coupon is applied."
            />

            <Field label="Coupon expiry date" className="max-w-xs">
              <input
                type="date"
                value={form.expiryDate ?? ""}
                onChange={(e) => update("expiryDate", e.target.value || undefined)}
                className={inputClass}
              />
            </Field>
          </>
        )}

        {tab === "restriction" && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Minimum spend" hint="Leave blank for no minimum.">
                <TextInput
                  type="number"
                  value={form.minimumAmount ?? ""}
                  onChange={(v) => update("minimumAmount", v ? Number(v) : undefined)}
                />
              </Field>
              <Field label="Maximum spend" hint="Leave blank for no maximum.">
                <TextInput
                  type="number"
                  value={form.maximumAmount ?? ""}
                  onChange={(v) => update("maximumAmount", v ? Number(v) : undefined)}
                />
              </Field>
            </div>

            <Checkbox
              label="Individual use only"
              checked={form.individualUseOnly}
              onChange={(v) => update("individualUseOnly", v)}
              hint="Can't be combined with other coupons in the same order."
            />
            <Checkbox
              label="Exclude sale items"
              checked={form.excludeSaleItems}
              onChange={(v) => update("excludeSaleItems", v)}
              hint="Products with a compare-at price set (currently on sale) won't be discounted."
            />

            <div>
              <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
                Products <span className="normal-case text-admin-muted/70">— leave empty to allow all products</span>
              </p>
              <PillSelect
                options={products.map((p) => ({ key: p.id, label: p.title }))}
                selected={form.productIds}
                onToggle={(v) => toggleInList("productIds", v)}
                empty="No products yet."
              />
            </div>

            <div>
              <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">Exclude products</p>
              <PillSelect
                options={products.map((p) => ({ key: p.id, label: p.title }))}
                selected={form.excludedProductIds}
                onToggle={(v) => toggleInList("excludedProductIds", v)}
                empty="No products yet."
              />
            </div>

            <div>
              <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
                Product categories <span className="normal-case text-admin-muted/70">— leave empty to allow all categories</span>
              </p>
              <PillSelect
                options={categories.map((c) => ({ key: c.slug, label: c.name }))}
                selected={form.productCategories}
                onToggle={(v) => toggleInList("productCategories", v)}
                empty="No categories yet."
              />
            </div>

            <div>
              <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">Exclude categories</p>
              <PillSelect
                options={categories.map((c) => ({ key: c.slug, label: c.name }))}
                selected={form.excludedProductCategories}
                onToggle={(v) => toggleInList("excludedProductCategories", v)}
                empty="No categories yet."
              />
            </div>

            <Field
              label="Allowed emails"
              hint='Comma-separated. Supports wildcards, e.g. "*@gmail.com". Leave blank to allow anyone.'
            >
              <textarea
                rows={2}
                value={allowedEmailsText}
                onChange={(e) => setAllowedEmailsText(e.target.value)}
                placeholder="jane@example.com, *@atelier-collectors.com"
                className={inputClass}
              />
            </Field>
          </>
        )}

        {tab === "limits" && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Usage limit per coupon" hint="Total times this coupon can be redeemed, across every customer.">
                <TextInput
                  type="number"
                  value={form.usageLimit ?? ""}
                  onChange={(v) => update("usageLimit", v ? Number(v) : undefined)}
                />
              </Field>
              <Field label="Usage limit per user" hint="How many times a single email address can redeem this coupon.">
                <TextInput
                  type="number"
                  value={form.usageLimitPerUser ?? ""}
                  onChange={(v) => update("usageLimitPerUser", v ? Number(v) : undefined)}
                />
              </Field>
            </div>

            {form.discountType !== "fixed_cart" && (
              <Field
                label="Limit usage to X items"
                className="max-w-xs"
                hint="Caps how many matching line-item units the discount applies to (only applies to percentage/fixed product discounts)."
              >
                <TextInput
                  type="number"
                  value={form.limitUsageToXItems ?? ""}
                  onChange={(v) => update("limitUsageToXItems", v ? Number(v) : undefined)}
                />
              </Field>
            )}

            {!isNew && (
              <p className="font-sans text-xs text-admin-muted">
                Redeemed {form.usageLimit != null ? `${usageCount} of ${form.usageLimit}` : `${usageCount} time(s)`} so far.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
