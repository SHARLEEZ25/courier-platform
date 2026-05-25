import { Hono } from "hono";
import { sql } from "../config/db.js";
import { requireAdminAuth } from "../middleware/auth.middleware.js";
import { ok, err } from "../types/api.types.js";
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateTrackingNumber,
} from "../db/queries/bookings.queries.js";
import {
  getTrackingEventsByBookingId,
  addTrackingEvent,
} from "../db/queries/tracking.queries.js";
import type { BookingStatus } from "../types/db.types.js";

const adminRoutes = new Hono();

// Auth disabled for now — re-enable by uncommenting the line below
// adminRoutes.use("/*", requireAdminAuth);

// ── Identity check ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/me
 * Returns the admin's uid and email. Frontend calls this to verify admin access.
 */
adminRoutes.get("/me", (c) => {
  const user = c.get("user");
  return c.json(ok({ uid: user.id, email: user.email, name: user.name }));
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Returns aggregate stats for the dashboard in a single DB round-trip.
 * All date math uses IST (Asia/Kolkata, UTC+5:30).
 */
adminRoutes.get("/dashboard", async (c) => {
  const [bookingRows, ndrRows] = await Promise.all([
    sql<{
      bookings_today: string;
      bookings_this_week: string;
      pending_count: string;
      inscanned_count: string;
      outscanned_count: string;
      delivered_count: string;
      revenue_today: string;
      revenue_this_week: string;
      unassigned_pickups: string;
      cancelled_count: string;
      outscan_queue_count: string;
    }[]>`
      SELECT
        COUNT(*) FILTER (
          WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date
                = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
        )::text AS bookings_today,
        COUNT(*) FILTER (
          WHERE created_at AT TIME ZONE 'Asia/Kolkata'
                >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Kolkata')
        )::text AS bookings_this_week,
        COUNT(*) FILTER (WHERE status = 'pending')    ::text AS pending_count,
        COUNT(*) FILTER (WHERE status = 'picked_up')  ::text AS inscanned_count,
        COUNT(*) FILTER (WHERE status = 'in_transit') ::text AS outscanned_count,
        COUNT(*) FILTER (WHERE status = 'delivered')  ::text AS delivered_count,
        COALESCE(SUM(total_inr) FILTER (
          WHERE status != 'cancelled'
            AND (created_at AT TIME ZONE 'Asia/Kolkata')::date
                = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
        ), 0)::text AS revenue_today,
        COALESCE(SUM(total_inr) FILTER (
          WHERE status != 'cancelled'
            AND created_at AT TIME ZONE 'Asia/Kolkata'
                >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Kolkata')
        ), 0)::text AS revenue_this_week,
        COUNT(*) FILTER (
          WHERE status = 'confirmed' AND tracking_number IS NULL
        )::text AS unassigned_pickups,
        COUNT(*) FILTER (WHERE status = 'cancelled')  ::text AS cancelled_count,
        COUNT(*) FILTER (
          WHERE status = 'in_transit' AND tracking_number IS NULL
        )::text AS outscan_queue_count
      FROM bookings
    `,
    sql<{ ndr_count: string }[]>`
      SELECT COUNT(DISTINCT booking_id)::text AS ndr_count
      FROM tracking_events
      WHERE event_code ILIKE 'NDR%'
    `,
  ]);

  const r = bookingRows[0];
  return c.json(ok({
    bookings_today:      Number(r.bookings_today),
    bookings_this_week:  Number(r.bookings_this_week),
    pending_count:       Number(r.pending_count),
    inscanned_count:     Number(r.inscanned_count),
    outscanned_count:    Number(r.outscanned_count),
    delivered_count:     Number(r.delivered_count),
    revenue_today:       Number(r.revenue_today),
    revenue_this_week:   Number(r.revenue_this_week),
    unassigned_pickups:  Number(r.unassigned_pickups),
    cancelled_count:     Number(r.cancelled_count),
    outscan_queue_count: Number(r.outscan_queue_count),
    ndr_count:           Number(ndrRows[0]?.ndr_count ?? 0),
  }));
});

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/bookings
 * List all bookings with optional filters.
 * Query params: status, carrier, q (search ref/tracking), from, to, limit, offset
 */
adminRoutes.get("/bookings", async (c) => {
  const { status, carrier, q, from, to, origin, destination, limit, offset } = c.req.query();

  const result = await getAllBookings({
    status:      status || undefined,
    carrier_id:  carrier || undefined,
    q:           q || undefined,
    from:        from || undefined,
    to:          to || undefined,
    origin:      origin || undefined,
    destination: destination || undefined,
    limit:       limit  ? Number(limit)  : 50,
    offset:      offset ? Number(offset) : 0,
  });

  return c.json(ok(result));
});

/**
 * GET /api/admin/bookings/:id
 * Booking detail + all tracking events for that booking.
 */
adminRoutes.get("/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const [booking, events] = await Promise.all([
    getBookingById(id),
    getTrackingEventsByBookingId(id),
  ]);

  if (!booking) return c.json(err("Booking not found"), 404);

  return c.json(ok({ ...booking, tracking_events: events }));
});

