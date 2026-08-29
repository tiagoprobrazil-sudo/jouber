import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Post } from "@/lib/data/types";
import { getAllPosts, deletePost, updatePost } from "@/lib/data/repository";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";

const STATUS_STYLES: Record<Post["status"], string> = {
  published: "bg-olive/15 text-olive-dark",
  draft: "bg-admin-border-soft text-admin-ink-muted",
  scheduled: "bg-gold-soft/20 text-gold",
};

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  function reload() {
    getAllPosts().then(setPosts);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(post: Post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    await deletePost(post.id);
    reload();
  }

  async function handleToggleStatus(post: Post) {
    const nextStatus = post.status === "published" ? "draft" : "published";
    await updatePost(post.id, {
      status: nextStatus,
      publishedAt: nextStatus === "published" ? (post.publishedAt ?? new Date().toISOString()) : post.publishedAt,
    });
    reload();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-admin-ink">Posts</h1>
          <p className="mt-1 font-sans text-sm text-admin-muted">The atelier's Journal.</p>
        </div>
        <ButtonLink to="/admin/posts/new" icon={<Plus size={15} strokeWidth={1.5} />} size="sm">
          New Post
        </ButtonLink>
      </div>

      <div className="overflow-x-auto border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[640px] text-left font-sans text-sm">
          <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-soft">
            {posts?.map((post) => (
              <tr key={post.id}>
                <td className="px-5 py-4 text-admin-ink">{post.title}</td>
                <td className="px-5 py-4 capitalize text-admin-ink-muted">{post.category}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    className={`px-2.5 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[post.status]}`}
                  >
                    {post.status}
                  </button>
                </td>
                <td className="px-5 py-4 text-admin-ink-muted">{formatDate(post.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/admin/posts/${post.id}`} aria-label={`Edit ${post.title}`} className="text-admin-muted hover:text-admin-ink">
                      <Pencil size={15} strokeWidth={1.5} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(post)} aria-label={`Delete ${post.title}`} className="text-admin-muted hover:text-red-700">
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-admin-muted">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
