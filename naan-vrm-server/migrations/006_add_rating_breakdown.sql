ALTER TABLE review 
ADD COLUMN IF NOT EXISTS rate_quality INTEGER CHECK (rate_quality >= 1 AND rate_quality <= 5),
ADD COLUMN IF NOT EXISTS rate_time INTEGER CHECK (rate_time >= 1 AND rate_time <= 5),
ADD COLUMN IF NOT EXISTS rate_price INTEGER CHECK (rate_price >= 1 AND rate_price <= 5),
ADD COLUMN IF NOT EXISTS rate_service INTEGER CHECK (rate_service >= 1 AND rate_service <= 5);

COMMENT ON COLUMN review.rate IS 'Calculated average of quality, time, price, and service';
