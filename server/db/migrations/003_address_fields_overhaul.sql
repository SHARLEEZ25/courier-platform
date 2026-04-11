-- Migration 003: address fields overhaul
-- Replaces sender_name/receiver_name with company fields,
-- splits single address fields into address_1 + address_2,
-- adds telephone, kyc, shipper_reference, special_instruction.
--
-- Run ONCE in the Neon SQL Editor before deploying this branch.
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS guards).

-- ── Sender ────────────────────────────────────────────────────────────────────

-- Rename sender_name → sender_company
ALTER TABLE bookings RENAME COLUMN sender_name TO sender_company;

-- Rename pickup_address → pickup_address_1
ALTER TABLE bookings RENAME COLUMN pickup_address TO pickup_address_1;

-- New sender columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS pickup_address_2  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sender_telephone  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sender_kyc        TEXT NOT NULL DEFAULT '';

-- ── Receiver ──────────────────────────────────────────────────────────────────

-- Rename receiver_name → receiver_company
ALTER TABLE bookings RENAME COLUMN receiver_name TO receiver_company;

-- Rename delivery_address → delivery_address_1
ALTER TABLE bookings RENAME COLUMN delivery_address TO delivery_address_1;

-- New receiver columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS delivery_address_2  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS receiver_telephone   TEXT NOT NULL DEFAULT '';

-- ── Services ──────────────────────────────────────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS shipper_reference   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS special_instruction TEXT NOT NULL DEFAULT '';
