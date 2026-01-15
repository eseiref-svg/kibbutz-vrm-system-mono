DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_request_payment_terms_check') THEN
        ALTER TABLE client_request DROP CONSTRAINT client_request_payment_terms_check;
    END IF;

    -- Add the new constraint with updated terms
    ALTER TABLE client_request 
    ADD CONSTRAINT client_request_payment_terms_check 
    CHECK (payment_terms IN ('immediate', 'current_15', 'current_35', 'current_50', 'plus_30', 'plus_60', 'plus_90'));
END $$;