/**
 * PATCH /api/admin/bookings/:id/status
 * Update booking status. Only allows forward progression (or cancellation).
 * Body: { status: BookingStatus }
 */
adminRoutes.patch("/bookings/:id/status", async (c) => {
  const id = c.req.param("id");

  let body: { status?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  const validStatuses: BookingStatus[] = [
    "pending", "confirmed", "picked_up", "in_transit", "delivered", "cancelled",
  ];

  if (typeof body.status !== "string" || !validStatuses.includes(body.status as BookingStatus)) {
    return c.json(err(`status must be one of: ${validStatuses.join(", ")}`), 400);
  }

  const updated = await updateBookingStatus(id, body.status);
  if (!updated) return c.json(err("Booking not found"), 404);

  return c.json(ok(updated));
});

/**
 * POST /api/admin/bookings/:id/tracking-event
 * Manually add a tracking event to a booking.
 * Body: { event_code, description, location?, event_at }
 */
adminRoutes.post("/bookings/:id/tracking-event", async (c) => {
  const id = c.req.param("id");

  let body: { event_code?: unknown; description?: unknown; location?: unknown; event_at?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  if (typeof body.event_code !== "string" || !body.event_code.trim()) {
    return c.json(err("event_code is required"), 400);
  }
  if (typeof body.description !== "string" || !body.description.trim()) {
    return c.json(err("description is required"), 400);
  }
  if (typeof body.event_at !== "string" || !body.event_at.trim()) {
    return c.json(err("event_at is required (ISO datetime)"), 400);
  }

  const booking = await getBookingById(id);
  if (!booking) return c.json(err("Booking not found"), 404);

  const event = await addTrackingEvent({
    booking_id:      booking.id,
    tracking_number: booking.tracking_number ?? booking.booking_ref,
    event_code:      body.event_code.trim(),
    description:     body.description.trim(),
    location:        typeof body.location === "string" ? body.location.trim() || null : null,
    event_at:        body.event_at.trim(),
  });

  if (!event) {
    return c.json(err("Duplicate event — same code, tracking number, and timestamp already exists"), 409);
  }

  return c.json(ok(event), 201);
});

/**
 * PATCH /api/admin/bookings/:id/tracking-number
 * Assign carrier AWB / tracking number to a booking.
 * Unlike updateTrackingNumber() query (which resets status to confirmed),
 * this only updates the tracking_number field, preserving current status.
 * Body: { tracking_number: string }
 */
adminRoutes.patch("/bookings/:id/tracking-number", async (c) => {
  const id = c.req.param("id");

  let body: { tracking_number?: unknown };
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  if (typeof body.tracking_number !== "string" || !body.tracking_number.trim()) {
    return c.json(err("tracking_number is required"), 400);
  }

  const booking = await getBookingById(id);
  if (!booking) return c.json(err("Booking not found"), 404);

  const updated = await sql<{ id: string; tracking_number: string | null }[]>`
    UPDATE bookings
    SET tracking_number = ${body.tracking_number.trim()}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, tracking_number
  `;

  return c.json(ok(updated[0]));
});

/**
 * PATCH /api/admin/bookings/:id/inscan
 * Record actual weight during inscan and advance status to in_transit.
 * Body: { actual_weight_kg: number }
 *
 * TODO: Add `inscan_weight_kg NUMERIC` and `inscan_at TIMESTAMPTZ` columns to bookings table.
 *       Once added, remove the dummy response and update the SQL below.
 *       Migration: ALTER TABLE bookings ADD COLUMN inscan_weight_kg NUMERIC, ADD COLUMN inscan_at TIMESTAMPTZ;
 */
adminRoutes.patch("/bookings/:id/inscan", async (c) => {
  const id = c.req.param("id");

  let body: { actual_weight_kg?: unknown };
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  if (typeof body.actual_weight_kg !== "number" || body.actual_weight_kg <= 0) {
    return c.json(err("actual_weight_kg must be a positive number"), 400);
  }

  const booking = await getBookingById(id);
  if (!booking) return c.json(err("Booking not found"), 404);

  // Advance status to in_transit
  const updated = await updateBookingStatus(id, "in_transit");

  // DUMMY: returns success with echo of actual_weight_kg
  // TODO: persist inscan_weight_kg and inscan_at to DB
  return c.json(ok({
    id,
    status: updated?.status ?? "in_transit",
    actual_weight_kg: body.actual_weight_kg,
    inscan_at: new Date().toISOString(),
    _note: "inscan_weight_kg not persisted yet — add column to bookings table",
  }));
});

/**
 * PATCH /api/admin/bookings/:id/assign-staff
 * Assign a pickup agent to a booking.
 * Body: { staff_id: string }
 *
 * TODO: Create `staff` table and add `assigned_staff_id UUID FK` column to bookings.
 *       Migration:
 *         CREATE TABLE staff (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, phone TEXT, email TEXT,
 *           role TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
 *         ALTER TABLE bookings ADD COLUMN assigned_staff_id UUID REFERENCES staff(id);
 */
adminRoutes.patch("/bookings/:id/assign-staff", async (c) => {
  const id = c.req.param("id");

  let body: { staff_id?: unknown };
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  if (typeof body.staff_id !== "string" || !body.staff_id.trim()) {
    return c.json(err("staff_id is required"), 400);
  }

  const booking = await getBookingById(id);
  if (!booking) return c.json(err("Booking not found"), 404);

  // DUMMY: returns success — staff assignment not persisted until column exists
  return c.json(ok({
    id,
    assigned_staff_id: body.staff_id,
    _note: "assigned_staff_id not persisted yet — add column to bookings table",
  }));
});

// ── Staff ─────────────────────────────────────────────────────────────────────

const DUMMY_STAFF = [
  { id: "staff-001", name: "Ravi Kumar", phone: "+91 98400 11111", email: "ravi@uniex.in", role: "pickup_agent", is_active: true, active_bookings_count: 3, created_at: "2025-01-10T09:00:00Z" },
  { id: "staff-002", name: "Priya Nair", phone: "+91 98400 22222", email: "priya@uniex.in", role: "pickup_agent", is_active: true, active_bookings_count: 1, created_at: "2025-02-14T09:00:00Z" },
  { id: "staff-003", name: "Arjun Mehta", phone: "+91 98400 33333", email: "arjun@uniex.in", role: "ops_staff", is_active: true, active_bookings_count: 0, created_at: "2025-03-01T09:00:00Z" },
];

/**
 * GET /api/admin/staff
 * TODO: Create `staff` table and replace dummy data with real DB query.
 */
adminRoutes.get("/staff", (c) => c.json(ok(DUMMY_STAFF)));

/**
 * POST /api/admin/staff
 * TODO: Insert into `staff` table.
 */
adminRoutes.post("/staff", async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  const newStaff = {
    id: `staff-${Date.now()}`,
    name: body.name ?? "New Staff",
    phone: body.phone ?? "",
    email: body.email ?? "",
    role: body.role ?? "pickup_agent",
    is_active: true,
    active_bookings_count: 0,
    created_at: new Date().toISOString(),
    _note: "Not persisted — staff table not yet created",
  };
  return c.json(ok(newStaff), 201);
});

/**
 * PATCH /api/admin/staff/:id
 * TODO: Update in `staff` table.
 */
adminRoutes.patch("/staff/:id", async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  return c.json(ok({ id: c.req.param("id"), ...body, _note: "Not persisted — staff table not yet created" }));
});

