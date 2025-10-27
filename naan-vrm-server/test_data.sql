-- Test Data for Payment Monitoring System
-- Run this SQL script to populate test data

-- Insert test addresses first
INSERT INTO address (street, city, postal_code, country) VALUES
('רחוב התעשייה 15', 'נען', '12345', 'ישראל'),
('שדרות החקלאות 8', 'נען', '12345', 'ישראל'),
('דרך הבנייה 12', 'נען', '12345', 'ישראל'),
('רחוב המזון 5', 'נען', '12345', 'ישראל'),
('שדרות התחבורה 20', 'נען', '12345', 'ישראל');

-- Insert test suppliers
INSERT INTO supplier (name, address_id, poc_name, poc_email, poc_phone, supplier_field_id, payment_terms_id, status, registry_date) VALUES
('ספק חקלאות נען', 1, 'דוד כהן', 'david@naan-agri.co.il', '050-1234567', 1, 1, 'pending', CURRENT_DATE),
('חברת שירותים כללית', 2, 'שרה לוי', 'sarah@services.co.il', '052-2345678', 2, 2, 'pending', CURRENT_DATE),
('מחסן חומרי בניין', 3, 'משה אברהם', 'moshe@building.co.il', '053-3456789', 3, 1, 'pending', CURRENT_DATE),
('ספק מזון ושתייה', 4, 'רחל גולד', 'rachel@food.co.il', '054-4567890', 4, 3, 'pending', CURRENT_DATE),
('חברת תחבורה', 5, 'יוסף כהן', 'yosef@transport.co.il', '055-5678901', 5, 2, 'pending', CURRENT_DATE);

-- Insert test payment terms
INSERT INTO payment_terms (eom, description) VALUES
(30, 'תשלום תוך 30 יום'),
(60, 'תשלום תוך 60 יום'),
(15, 'תשלום תוך 15 יום'),
(45, 'תשלום תוך 45 יום');

-- Insert test transactions (mix of overdue, due today, upcoming, and future)
INSERT INTO transaction (value, due_date, status) VALUES
-- Overdue transactions (past due date)
(-5000.00, CURRENT_DATE - INTERVAL '15 days', 'open'),
(-3200.00, CURRENT_DATE - INTERVAL '8 days', 'open'),
(-7500.00, CURRENT_DATE - INTERVAL '35 days', 'open'),
(-2100.00, CURRENT_DATE - INTERVAL '3 days', 'open'),

-- Due today
(-4500.00, CURRENT_DATE, 'open'),
(-2800.00, CURRENT_DATE, 'open'),

-- Upcoming (within 7 days)
(-3600.00, CURRENT_DATE + INTERVAL '2 days', 'open'),
(-4200.00, CURRENT_DATE + INTERVAL '5 days', 'open'),
(-1900.00, CURRENT_DATE + INTERVAL '7 days', 'open'),

-- Future payments
(-5500.00, CURRENT_DATE + INTERVAL '15 days', 'open'),
(-3800.00, CURRENT_DATE + INTERVAL '25 days', 'open'),

-- Some paid transactions (for comparison)
(-2200.00, CURRENT_DATE - INTERVAL '5 days', 'paid'),
(-3100.00, CURRENT_DATE - INTERVAL '10 days', 'paid');

