import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env.js";

let _app: App | null = null;

export function getFirebaseAdmin(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  _app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Render stores private key as a single-line string with literal \n
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  return _app;
}

export { getAuth };
