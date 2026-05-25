import { sql } from "../../config/db.js";
import type { DbCarrier, DbMembershipPlan } from "../../types/db.types.js";

export async function getActiveCarriers(): Promise<DbCarrier[]> {
  return sql<DbCarrier[]>`
    SELECT * FROM carriers
    WHERE is_active = true
    ORDER BY display_name
  `;
}

export async function getMembershipPlans(): Promise<DbMembershipPlan[]> {
  return sql<DbMembershipPlan[]>`
    SELECT * FROM membership_plans
    ORDER BY price_inr
  `;
}