-- Insert payment requests linking transactions to suppliers and branches
INSERT INTO payment_req (payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES
-- Overdue payments
(1001, 1, 1, 1, 1),  -- ספק חקלאות נען, ענף 1, 15 days overdue
(1002, 2, 2, 2, 2),  -- חברת שירותים כללית, ענף 2, 8 days overdue
(1003, 3, 1, 3, 1),  -- מחסן חומרי בניין, ענף 1, 35 days overdue
(1004, 4, 3, 4, 3),  -- ספק מזון ושתייה, ענף 3, 3 days overdue

-- Due today
(1005, 1, 2, 5, 1),  -- ספק חקלאות נען, ענף 2, due today
(1006, 5, 1, 6, 2),  -- חברת תחבורה, ענף 1, due today

-- Upcoming
(1007, 2, 3, 7, 1),  -- חברת שירותים כללית, ענף 3, 2 days
(1008, 3, 2, 8, 2),  -- מחסן חומרי בניין, ענף 2, 5 days
(1009, 4, 1, 9, 3),  -- ספק מזון ושתייה, ענף 1, 7 days

-- Future
(1010, 5, 3, 10, 1), -- חברת תחבורה, ענף 3, 15 days
(1011, 1, 2, 11, 2), -- ספק חקלאות נען, ענף 2, 25 days

-- Paid (for reference)
(1012, 2, 1, 12, 1), -- חברת שירותים כללית, ענף 1, paid
(1013, 3, 3, 13, 2); -- מחסן חומרי בניין, ענף 3, paid

-- Insert test sales (client collections)
INSERT INTO sale (transaction_id, client_id, branch_id) VALUES
(14, 1, 1),  -- Client 1, Branch 1
(15, 2, 2);  -- Client 2, Branch 2

-- Insert test clients
INSERT INTO client (name, address_id, poc_name, poc_phone, poc_email) VALUES
('לקוח עסקי גדול', 1, 'אבי ישראלי', '050-1111111', 'avi@bigclient.co.il'),
('חברת יבוא ויצוא', 2, 'מיכל רוזן', '050-2222222', 'michal@import.co.il');

-- Insert pending supplier requests (waiting for treasurer approval)
INSERT INTO supplier_requests (requested_by_user_id, branch_id, requested_supplier_id, supplier_name, poc_name, poc_email, poc_phone, supplier_field_id, new_supplier_field, status) VALUES
(2, 1, NULL, 'ספק חדש - חשמל ואלקטרוניקה', 'אלי חשמל', 'eli@electric.co.il', '050-3333333', 6, 'חשמל ואלקטרוניקה', 'pending'),
(3, 2, NULL, 'חברת ניקיון מקצועית', 'דנה נקי', 'dana@clean.co.il', '050-4444444', 7, 'ניקיון ושירותים', 'pending'),
(2, 3, NULL, 'ספק ציוד משרדי', 'רון משרד', 'ron@office.co.il', '050-5555555', 8, 'ציוד משרדי', 'pending'),
(4, 1, NULL, 'חברת אבטחה', 'בוטח שמירה', 'security@guard.co.il', '050-6666666', 9, 'אבטחה ושמירה', 'pending');

-- Insert additional supplier fields for the requests
INSERT INTO supplier_field (field, tags) VALUES
('חשמל ואלקטרוניקה', ARRAY['חשמל', 'אלקטרוניקה', 'תיקונים']),
('ניקיון ושירותים', ARRAY['ניקיון', 'שירותים', 'תחזוקה']),
('ציוד משרדי', ARRAY['משרד', 'ציוד', 'כלי כתיבה']),
('אבטחה ושמירה', ARRAY['אבטחה', 'שמירה', 'ביטחון']);

-- Update the supplier_requests with the correct supplier_field_id
UPDATE supplier_requests SET supplier_field_id = 6 WHERE supplier_name = 'ספק חדש - חשמל ואלקטרוניקה';
UPDATE supplier_requests SET supplier_field_id = 7 WHERE supplier_name = 'חברת ניקיון מקצועית';
UPDATE supplier_requests SET supplier_field_id = 8 WHERE supplier_name = 'ספק ציוד משרדי';
UPDATE supplier_requests SET supplier_field_id = 9 WHERE supplier_name = 'חברת אבטחה';

-- Insert test users (if not exist)
INSERT INTO "user" (first_name, surname, email, phone_no, password, permissions_id, status) VALUES
('גזבר', 'מערכת', 'treasurer@kibbutz-naan.co.il', '050-0000000', '$2b$10$example', 2, 'active'),
('מנהל', 'ענף1', 'manager1@kibbutz-naan.co.il', '050-1111111', '$2b$10$example', 1, 'active'),
('מנהל', 'ענף2', 'manager2@kibbutz-naan.co.il', '050-2222222', '$2b$10$example', 1, 'active'),
('מנהל', 'ענף3', 'manager3@kibbutz-naan.co.il', '050-3333333', '$2b$10$example', 1, 'active');

-- Insert test branches (if not exist)
INSERT INTO branch (name, manager_id, balance_id) VALUES
('ענף חקלאות', 2, 1),
('ענף תעשייה', 3, 2),
('ענף שירותים', 4, 3);

-- Insert test balances
INSERT INTO balance (debit, credit) VALUES
(100000.00, 50000.00),
(150000.00, 75000.00),
(80000.00, 40000.00);

-- Update branches with balance_id
UPDATE branch SET balance_id = 1 WHERE branch_id = 1;
UPDATE branch SET balance_id = 2 WHERE branch_id = 2;
UPDATE branch SET balance_id = 3 WHERE branch_id = 3;

-- Insert test addresses for clients
INSERT INTO address (street, city, postal_code, country) VALUES
('רחוב התעשייה 15', 'נען', '12345', 'ישראל'),
('שדרות החקלאות 8', 'נען', '12345', 'ישראל');

COMMIT;

-- Verify the test data
SELECT 'Test Data Summary:' as info;
SELECT 'Suppliers:' as type, COUNT(*) as count FROM supplier WHERE status = 'active';
SELECT 'Transactions:' as type, COUNT(*) as count FROM transaction;
SELECT 'Payment Requests:' as type, COUNT(*) as count FROM payment_req;
SELECT 'Pending Supplier Requests:' as type, COUNT(*) as count FROM supplier_requests WHERE status = 'pending';
SELECT 'Overdue Transactions:' as type, COUNT(*) as count FROM transaction WHERE due_date < CURRENT_DATE AND status = 'open';
SELECT 'Due Today:' as type, COUNT(*) as count FROM transaction WHERE due_date = CURRENT_DATE AND status = 'open';
SELECT 'Upcoming (7 days):' as type, COUNT(*) as count FROM transaction WHERE due_date BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days' AND status = 'open';
