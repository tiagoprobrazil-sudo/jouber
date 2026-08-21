import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Search as SearchIcon } from "lucide-react";
import { search as searchRepo } from "@/lib/data/repository";
import type { Product, Post } from "@/lib/data/types";
import { Price } from "@/components/ui/Price";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: Product[]; posts: Post[] }>({ products: [], posts: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);
  useDialogFocus(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setResults({ products: [], posts: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], posts: [] });
      return;
    }
    let active = true;
    searchRepo(query).then((r) => {
      if (active) setResults(r);
    });
    return () => {
      active = false;
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search the atelier"
      className="fixed inset-0 z-[100] bg-ivory animate-fade-in"
    >
      <div className="container-editorial flex h-full flex-col">
        <div className="flex items-center gap-4 border-b border-stone-dark py-6">
          <SearchIcon size={20} strokeWidth={1.5} className="shrink-0 text-warmgray" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search works, saints, journal…"
            aria-label="Search"
            className="w-full bg-transparent font-serif text-2xl sm:text-3xl placeholder:text-warmgray focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 p-2 text-charcoal transition-transform hover:rotate-90"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-10">
          {!query.trim() && (
            <p className="font-sans text-sm text-warmgray">
              Try “Our Lady”, “statue”, “Saint George”, or a journal topic.
            </p>
          )}

          {query.trim() && results.products.length === 0 && results.posts.length === 0 && (
            <p className="font-sans text-sm text-warmgray">No results for “{query}”.</p>
          )}

          {results.products.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Works</h2>
              <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} onClick={onClose} className="group block">
                      <div className="aspect-[4/5] overflow-hidden bg-stone">
                        <img
                          src={p.images[0]?.url}
                          alt={p.images[0]?.alt ?? p.title}
                          loading="lazy"
                          sizes="(max-width: 640px) 46vw, 24vw"
                          className="h-full w-full object-cover transition-transform duration-[var(--motion-image)] ease-[var(--ease-editorial)] group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none"
                        />
                      </div>
                      <p className="mt-2 font-serif text-sm">{p.title}</p>
                      <Price price={p.price} compareAtPrice={p.compareAtPrice} className="mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.posts.length > 0 && (
            <div>
              <h2 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Journal</h2>
              <ul className="space-y-4">
                {results.posts.map((p) => (
                  <li key={p.id}>
                    <Link to={`/journal/${p.slug}`} onClick={onClose} className="group flex items-baseline gap-3">
                      <span className="font-serif text-lg link-underline">{p.title}</span>
                      <span className="text-xs uppercase tracking-wide text-warmgray">{p.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
