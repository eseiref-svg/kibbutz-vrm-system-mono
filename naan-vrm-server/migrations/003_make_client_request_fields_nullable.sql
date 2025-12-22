-- Migration: Make quote_value and payment_terms nullable in client_request table
-- Date: 2025-11-11
-- Description: Allow client requests to be created without transaction fields
--               This supports the new separated flow where client registration
--               and sales requests are separate processes

-- Step 1: Make quote_value nullable
ALTER TABLE client_request 
ALTER COLUMN quote_value DROP NOT NULL;

-- Step 2: Make payment_terms nullable
ALTER TABLE client_request 
ALTER COLUMN payment_terms DROP NOT NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_request'
  AND column_name IN ('quote_value', 'payment_terms')
ORDER BY column_name;





