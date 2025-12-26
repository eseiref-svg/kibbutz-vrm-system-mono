-- 1. Create the Address table
CREATE TABLE IF NOT EXISTS "address" (
    "address_id" SERIAL PRIMARY KEY,
    "street" VARCHAR(150),
    "house_no" VARCHAR(20),
    "city" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "country" VARCHAR(50) DEFAULT 'Israel',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 2. Update Supplier table
-- check if column exists first to avoid error on re-run or do it in a transaction block
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplier' AND column_name='address_id') THEN
        ALTER TABLE "supplier" ADD COLUMN "address_id" INTEGER REFERENCES "address"("address_id");
    END IF;
END $$;

-- 3. Update Client table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client' AND column_name='address_id') THEN
        ALTER TABLE "client" ADD COLUMN "address_id" INTEGER REFERENCES "address"("address_id");
    END IF;
END $$;
