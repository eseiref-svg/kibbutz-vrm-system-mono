-- Migration: Allow Null Request IDs (Fix Chicken & Egg problem)
-- Description:
--   1. Make supplier_requests.requested_supplier_id NULLABLE (for new suppliers)
--   2. Make client_request.client_id NULLABLE (for new clients)

-- 1. Supplier Requests
ALTER TABLE "supplier_requests" ALTER COLUMN "requested_supplier_id" DROP NOT NULL;

-- 2. Client Requests
ALTER TABLE "client_request" ALTER COLUMN "client_id" DROP NOT NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN "supplier_requests"."requested_supplier_id" IS 'NULL for new supplier requests, populated for updates to existing suppliers';
COMMENT ON COLUMN "client_request"."client_id" IS 'NULL for new client requests, populated for updates to existing clients';
