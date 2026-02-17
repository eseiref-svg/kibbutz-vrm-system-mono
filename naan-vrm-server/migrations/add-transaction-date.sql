-- Migration: Add transaction_date column to transaction table
-- This field stores the original date of the transaction (e.g., invoice date, sale date)
-- while due_date stores the calculated payment due date

-- Add the column (nullable initially for existing records)
ALTER TABLE transaction 
ADD COLUMN IF NOT EXISTS transaction_date DATE;

-- For existing records, set transaction_date = due_date as a reasonable default
-- (This assumes existing records have due_date set)
UPDATE transaction 
SET transaction_date = due_date 
WHERE transaction_date IS NULL AND due_date IS NOT NULL;

-- For records with no due_date, use current date
UPDATE transaction 
SET transaction_date = CURRENT_DATE 
WHERE transaction_date IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN transaction.transaction_date IS 'Original transaction date (invoice date, sale date, etc.)';
COMMENT ON COLUMN transaction.due_date IS 'Calculated payment due date based on payment terms';
