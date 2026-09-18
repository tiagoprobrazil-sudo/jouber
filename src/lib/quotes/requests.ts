import { supabase } from "@/lib/supabase/client";
import type { QuoteRequestInput, QuoteRequestResult } from "./types";

/**
 * Calls create-product-quote-request (supabase/functions/create-product-quote-request),
 * which saves the request (product_quote_requests table) and emails the admin.
 */
export async function createProductQuoteRequest(
  input: QuoteRequestInput,
): Promise<QuoteRequestResult> {
  const { data, error } = await supabase!.functions.invoke<QuoteRequestResult>(
    "create-product-quote-request",
    { body: input },
  );
  if (error || !data) throw error ?? new Error("Could not send the quote request.");
  return data;
}