/**
 * DELETE /api/admin/staff/:id
 * TODO: Delete from `staff` table.
 */
adminRoutes.delete("/staff/:id", (c) => c.json(ok({ id: c.req.param("id"), deleted: true, _note: "Not persisted" })));

// ── Leads ─────────────────────────────────────────────────────────────────────

const DUMMY_LEADS = [
  { id: "lead-001", name: "Anil Sharma", email: "anil@example.com", phone: "+91 99001 11111", source: "chat", message: "I want to ship clothes to USA", status: "new", created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "lead-002", name: "Sunita Reddy", email: "sunita@example.com", phone: "+91 99001 22222", source: "contact_form", message: "Need a quote for 5kg parcel to UK", status: "contacted", created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: "lead-003", name: "Mohan Das", email: null, phone: "+91 99001 33333", source: "quote", message: null, status: "converted", created_at: new Date(Date.now() - 72 * 3600000).toISOString() },
];

/**
 * GET /api/admin/leads
 * TODO: Create `leads` table:
 *   CREATE TABLE leads (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name TEXT, email TEXT, phone TEXT,
 *     source TEXT CHECK (source IN ('chat','contact_form','quote')),
 *     message TEXT, status TEXT DEFAULT 'new', created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 * Wire ChatWidget to POST /api/leads when user submits contact details.
 */
