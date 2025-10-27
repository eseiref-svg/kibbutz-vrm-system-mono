-- Migration: Update alert table structure

ALTER TABLE "alert" 
ADD COLUMN IF NOT EXISTS "alert_type" VARCHAR(50);

ALTER TABLE "alert" 
ADD COLUMN IF NOT EXISTS "severity" VARCHAR(20) 
CHECK ("severity" IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE "alert" 
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW();

UPDATE "alert" 
SET 
  "alert_type" = 'other',
  "severity" = 'low',
  "created_at" = NOW()
WHERE "alert_type" IS NULL;

ALTER TABLE "payment_req"
ADD COLUMN IF NOT EXISTS "payment_terms_id" INTEGER;

CREATE INDEX IF NOT EXISTS idx_transaction_status ON "transaction"("status");
CREATE INDEX IF NOT EXISTS idx_transaction_due_date ON "transaction"("due_date");
CREATE INDEX IF NOT EXISTS idx_transaction_alert_id ON "transaction"("alert_id");
CREATE INDEX IF NOT EXISTS idx_alert_transaction_id ON "alert"("transaction_id");
CREATE INDEX IF NOT EXISTS idx_alert_severity ON "alert"("severity");

ALTER TABLE "notifications"
ADD COLUMN IF NOT EXISTS "type" VARCHAR(20) DEFAULT 'info';

COMMENT ON TABLE "alert" IS 'התראות על אי-עמידה בתנאי תשלום';
COMMENT ON COLUMN "alert"."alert_type" IS 'סוג ההתראה: upcoming_payment, payment_due_today, payment_overdue';
COMMENT ON COLUMN "alert"."severity" IS 'חומרת ההתראה: low, medium, high, critical';

