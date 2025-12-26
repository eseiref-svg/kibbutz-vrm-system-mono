-- Make address_id nullable for suppliers and clients
ALTER TABLE "supplier" ALTER COLUMN "address_id" DROP NOT NULL;
ALTER TABLE "client" ALTER COLUMN "address_id" DROP NOT NULL;