adminRoutes.get("/leads", (c) => c.json(ok(DUMMY_LEADS)));

/**
 * PATCH /api/admin/leads/:id
 * TODO: Update status in `leads` table.
 */
adminRoutes.patch("/leads/:id", async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  return c.json(ok({ id: c.req.param("id"), ...body, _note: "Not persisted — leads table not yet created" }));
});

// ── NDR Board ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/ndr
 * TODO: Implement once AfterShip is integrated.
 * Options:
 *   1. AfterShip webhook → insert tracking_events with event_code='NDR...'
 *   2. Dedicated ndr_events table: booking_id, reason, attempt_count, next_attempt_at, resolved_at
 * For now returns an empty array. NDR events appear here once AfterShip webhooks are live.
 */
adminRoutes.get("/ndr", (c) => c.json(ok([])));

/**
 * POST /api/admin/ndr/:id/note
 * TODO: Insert NDR note into ndr_events table.
 */
adminRoutes.post("/ndr/:id/note", async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  return c.json(ok({ id: c.req.param("id"), ...body, _note: "Not persisted — ndr_events table not yet created" }), 201);
});

// ── Remarketing ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/remarketing/eligible
 * Returns delivered bookings from the last 30 days with dummy email_status.
 * TODO: Create `remarketing_emails` table:
 *   CREATE TABLE remarketing_emails (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     booking_id UUID REFERENCES bookings(id),
 *     email_type TEXT, sent_at TIMESTAMPTZ, status TEXT DEFAULT 'pending'
 *   );
 * Integrate email provider (Resend / SendGrid) and JOIN on booking_id.
 */
adminRoutes.get("/remarketing/eligible", async (c) => {
  const rows = await sql<{
    id: string; booking_ref: string; receiver_email: string | null;
    sender_email: string | null; updated_at: string;
  }[]>`
    SELECT id, booking_ref, receiver_email, sender_email, updated_at
    FROM bookings
    WHERE status = 'delivered'
      AND updated_at >= NOW() - INTERVAL '30 days'
    ORDER BY updated_at DESC
  `;

  const records = rows.map((r) => ({
    booking_id:    r.id,
    booking_ref:   r.booking_ref,
    customer_email: r.receiver_email ?? r.sender_email ?? "—",
    delivered_at:  r.updated_at,
    email_status:  "pending" as const,
    sent_at:       null,
  }));

  return c.json(ok(records));
});

/**
 * POST /api/admin/remarketing/send
 * Trigger "10% off" remarketing emails for selected bookings.
 * Body: { booking_ids: string[] }
 * TODO: Integrate email provider (Resend / SendGrid) and record in remarketing_emails table.
 */
