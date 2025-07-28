-- Migration: Add username field to users table
-- This migration adds a username field and handles existing data

-- Step 1: Add username column as nullable
ALTER TABLE users ADD COLUMN username VARCHAR(255);

-- Step 2: Generate default usernames for existing users
-- Use email prefix as default username for existing users
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- Step 3: Ensure uniqueness by appending numbers to duplicates
WITH duplicates AS (
  SELECT username, ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) as rn
  FROM users
  WHERE username IS NOT NULL
)
UPDATE users 
SET username = users.username || '_' || (duplicates.rn - 1)
FROM duplicates
WHERE users.username = duplicates.username 
  AND duplicates.rn > 1;

-- Step 4: Make username NOT NULL and add unique constraint
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY users_username_unique ON users (username);
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE USING INDEX users_username_unique;
