import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdmin, getAuth } from "../config/firebase-admin.js";
import { err } from "../types/api.types.js";
import { env } from "../config/env.js";

// Parsed once at startup from ADMIN_UIDS env var
const adminUids = new Set(
  env.ADMIN_UIDS.split(",").map((s) => s.trim()).filter(Boolean)
);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Requires a valid Firebase ID token in the Authorization header.
 * Verifies via firebase-admin and stores the decoded user in c.var.user.
 */
export const requireAuth = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return c.json(err("Unauthorized"), 401);
    }

    try {
      const decoded: DecodedIdToken = await getAuth(getFirebaseAdmin()).verifyIdToken(token);

      c.set("user", {
        id: decoded.uid,
        email: decoded.email ?? "",
        name: (decoded.name as string) ?? "",
      });

      await next();
    } catch (e) {
      console.error("[auth] verifyIdToken failed:", e);
      return c.json(err("Unauthorized"), 401);
    }
  }
);

/**
 * Requires a valid Firebase ID token AND the UID must be in the ADMIN_UIDS env var.
 * Returns 401 if no valid token, 403 if authenticated but not an admin.
 */
export const requireAdminAuth = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return c.json(err("Unauthorized"), 401);
    }

    try {
      const decoded: DecodedIdToken = await getAuth(getFirebaseAdmin()).verifyIdToken(token);

      if (!adminUids.has(decoded.uid)) {
        return c.json(err("Forbidden"), 403);
      }

      c.set("user", {
        id: decoded.uid,
        email: decoded.email ?? "",
        name: (decoded.name as string) ?? "",
      });

      await next();
    } catch (e) {
      console.error("[auth] admin verifyIdToken failed:", e);
      return c.json(err("Unauthorized"), 401);
    }
  }
);
