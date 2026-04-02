# Uniex Auth Security Audit
**Date:** 2026-03-21
**Audited by:** Claude (Senior Security Engineer review)
**Score at time of audit:** 52 / 100
**Score after critical fixes:** ~65 / 100

---

## System Overview
- **Auth provider:** Supabase Auth (JWT, RS256)
- **Frontend:** React + Supabase JS client (anon key)
- **Backend:** Hono (Node.js) — verifies JWT via service-role `supabase.auth.getUser(token)`
- **Token transport:** `Authorization: Bearer <token>` header
- **Session storage:** Supabase default (localStorage)

---

## Issues Found

### 🔴 CRITICAL

#### 1. `POST /api/bookings` had no authentication ✅ FIXED
**File:** `server/routes/bookings.routes.ts`
**Problem:** Create booking endpoint had no `requireAuth` — anyone could POST directly to the API without a token.
**Risk:** Fake bookings, rate engine abuse, DB flooding.
**Fix applied:** Added `requireAuth` middleware to `POST /api/bookings`.

#### 2. IDOR on guest bookings ✅ FIXED
**File:** `server/controllers/bookings.controller.ts`
**Problem:** `if (booking.user_id && booking.user_id !== user?.id)` — the `&&` short-circuit meant any authenticated user could read bookings with `user_id = null`.
**Risk:** Authenticated users could enumerate booking IDs and read strangers' addresses, phone numbers, shipment contents.
**Fix applied:** Changed to `if (booking.user_id !== user.id)` — strict ownership check, no null bypass.

---

### 🟠 HIGH

#### 3. JWT stored in localStorage — XSS risk ❌ OPEN
**File:** `src/lib/supabase.ts`
**Problem:** Supabase stores JWT in `localStorage` by default. Any XSS vulnerability steals the token and fully impersonates the user.
**Fix:** Use `sessionStorage` short-term. Full fix: migrate to `@supabase/ssr` with httpOnly cookies.
```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: sessionStorage, autoRefreshToken: true, persistSession: true },
});
```

#### 4. Rate limiter IP header is spoofable ❌ OPEN
**File:** `server/middleware/rate-limit.middleware.ts:12-14`
**Problem:** `x-forwarded-for` is client-controlled. Attacker rotates this header → bypasses rate limiting entirely.
**Fix:** Take only the first IP and trust it as set by Render's proxy:
```ts
keyGenerator: (c) => {
  const xff = c.req.header("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "unknown";
},
```

#### 5. Auth (signIn/signUp) bypasses backend rate limiter ❌ OPEN
**Problem:** Sign-in/sign-up go directly from browser to Supabase — our `strictLimiter` is never applied. Unlimited password attempts possible.
**Fix:** Configure in **Supabase Dashboard → Auth → Rate Limits**:
- Sign-ins: max 5/minute per IP
- Sign-ups: max 3/hour per IP
- Password recovery: max 3/hour per email

#### 6. Forgot password not implemented ❌ OPEN
**File:** `src/pages/Login.tsx:104`
**Problem:** Button exists, does nothing. Users with forgotten passwords are permanently locked out.
**Fix:** One line — `supabase.auth.resetPasswordForEmail(email)`

---

### 🟡 MEDIUM

#### 7. No CORS policy on backend ❌ OPEN
**Problem:** No `cors()` middleware — any origin can call the API in production.
**Fix:**
```ts
import { cors } from "hono/cors";
app.use("/*", cors({
  origin: env.FRONTEND_URL,
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  allowHeaders: ["Content-Type", "Authorization"],
}));
```

#### 8. Password policy is client-side only ❌ OPEN
**Problem:** 8-char minimum and strength meter are frontend only. Direct Supabase API calls bypass them.
**Fix:** Set minimum password length in **Supabase Dashboard → Auth → Password settings**.

#### 9. No MFA available ❌ OPEN
**Problem:** No second factor. Leaked password = full account takeover.
**Fix:** Enable TOTP in **Supabase Dashboard → Auth → MFA**. Optional for users, not forced.

#### 10. No auth event logging ❌ OPEN
**Problem:** No audit trail for sign-in, sign-out, failed attempts. No forensic data if account is compromised.
**Fix:** Log in `auth.middleware.ts` after successful verification:
```ts
console.info("[auth] user=%s ip=%s path=%s", user.id, clientIp, c.req.path);
```

---

### 🟢 LOW

#### 11. Open redirect — FIXED ✅
**File:** `src/pages/Login.tsx`
**Fix applied:** Validate redirect param — must start with `/` and not `//`.

#### 12. No account deletion / GDPR right-to-erasure ❌ OPEN
**Problem:** Users cannot delete their account or data. Required under GDPR for EU users.
**Priority:** Low for Indian startup, implement before expanding to EU.

#### 13. `.env` must stay out of git ⚠️ VERIFY
**Problem:** `SUPABASE_SERVICE_ROLE_KEY` in `.env` gives full DB access if committed.
**Action:** Verify `.env` is in `.gitignore`. Never commit it.

---

## What's Correctly Implemented ✅
- Supabase Auth (RS256 JWT) — strong algorithm, no 'none' attack surface
- Server-side JWT verification via `supabase.auth.getUser(token)` — not client-trusted
- Service-role key never exposed to frontend
- Bearer token in Authorization header — not in URL params or cookies
- Generic error messages to clients — no stack traces leaked
- Zod validation on all request bodies — no mass assignment
- Rate limiting exists on all backend routes (even if bypassable)
- Open redirect fixed
- `requireAuth` correctly applied to all sensitive routes (after fix #1)
- IDOR fixed (after fix #2)

---

## Pre-Launch Security Checklist

- [ ] Switch localStorage to sessionStorage (or httpOnly cookies via `@supabase/ssr`)
- [ ] Fix rate limiter `x-forwarded-for` to take first IP only
- [ ] Configure Supabase Auth rate limits in dashboard
- [ ] Implement forgot password flow
- [ ] Add CORS middleware to backend
- [ ] Set minimum password length in Supabase dashboard
- [ ] Enable Supabase MFA (TOTP) as optional feature
- [ ] Add auth event logging to middleware
- [ ] Verify `.env` is in `.gitignore`
- [ ] Run `npm audit` and fix HIGH/CRITICAL dependency vulnerabilities

---

## Production Readiness Score

| State | Score |
|---|---|
| At time of audit | 52 / 100 |
| After CRITICAL fixes | ~65 / 100 |
| After all HIGH fixes | ~80 / 100 |
| After full checklist | ~92 / 100 |
