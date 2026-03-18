import type { Context } from "hono";
import { supabase } from "../config/supabase.js";
import { getMembershipPlans } from "../db/queries/rates.queries.js";
import { ok, err } from "../types/api.types.js";

export async function handleGetPlans(c: Context) {
  try {
    const plans = await getMembershipPlans();
    return c.json(ok(plans));
  } catch (e) {
    console.error("[membership.controller] getPlans error:", e);
    return c.json(err("Failed to fetch membership plans."), 500);
  }
}

export async function handleSubscribe(c: Context) {
  const user = c.get("user");
  const { planId } = (await c.req.json()) as { planId: string };

  if (!planId) {
    return c.json(err("planId is required."), 400);
  }

  try {
    // Check plan exists
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return c.json(err("Invalid membership plan."), 400);
    }

    // Deactivate any existing membership
    await supabase
      .from("user_memberships")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Create new membership
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

    const { data: membership, error: insertError } = await supabase
      .from("user_memberships")
      .insert({
        user_id: user.id,
        plan_id: planId,
        starts_at: startsAt.toISOString().split("T")[0],
        expires_at: expiresAt.toISOString().split("T")[0],
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return c.json(ok(membership), 201);
  } catch (e) {
    console.error("[membership.controller] subscribe error:", e);
    return c.json(err("Failed to process membership. Please try again."), 500);
  }
}

export async function handleGetMembershipStatus(c: Context) {
  const user = c.get("user");

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("user_memberships")
      .select("*, membership_plans(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("expires_at", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return c.json(ok({ active: false, plan: null }));
    }

    return c.json(ok({ active: true, plan: data }));
  } catch (e) {
    console.error("[membership.controller] getStatus error:", e);
    return c.json(err("Failed to fetch membership status."), 500);
  }
}