adminRoutes.post("/remarketing/send", async (c) => {
  let body: { booking_ids?: unknown };
  try { body = await c.req.json(); }
  catch { return c.json(err("Invalid JSON body"), 400); }

  if (!Array.isArray(body.booking_ids) || body.booking_ids.length === 0) {
    return c.json(err("booking_ids must be a non-empty array"), 400);
  }

  return c.json(ok({
    queued: body.booking_ids.length,
    booking_ids: body.booking_ids,
    _note: "Email not sent — email provider (Resend/SendGrid) not yet integrated",
  }));
});

// ── Surcharge Config ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/surcharge-config
 * Returns all surcharge_config rows grouped by carrier.
 */
adminRoutes.get("/surcharge-config", async (c) => {
  const rows = await sql<{
    carrier_id: string;
    key: string;
    value_num: string | null;
    value_bool: boolean | null;
    updated_at: string;
  }[]>`
    SELECT carrier_id, key, value_num, value_bool, updated_at
    FROM surcharge_config
    ORDER BY carrier_id, key
  `;

  // Group by carrier
  const grouped: Record<string, Record<string, number | boolean | null>> = {};
  for (const row of rows) {
    if (!grouped[row.carrier_id]) grouped[row.carrier_id] = {};
    grouped[row.carrier_id][row.key] =
      row.value_bool !== null ? row.value_bool : (row.value_num !== null ? Number(row.value_num) : null);
  }

  return c.json(ok(grouped));
});

/**
 * PATCH /api/admin/surcharge-config/:carrier/:key
 * Update a single surcharge config value.
 * Body: { value_num: number } OR { value_bool: boolean }
 */
adminRoutes.patch("/surcharge-config/:carrier/:key", async (c) => {
  const carrier = c.req.param("carrier");
  const key     = c.req.param("key");

  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json(err("carrier must be dhl, fedex, or ups"), 400);
  }

  let body: { value_num?: unknown; value_bool?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  const hasNum  = body.value_num  !== undefined;
  const hasBool = body.value_bool !== undefined;

  if (!hasNum && !hasBool) {
    return c.json(err("Provide either value_num or value_bool"), 400);
  }
  if (hasNum && typeof body.value_num !== "number") {
    return c.json(err("value_num must be a number"), 400);
  }
  if (hasBool && typeof body.value_bool !== "boolean") {
    return c.json(err("value_bool must be a boolean"), 400);
  }

  const updated = await sql<{ carrier_id: string; key: string; value_num: string | null; value_bool: boolean | null; updated_at: string }[]>`
    UPDATE surcharge_config
    SET
      value_num  = ${hasNum  ? (body.value_num  as number)  : null},
      value_bool = ${hasBool ? (body.value_bool as boolean) : null},
      updated_at = NOW()
    WHERE carrier_id = ${carrier} AND key = ${key}
    RETURNING carrier_id, key, value_num, value_bool, updated_at
  `;

  if (updated.length === 0) {
    return c.json(err(`No config found for carrier=${carrier} key=${key}`), 404);
  }

  return c.json(ok(updated[0]));
});

// ── Fuel Surcharges ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/fuel-surcharges
 * Returns all fuel surcharge rows, newest first.
 */
adminRoutes.get("/fuel-surcharges", async (c) => {
  const rows = await sql<{
    id: string;
    carrier_id: string;
    fsc_percent: string;
    effective_from: string;
    effective_to: string | null;
    created_at: string;
  }[]>`
    SELECT id, carrier_id, fsc_percent, effective_from, effective_to, created_at
    FROM fuel_surcharges
    ORDER BY effective_from DESC, carrier_id
  `;

  return c.json(ok(rows.map((r) => ({
    ...r,
    fsc_percent: Number(r.fsc_percent),
  }))));
});

/**
 * POST /api/admin/fuel-surcharges
 * Insert a new FSC row. Creates a new entry; does not overwrite existing ones.
 * Body: { carrier_id, fsc_percent, effective_from, effective_to? }
 */
