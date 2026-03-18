import { supabase } from "../../config/supabase.js";
import type { DbCarrier, DbMembershipPlan } from "../../types/db.types.js";

export async function getActiveCarriers(): Promise<DbCarrier[]> {
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .eq("is_active", true)
    .order("display_name");

  if (error) throw new Error(`Failed to fetch carriers: ${error.message}`);
  return data ?? [];
}

export async function getMembershipPlans(): Promise<DbMembershipPlan[]> {
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .order("price_inr");

  if (error) throw new Error(`Failed to fetch plans: ${error.message}`);
  return data ?? [];
}
