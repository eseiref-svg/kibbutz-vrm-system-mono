-- Migration: Add 'pending_approval' status and 'description' field to transaction table
-- Date: 2025-11-11
-- Description: 
--   1. Allow transactions to have 'pending_approval' status for sales requests awaiting treasurer approval
--   2. Add description field to transaction table for storing transaction descriptions

-- Step 1: Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transaction' AND column_name = 'description'
    ) THEN
        ALTER TABLE transaction ADD COLUMN description TEXT;
    END IF;
END $$;

-- Step 2: Drop the existing CHECK constraint
ALTER TABLE transaction DROP CONSTRAINT IF EXISTS transaction_status_check;

-- Step 3: Add new CHECK constraint with 'pending_approval' status
ALTER TABLE transaction 
ADD CONSTRAINT transaction_status_check 
CHECK (status::text = ANY (ARRAY[
  'open'::character varying,
  'frozen'::character varying,
  'deleted'::character varying,
  'paid'::character varying,
  'pending_approval'::character varying
]::text[]));

-- Verify the changes
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'transaction'::regclass
  AND conname = 'transaction_status_check';

-- Verify description column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transaction' AND column_name = 'description';

