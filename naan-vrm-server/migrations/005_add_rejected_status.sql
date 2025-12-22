-- Add 'rejected' status to transaction table
-- First, check what statuses exist
DO $$ 
BEGIN
    -- Drop the old constraint
    ALTER TABLE transaction DROP CONSTRAINT IF EXISTS transaction_status_check;
    
    -- Add the new constraint with all statuses
    ALTER TABLE transaction 
    ADD CONSTRAINT transaction_status_check 
    CHECK (status IN ('open', 'paid', 'cancelled', 'pending_approval', 'rejected'));
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'Some transactions have invalid status values. Showing them:';
        RAISE NOTICE '%', (SELECT string_agg(DISTINCT status, ', ') FROM transaction WHERE status NOT IN ('open', 'paid', 'cancelled', 'pending_approval', 'rejected'));
END $$;

