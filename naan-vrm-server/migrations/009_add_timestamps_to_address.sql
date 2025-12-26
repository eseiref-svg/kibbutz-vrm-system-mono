-- Add created_at and updated_at to address table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='address' AND column_name='created_at') THEN
        ALTER TABLE "address" ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='address' AND column_name='updated_at') THEN
        ALTER TABLE "address" ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW();
    END IF;
END $$;
