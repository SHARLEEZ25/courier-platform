-- Migration 001: structured pickup address + nullable email fields
-- Run once against your Supabase project if the DB was already provisioned.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS pickup_city  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_state TEXT NOT NULL DEFAULT '';

ALTER TABLE bookings
  ALTER COLUMN sender_email   DROP NOT NULL,
  ALTER COLUMN receiver_email DROP NOT NULL;
