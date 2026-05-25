import type { Context } from "hono";
import { sql } from "../config/db.js";
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
    const plans = await sql`
      SELECT * FROM membership_plans WHERE id = ${planId} LIMIT 1
    `;
    const plan = plans[0];
    if (!plan) return c.json(err("Invalid membership plan."), 400);

    // Deactivate any existing membership
    await sql`
      UPDATE user_memberships
      SET is_active = false
      WHERE user_id = ${user.id} AND is_active = true
    `;

    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

    const rows = await sql`
      INSERT INTO user_memberships (user_id, plan_id, starts_at, expires_at, is_active)
      VALUES (
        ${user.id},
        ${planId},
        ${startsAt.toISOString().split("T")[0]},
        ${expiresAt.toISOString().split("T")[0]},
        true
      )
      RETURNING *
    `;

    return c.json(ok(rows[0]), 201);
  } catch (e) {
    console.error("[membership.controller] subscribe error:", e);
    return c.json(err("Failed to process membership. Please try again."), 500);
  }
}

export async function handleGetMembershipStatus(c: Context) {
  const user = c.get("user");

  try {
    const today = new Date().toISOString().split("T")[0];

    const rows = await sql`
      SELECT um.*, row_to_json(mp.*) AS membership_plans
      FROM user_memberships um
      JOIN membership_plans mp ON mp.id = um.plan_id
      WHERE um.user_id = ${user.id}
        AND um.is_active = true
        AND um.expires_at >= ${today}::date
      ORDER BY um.created_at DESC
      LIMIT 1
    `;

    if (!rows[0]) return c.json(ok({ active: false, plan: null }));
    return c.json(ok({ active: true, plan: rows[0] }));
  } catch (e) {
    console.error("[membership.controller] getStatus error:", e);
    return c.json(err("Failed to fetch membership status."), 500);
  }
}
