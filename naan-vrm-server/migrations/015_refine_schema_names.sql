-- Migration: Refine schema names for consistency (singular tables, specific request IDs)

-- 1. Rename 'notifications' to 'notification'
ALTER TABLE IF EXISTS "notifications" RENAME TO "notification";

-- 2. Rename 'supplier_requests' to 'supplier_request'
ALTER TABLE IF EXISTS "supplier_requests" RENAME TO "supplier_request";

-- 3. Rename 'request_id' to 'client_req_id' in 'client_request'
ALTER TABLE "client_request" RENAME COLUMN "request_id" TO "client_req_id";

-- 4. Rename 'request_id' to 'supplier_req_id' in 'supplier_request'
ALTER TABLE "supplier_request" RENAME COLUMN "request_id" TO "supplier_req_id";

-- Update comments to reflect changes
COMMENT ON TABLE "notification" IS 'התראות מערכת למשתמשים';
COMMENT ON TABLE "supplier_request" IS 'בקשות להוספת ספק חדש';
