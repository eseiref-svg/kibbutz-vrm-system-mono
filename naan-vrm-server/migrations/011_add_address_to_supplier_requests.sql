-- Add address fields to supplier_requests
ALTER TABLE "supplier_requests" ADD COLUMN "city" VARCHAR(100);
ALTER TABLE "supplier_requests" ADD COLUMN "street_name" VARCHAR(150);
ALTER TABLE "supplier_requests" ADD COLUMN "house_no" VARCHAR(20);
ALTER TABLE "supplier_requests" ADD COLUMN "zip_code" VARCHAR(20);
