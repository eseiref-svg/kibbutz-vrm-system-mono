-- Create client_request table for branch managers to request new clients
CREATE TABLE IF NOT EXISTS "client_request" (
    "request_id" SERIAL PRIMARY KEY,
    "branch_id" INTEGER NOT NULL,
    "requested_by_user_id" INTEGER NOT NULL,
    "client_id" INTEGER,
    "client_name" VARCHAR(150) NOT NULL,
    "poc_name" VARCHAR(150) NOT NULL,
    "poc_phone" VARCHAR(20) NOT NULL,
    "poc_email" VARCHAR(150),
    "city" VARCHAR(100),
    "street_name" VARCHAR(150),
    "house_no" VARCHAR(20),
    "zip_code" VARCHAR(20),
    
    -- Quote details (פרטי הצעת המחיר)
    "quote_value" DECIMAL(10, 2) NOT NULL,
    "payment_terms" VARCHAR(20) NOT NULL CHECK (payment_terms IN ('immediate', 'plus_30', 'plus_60', 'plus_90')),
    "quote_description" TEXT,
    
    -- Request status
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "reviewed_by_user_id" INTEGER,
    "review_notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP,
    
    -- Resulting client_id and sale_id after approval
    "approved_client_id" INTEGER,
    "approved_sale_id" INTEGER,
    
    CONSTRAINT "client_request_branch_id_foreign" 
        FOREIGN KEY("branch_id") REFERENCES "branch"("branch_id"),
    CONSTRAINT "client_request_client_id_foreign" 
        FOREIGN KEY("client_id") REFERENCES "client"("client_id"),
    CONSTRAINT "client_request_requested_by_user_id_foreign" 
        FOREIGN KEY("requested_by_user_id") REFERENCES "user"("user_id"),
    CONSTRAINT "client_request_reviewed_by_user_id_foreign" 
        FOREIGN KEY("reviewed_by_user_id") REFERENCES "user"("user_id"),
    CONSTRAINT "client_request_approved_client_id_foreign" 
        FOREIGN KEY("approved_client_id") REFERENCES "client"("client_id"),
    CONSTRAINT "client_request_approved_sale_id_foreign" 
        FOREIGN KEY("approved_sale_id") REFERENCES "sale"("sale_id")
);

-- Add index for faster queries
CREATE INDEX idx_client_request_status ON client_request(status);
CREATE INDEX idx_client_request_branch_id ON client_request(branch_id);

COMMENT ON TABLE "client_request" IS 'בקשות מנהלי ענפים לרישום לקוח חדש';
COMMENT ON COLUMN "client_request"."payment_terms" IS 'תנאי תשלום: immediate=מיידי, plus_30=+30 ימים, plus_60=+60 ימים, plus_90=+90 ימים';

