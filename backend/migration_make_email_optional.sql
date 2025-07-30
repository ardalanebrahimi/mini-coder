-- Migration to make email optional
-- Make email field nullable and remove unique constraint
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
