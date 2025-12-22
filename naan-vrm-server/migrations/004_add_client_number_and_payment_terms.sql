-- Migration: Add client_number and default_payment_terms to client table
-- Date: 2025-11-12
-- Description: 
--   1. Add client_number field (unique identifier for client)
--   2. Add default_payment_terms field for default payment terms

-- Step 1: Add client_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client' AND column_name = 'client_number'
    ) THEN
        ALTER TABLE client ADD COLUMN client_number VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Step 2: Add default_payment_terms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client' AND column_name = 'default_payment_terms'
    ) THEN
        ALTER TABLE client ADD COLUMN default_payment_terms VARCHAR(50) DEFAULT 'current_50';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'client' AND column_name IN ('client_number', 'default_payment_terms')
ORDER BY column_name;





