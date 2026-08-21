import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import type { Post, PostCategory, PostStatus } from "@/lib/data/types";
import { getPostById, createPost, updatePost, getPostCategories } from "@/lib/data/repository";
import { slugify } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImagePickerField } from "@/components/admin/ImagePickerField";
import { RichContent } from "@/components/journal/RichContent";
import { PageLoader } from "@/components/layout/PageLoader";

const EMPTY: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  title: "",
  subtitle: "",
  excerpt: "",
  content: "<p></p>",
  coverImage: { id: "new-cover", url: "", alt: "" },
  category: "atelier",
  status: "draft",
};

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    getPostCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew) return;
    getPostById(id!).then((post) => {
      if (post) {
        setForm(post);
        setPostId(post.id);
        setSlugTouched(true);
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(status: PostStatus) {
    setSaving(true);
    const payload = {
      ...form,
      status,
      publishedAt: status === "published" ? (form.publishedAt ?? new Date().toISOString()) : form.publishedAt,
    };
    if (isNew || !postId) {
      const created = await createPost(payload);
      setPostId(created.id);
      navigate(`/admin/posts/${created.id}`, { replace: true });
    } else {
      await updatePost(postId, payload);
    }
    setSaving(false);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-charcoal">{isNew ? "New Post" : "Edit Post"}</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={preview ? <EyeOff size={14} /> : <Eye size={14} />} onClick={() => setPreview((p) => !p)}>
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button variant="secondary" size="sm" disabled={saving} onClick={() => handleSave("draft")}>
            Save Draft
          </Button>
          <Button size="sm" disabled={saving} onClick={() => handleSave(form.status === "published" ? "draft" : "published")}>
            {form.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {preview ? (
        <article className="border border-stone-dark bg-cream p-8">
          <p className="font-sans text-xs uppercase tracking-wide text-warmgray">{form.category}</p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">{form.title || "Untitled post"}</h2>
          {form.subtitle && <p className="mt-2 font-sans text-warmgray-dark">{form.subtitle}</p>}
          {form.coverImage.url && (
            <div className="my-6 aspect-[16/9] overflow-hidden">
              <img src={form.coverImage.url} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <RichContent html={form.content} />
        </article>
      ) : (
        <div className="space-y-8">
          <div>
            <label htmlFor="post-title" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(e) => {
                update("title", e.target.value);
                if (!slugTouched) update("slug", slugify(e.target.value));
              }}
              className="w-full border border-stone-dark bg-cream px-4 py-3 font-serif text-xl focus:border-olive focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="post-slug" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                Slug
              </label>
              <input
                id="post-slug"
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", slugify(e.target.value));
                }}
                className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-category" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                Category
              </label>
              <select
                id="post-category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="post-subtitle" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
              Subtitle
            </label>
            <input
              id="post-subtitle"
              type="text"
              value={form.subtitle ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="post-excerpt" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
              Excerpt
            </label>
            <textarea
              id="post-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              className="w-full border border-stone-dark bg-cream px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
            />
          </div>

          <ImagePickerField
            label="Cover image"
            value={form.coverImage.url || null}
            onChange={(url) => update("coverImage", { ...form.coverImage, url: url ?? "", alt: form.title })}
            aspect="aspect-[16/9]"
          />

          <div>
            <p className="mb-1.5 font-sans text-xs uppercase tracking-wide text-warmgray">Content</p>
            <RichTextEditor value={form.content} onChange={(html) => update("content", html)} />
          </div>
        </div>
      )}
    </div>
  );
}
