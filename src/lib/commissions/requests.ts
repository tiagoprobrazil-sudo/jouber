import { supabase } from "@/lib/supabase/client";
import type { CommissionRequestInput, CommissionRequestResult } from "./types";

/**
 * Calls create-commission-request (supabase/functions/create-commission-request),
 * which saves the request (commission_requests table, visible at
 * /admin/commissions) and emails the admin. Returns the source site's
 * purchase link so the UI can point the customer at buying the STL.
 */
export async function createCommissionRequest(
  input: CommissionRequestInput,
): Promise<CommissionRequestResult> {
  const { data, error } = await supabase!.functions.invoke<CommissionRequestResult>(
    "create-commission-request",
    { body: input },
  );
  if (error || !data) throw error ?? new Error("Could not send the commission request.");
  return data;
}
