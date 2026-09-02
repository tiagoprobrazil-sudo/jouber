import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Truck, RotateCcw, Sparkles, ShieldCheck } from "lucide-react";
import type { Product, ProductVariant, Review } from "@/lib/data/types";
import { getProductBySlug, getRelatedProducts, getProductReviews } from "@/lib/data/repository";
import { submitReview } from "@/lib/reviews";
import { useCart } from "@/context/CartContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { PageLoader } from "@/components/layout/PageLoader";
import { Gallery } from "@/components/product/Gallery";
import { VariantPicker } from "@/components/product/VariantPicker";
import { ReviewForm } from "@/components/product/ReviewForm";
import { Price } from "@/components/ui/Price";
import { RatingStars } from "@/components/ui/RatingStars";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils/format";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[] | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { addItem, openDrawer } = useCart();

  useEffect(() => {
    if (!slug) return;
    setProduct(undefined);
    setQuantity(1);
    setVariant(null);
    setReviews(null);
    setShowReviewForm(false);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p?.variants?.length) setVariant(p.variants[0]);
    });
  }, [slug]);

  useEffect(() => {
    if (product) getRelatedProducts(product, 4).then(setRelated);
    if (product) getProductReviews(product.id, product.slug).then(setReviews);
  }, [product]);

  if (product === undefined) return <PageLoader />;
  if (product === null) return <Navigate to="/shop" replace />;

  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
        productSlug: product.slug,
        title: product.title,
        image: product.images[0]?.url ?? "",
        price: product.price,
        variant: variant?.name,
        quantity,
        shippingWeightOz: product.shippingWeightOz,
        shippingLengthIn: product.shippingLengthIn,
        shippingWidthIn: product.shippingWidthIn,
        shippingHeightIn: product.shippingHeightIn,
        printifyProductId: product.printifyProductId,
        printifyVariantId: variant?.printifyVariantId ?? product.printifyVariantId,
      },
      { openDrawer: true },
    );
    openDrawer();
  }

  return (
    <>
      <SeoHead title={product.title} description={product.excerpt} path={`/product/${product.slug}`} type="product" />

      <div className="container-editorial pt-28 pb-10 sm:pt-36">
        <nav aria-label="Breadcrumb" className="font-sans text-xs text-warmgray">
          <Link to="/shop" className="hover:text-charcoal">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal">{product.title}</span>
        </nav>
      </div>

      <div className="container-editorial editorial-grid gap-y-12 pb-20 lg:pb-28">
        <Reveal className="col-span-4 sm:col-span-8 lg:col-span-7">
          <Gallery images={product.images} videoUrl={product.videoUrl} />
        </Reveal>

        <Reveal delay={100} className="col-span-4 sm:col-span-6 sm:col-start-2 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-28 lg:self-start">
          <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">
            {product.categorySlugs[0]?.replace(/-/g, " ")}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-charcoal sm:text-4xl">{product.title}</h1>

          {product.rating && (
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={product.rating} />
              <span className="font-sans text-xs text-warmgray">({product.reviewCount} reviews)</span>
            </div>
          )}

          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="mt-5" />

          <p className="mt-6 font-sans text-[15px] leading-relaxed text-warmgray-dark">{product.description}</p>

          {product.customizable && (
            <p className="mt-5 inline-flex items-center gap-2 border border-gold-soft bg-gold-soft/10 px-3 py-2 font-sans text-xs text-olive-dark">
              <Sparkles size={13} strokeWidth={1.5} />
              Customization available — mention your request in the order notes.
            </p>
          )}

          <dl className="mt-7 grid grid-cols-2 gap-y-2.5 border-y border-stone-dark py-6 font-sans text-sm">
            {product.dimensions && (
              <>
                <dt className="text-warmgray">Dimensions</dt>
                <dd className="text-charcoal">{product.dimensions}</dd>
              </>
            )}
            {product.material && (
              <>
                <dt className="text-warmgray">Material</dt>
                <dd className="text-charcoal">{product.material}</dd>
              </>
            )}
            {product.finish && (
              <>
                <dt className="text-warmgray">Finish</dt>
                <dd className="text-charcoal">{product.finish}</dd>
              </>
            )}
            <dt className="text-warmgray">Availability</dt>
            <dd className={product.madeToOrder || product.stock > 0 ? "text-olive" : "text-warmgray"}>
              {product.madeToOrder
                ? `Made to order${product.leadTime ? ` — ${product.leadTime}` : ""}`
                : product.stock > 0
                  ? "In stock, ships in 3–5 days"
                  : "Out of stock"}
            </dd>
          </dl>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-7">
              <VariantPicker variants={product.variants} selected={variant} onSelect={setVariant} />
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <Button onClick={handleAddToCart} className="flex-1">
              Add to Cart
            </Button>
          </div>

          <p className="mt-6 font-sans text-xs leading-relaxed text-warmgray">
            Handmade and individually finished. Subtle variations make every piece unique.
          </p>

          <div className="mt-8 space-y-4 border-t border-stone-dark pt-6 font-sans text-sm text-warmgray-dark">
            <p className="flex items-start gap-3">
              <Truck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warmgray" />
              {product.madeToOrder
                ? `Ships worldwide. Made to order — please allow ${product.leadTime || "extra time"} before dispatch.`
                : "Ships worldwide. Production time 3–7 business days before dispatch."}
            </p>
            <p className="flex items-start gap-3">
              <RotateCcw size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warmgray" />
              Returns accepted within 14 days for unused, unopened pieces.
            </p>
            <p className="flex items-start gap-3">
              <Sparkles size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warmgray" />
              Dust gently with a dry, soft cloth. Keep away from direct, prolonged sunlight.
            </p>
          </div>
        </Reveal>
      </div>

      <section className="border-t border-stone-dark py-16">
        <div className="container-editorial max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoal">Reviews</h2>
            {!showReviewForm && (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="font-sans text-xs uppercase tracking-wide text-olive underline-offset-2 hover:underline"
              >
                Write a review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mt-6 border border-stone-dark bg-ivory-dim p-5">
              <ReviewForm
                showEmail
                onSubmit={(values) => submitReview({ ...values, productSlug: product.slug })}
              />
            </div>
          )}

          <div className="mt-8 space-y-6">
            {reviews === null ? (
              <p className="font-sans text-sm text-warmgray">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="font-sans text-sm text-warmgray">No reviews yet — be the first to share yours.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-stone pb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={r.rating} />
                    <span className="font-serif text-sm text-charcoal">{r.author}</span>
                    {r.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 font-sans text-[11px] uppercase tracking-wide text-olive">
                        <ShieldCheck size={12} strokeWidth={1.5} />
                        Verified purchase
                      </span>
                    )}
                    <span className="font-sans text-xs text-warmgray">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-warmgray-dark">{r.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {related && related.length > 0 && (
        <section className="border-t border-stone-dark bg-ivory-dim py-20">
          <div className="container-editorial">
            <Reveal>
              <h2 className="mb-10 font-serif text-2xl text-charcoal sm:text-3xl">You May Also Like</h2>
            </Reveal>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