adminRoutes.post("/fuel-surcharges", async (c) => {
  let body: { carrier_id?: unknown; fsc_percent?: unknown; effective_from?: unknown; effective_to?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  if (!["dhl", "fedex", "ups", "aramex"].includes(body.carrier_id as string)) {
    return c.json(err("carrier_id must be dhl, fedex, ups, or aramex"), 400);
  }
  if (typeof body.fsc_percent !== "number" || body.fsc_percent < 0 || body.fsc_percent > 100) {
    return c.json(err("fsc_percent must be a number between 0 and 100"), 400);
  }
  if (typeof body.effective_from !== "string" || !body.effective_from.trim()) {
    return c.json(err("effective_from is required (YYYY-MM-DD)"), 400);
  }

  const effectiveTo =
    typeof body.effective_to === "string" && body.effective_to.trim()
      ? body.effective_to.trim()
      : null;

  try {
    const rows = await sql<{ id: string; carrier_id: string; fsc_percent: string; effective_from: string; effective_to: string | null; created_at: string }[]>`
      INSERT INTO fuel_surcharges (carrier_id, fsc_percent, effective_from, effective_to)
      VALUES (
        ${body.carrier_id as string},
        ${body.fsc_percent as number},
        ${body.effective_from.trim()}::date,
        ${effectiveTo ? sql`${effectiveTo}::date` : sql`NULL`}
      )
      RETURNING id, carrier_id, fsc_percent, effective_from, effective_to, created_at
    `;

    return c.json(ok({ ...rows[0], fsc_percent: Number(rows[0].fsc_percent) }), 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return c.json(err("A fuel surcharge for this carrier and effective_from date already exists"), 409);
    }
    console.error("[admin] insert fuel_surcharge error:", e);
    return c.json(err("Failed to insert fuel surcharge"), 500);
  }
});

/**
 * DELETE /api/admin/fuel-surcharges/:id
 * Remove an FSC row entirely.
 */
adminRoutes.delete("/fuel-surcharges/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const rows = await sql`
      DELETE FROM fuel_surcharges WHERE id = ${id}::uuid RETURNING id
    `;
    if (rows.length === 0) return c.json(err("FSC row not found"), 404);
    return c.json(ok({ deleted: id }));
  } catch (e) {
    console.error("[admin] delete fsc error:", e);
    return c.json(err("Failed to delete FSC row"), 500);
  }
});

/**
 * PATCH /api/admin/fuel-surcharges/:id
 * Edit an existing FSC row's percent and/or effective_to date.
 * Body: { fsc_percent: number; effective_to?: string | null }
 */
adminRoutes.patch("/fuel-surcharges/:id", async (c) => {
  const id = c.req.param("id");
  let body: { fsc_percent?: unknown; effective_to?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  if (typeof body.fsc_percent !== "number" || body.fsc_percent < 0 || body.fsc_percent > 100) {
    return c.json(err("fsc_percent must be a number between 0 and 100"), 400);
  }

  const effectiveTo =
    typeof body.effective_to === "string" && body.effective_to.trim()
      ? body.effective_to.trim()
      : null;

  try {
    const rows = await sql`
      UPDATE fuel_surcharges
      SET fsc_percent = ${body.fsc_percent as number},
          effective_to = ${effectiveTo ? sql`${effectiveTo}::date` : sql`NULL`}
      WHERE id = ${id}::uuid
      RETURNING id, carrier_id, fsc_percent::float AS fsc_percent, effective_from, effective_to, created_at
    `;
    if (rows.length === 0) return c.json(err("FSC row not found"), 404);
    return c.json(ok(rows[0]));
  } catch (e) {
    console.error("[admin] patch fsc error:", e);
    return c.json(err("Failed to update FSC row"), 500);
  }
});

// ── Legacy rate-calc tools (kept, now auth-protected) ─────────────────────────

/**
 * POST /api/admin/base-rate
 * Raw rate card lookup — returns base rate before surcharges.
 * Body: { weight_kg, country, carrier, shipment_type }
 */
adminRoutes.post("/base-rate", async (c) => {
  let body: { weight_kg?: unknown; country?: unknown; carrier?: unknown; shipment_type?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { weight_kg, country, carrier, shipment_type } = body;

  if (typeof weight_kg !== "number" || weight_kg <= 0) {
    return c.json({ ok: false, error: "weight_kg must be a positive number" }, 400);
  }
  if (typeof country !== "string" || !country.trim()) {
    return c.json({ ok: false, error: "country is required" }, 400);
  }
  if (!["dhl", "fedex", "ups"].includes(carrier as string)) {
    return c.json({ ok: false, error: "carrier must be dhl, fedex, or ups" }, 400);
  }
  if (!["document", "package"].includes(shipment_type as string)) {
    return c.json({ ok: false, error: "shipment_type must be document or package" }, 400);
  }

  const carrierSlug = carrier as "dhl" | "fedex" | "ups";
  const shipType    = shipment_type as "document" | "package";
  const today       = new Date().toISOString().split("T")[0];
  const chargeable  = Math.ceil(weight_kg * 2) / 2;
  const serviceType = carrierSlug === "fedex" ? "IP" : "standard";

  const zoneRows = await sql<{ zone_code: string }[]>`
    SELECT zone_code FROM carrier_zones
    WHERE carrier_id = ${carrierSlug}
      AND origin_country = 'India'
      AND destination_country = ${country.trim()}
      AND service_type = ${serviceType}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC LIMIT 1
  `;

  if (zoneRows.length === 0) {
    return c.json({ ok: false, error: `No zone found for ${carrierSlug.toUpperCase()} → ${country}.` }, 404);
  }

  const zone = zoneRows[0].zone_code;
  const effectiveType: "document" | "package" =
    (carrierSlug === "dhl"   && shipType === "document" && chargeable > 2.0) ||
    (carrierSlug === "ups"   && shipType === "document" && chargeable > 5.0) ||
    (carrierSlug === "fedex" && shipType === "document" && chargeable > 2.5)
      ? "package" : shipType;

  const stepRows = await sql<{ price_inr: string }[]>`
    SELECT price_inr FROM rate_card_steps
    WHERE carrier_id = ${carrierSlug} AND zone_code = ${zone}
      AND shipment_type = ${effectiveType} AND weight_kg = ${chargeable}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    LIMIT 1
  `;

  if (stepRows.length > 0) {
    return c.json({ ok: true, base_rate_inr: Math.round(Number(stepRows[0].price_inr) * 100) / 100, chargeable_kg: chargeable, zone, carrier: carrierSlug, country: country.trim(), shipment_type: effectiveType });
  }

  const bandRows = await sql<{ price_per_kg: string; base_price_inr: string; band_type: string; weight_min_kg: string }[]>`
    SELECT price_per_kg, base_price_inr, band_type, weight_min_kg FROM rate_card_bands
    WHERE carrier_id = ${carrierSlug} AND zone_code = ${zone}
      AND shipment_type = ${effectiveType}
      AND weight_min_kg <= ${chargeable}
      AND (weight_max_kg IS NULL OR weight_max_kg >= ${chargeable})
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY weight_min_kg DESC LIMIT 1
  `;

  if (bandRows.length === 0) {
    return c.json({ ok: false, error: `No rate found for ${carrierSlug.toUpperCase()} zone ${zone} at ${chargeable} kg.` }, 404);
  }

  const band = bandRows[0];
  const perKg  = Number(band.price_per_kg);
  const base   = Number(band.base_price_inr);
  const wMin   = Number(band.weight_min_kg);
  const rawBand = band.band_type === "additive" ? base + (chargeable - wMin) * perKg : chargeable * perKg;
  const priceInr = band.band_type === "multiplicative" ? Math.max(rawBand, base) : rawBand;

  return c.json({ ok: true, base_rate_inr: Math.round(priceInr * 100) / 100, chargeable_kg: chargeable, zone, carrier: carrierSlug, country: country.trim(), shipment_type: effectiveType });
});

/**
 * GET /api/admin/config/:carrier
 * Returns live surcharge config for the admin calculator.
 */
adminRoutes.get("/config/:carrier", async (c) => {
  const carrier = c.req.param("carrier");
  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json({ ok: false, error: "carrier must be dhl, fedex, or ups" }, 400);
  }

  const today = new Date().toISOString().split("T")[0];

  const fscRows = await sql<{ fsc_percent: string }[]>`
    SELECT fsc_percent FROM fuel_surcharges
    WHERE carrier_id = ${carrier}
      AND effective_from <= ${today}::date
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC LIMIT 1
  `;
  const fsc_pct = fscRows.length > 0 ? Number(fscRows[0].fsc_percent) : 0;

  const configRows = await sql<{ key: string; value_num: string | null; value_bool: boolean | null }[]>`
    SELECT key, value_num, value_bool FROM surcharge_config WHERE carrier_id = ${carrier}
  `;
  const cfg: Record<string, number | boolean> = {};
  for (const row of configRows) {
    cfg[row.key] = row.value_bool !== null ? row.value_bool : Number(row.value_num ?? 0);
  }

  const pdf: Record<string, number> = { gst_pct: 18 };
  if (carrier === "dhl") { pdf.premium_1200_inr = 1000; pdf.premium_900_inr = 3000; }
  if (carrier === "ups") {
    pdf.us_inbound_inr = 230; pdf.remote_per_kg_inr = 57; pdf.remote_min_inr = 3150;
    pdf.formal_clearance_inr = 3150; pdf.ddp_inr = 1050; pdf.signature_inr = 368; pdf.girth_surcharge_inr = 9450;
  }

  return c.json({ ok: true, carrier, fsc_pct, margin_pct: cfg.margin_pct ?? 0, demand_active: cfg.demand_active ?? false, demand_per_kg: cfg.demand_per_kg ?? 0, ...(carrier === "fedex" && { peak_active: cfg.peak_active ?? false, peak_amount: cfg.peak_amount ?? 0 }), ...(carrier === "ups" && { surge_active: cfg.surge_active ?? false, surge_amount: cfg.surge_amount ?? 0 }), ...pdf });
});

/**
 * GET /api/admin/item-types
 * Returns all item types and their discount percentages.
 */
adminRoutes.get("/item-types", async (c) => {
  const types = await sql`
    SELECT item_type_id, display_name, discount_pct FROM item_type_discounts
    ORDER BY display_name ASC
  `;
  return c.json({ ok: true, types });
});

/**
 * GET /api/admin/rate-cards/:carrier
 * Returns all rate_card_steps and rate_card_bands for a carrier.
 * Used by the admin config panel to display the PDF rate card as a matrix.
 */
adminRoutes.get("/rate-cards/:carrier", async (c) => {
  const carrier = c.req.param("carrier");
  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json({ error: "Invalid carrier" }, 400);
  }

  type RateCardStep = { zone_code: string; shipment_type: string; weight_kg: number; price_inr: number };
  type RateCardBand = { zone_code: string; shipment_type: string; weight_min_kg: number; weight_max_kg: number | null; price_per_kg: number; base_price_inr: number | null; band_type: string };

  type ZoneCountry = { country: string; zone: string };
  const serviceType = carrier === "fedex" ? "IP" : "standard";

  const [steps, bands, countries] = await Promise.all([
    sql<RateCardStep[]>`
      SELECT zone_code, shipment_type,
             weight_kg::float AS weight_kg,
             price_inr::float AS price_inr
      FROM rate_card_steps
      WHERE carrier_id = ${carrier}
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
      ORDER BY shipment_type, weight_kg, zone_code
    `,
    sql<RateCardBand[]>`
      SELECT zone_code, shipment_type,
             weight_min_kg::float AS weight_min_kg,
             weight_max_kg::float AS weight_max_kg,
             price_per_kg::float AS price_per_kg,
             base_price_inr::float AS base_price_inr,
             band_type
      FROM rate_card_bands
      WHERE carrier_id = ${carrier}
      ORDER BY shipment_type, weight_min_kg, zone_code
    `,
    sql<ZoneCountry[]>`
      SELECT DISTINCT destination_country AS country, zone_code AS zone
      FROM carrier_zones
      WHERE carrier_id = ${carrier}
        AND origin_country = 'India'
        AND service_type = ${serviceType}
      ORDER BY destination_country
    `,
  ]);

  return c.json(ok({ steps, bands, countries }));
});

export default adminRoutes;
