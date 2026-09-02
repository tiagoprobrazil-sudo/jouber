import { supabase } from "@/lib/supabase/client";

export interface SubmitReviewInput {
  token?: string;
  productSlug?: string;
  rating: number;
  text: string;
  authorName: string;
  email?: string;
}

/** Submits a review — either verified-purchase (pass `token`, from the review-request email) or open (pass `productSlug`). Always lands as pending, needing admin approval. */
export async function submitReview(input: SubmitReviewInput): Promise<void> {
  const { data, error } = await supabase!.functions.invoke<{ ok: true }>("submit-review", { body: input });
  if (error || !data?.ok) throw error ?? new Error("Could not submit your review.");
}

export interface ReviewRequestInfo {
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  alreadyReviewed: boolean;
}

/** Resolves a /review/:token link into the product it's for — see get-review-request. */
export async function getReviewRequest(token: string): Promise<ReviewRequestInfo> {
  const { data, error } = await supabase!.functions.invoke<ReviewRequestInfo>("get-review-request", { body: { token } });
  if (error || !data) throw error ?? new Error("This review link is invalid.");
  return data;
}
