import { supabase } from "@/lib/supabase/client";

export type CommissionRequestStatus = "new" | "contacted" | "in_progress" | "completed" | "cancelled";

export interface CommissionRequestRow {
  id: string;
  created_at: string;
  status: CommissionRequestStatus;
  source_product_id: string;
  source_product_name: string;
  source_product_category: string | null;
  source_product_price: number | null;
  source_product_image: string | null;
  source_product_link: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  admin_notes: string | null;
}

export async function listCommissionRequests(): Promise<CommissionRequestRow[]> {
  const { data, error } = await supabase!
    .from("commission_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as CommissionRequestRow[];
}

export async function updateCommissionRequestStatus(
  id: string,
  status: CommissionRequestStatus,
): Promise<void> {
  const { error } = await supabase!.from("commission_requests").update({ status }).eq("id", id);
  if (error) throw error;
}
