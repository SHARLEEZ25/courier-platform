import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { env } from "../config/env.js";

/**
 * BetterAuth instance.
 *
 * Uses the built-in database adapter with Supabase's PostgreSQL connection
 * string. BetterAuth manages its own `user`, `session`, `account`, and
 * `verification` tables automatically.
 *
 * To add the Supabase adapter replace the database block with:
 *   import { supabaseAdapter } from "@better-auth/supabase";
 *   database: supabaseAdapter(supabase, { ... })
 * once the official adapter stabilises.
 */
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL],

  database: {
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    type: "postgres",
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true in production
  },

  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cache
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
