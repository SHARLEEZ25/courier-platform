import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { env } from "../config/env.js";

// Lazy singleton — pg.Pool is NOT created at import time.
// This prevents the serverless cold start from hanging on a DB connection
// before any auth endpoint is even called.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

export function getAuth() {
  if (_auth) return _auth as ReturnType<typeof betterAuth>;

  _auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.FRONTEND_URL],

    database: {
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          min: 0,
          max: 3,
          idleTimeoutMillis: 5000,
          connectionTimeoutMillis: 10000,
        }),
      }),
      type: "postgres",
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
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
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
  });

  return _auth as ReturnType<typeof betterAuth>;
}

export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];
export type User = Auth["$Infer"]["Session"]["user"];
