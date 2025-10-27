# 💰 Payment Monitoring & Automated Alerts

**Version:** 1.0.0  
**Release Date:** October 2025  
**Module:** Treasury Management System

---

## Overview

Automated payment tracking system that monitors all open invoices (supplier payments and client collections) and sends scheduled alerts to relevant users. The system runs daily at 02:00, identifying transactions requiring attention and notifying branch managers and treasury staff.

---

## Key Features

### 🔄 Automated Daily Monitoring
- Scans all open transactions (`status='open'`)
- Calculates days until/past payment due date
- Creates/updates alerts automatically
- Sends notifications to relevant users

### 🔔 Smart Alert System
Alert triggers based on payment timeline:

| Timeline | Alert Type | Severity | Notification |
|----------|-----------|----------|--------------|
| 7 days before | Initial reminder | Low | Branch manager + treasury |
| Due date (day 0) | Payment due today | Medium | Branch manager + treasury |
| Past due date | Overdue alert | High/Critical | Daily until resolved |

### 📊 Payment Dashboard (`/payments`)
- **Statistics Cards:** Overdue, due today, upcoming (7 days), total open
- **Tabbed View:** All payments / Overdue / Upcoming
- **Filters:** Branch, transaction type (payment/collection), status
- **Actions:** Mark as paid, manual check trigger, refresh data

### 📈 Payment Reports (`/payment-reports`)
- **Overdue by Branch:** Identifies branches with payment issues
- **Supplier Patterns:** Analyzes payment behavior trends
- **CSV Export:** For external analysis in Excel/BI tools

---

## Database Schema

### Enhanced `alert` Table

```sql
-- Original specification
CREATE TABLE "alert" (
    "alert_id" SERIAL PRIMARY KEY,
    "transaction_id" INTEGER NOT NULL
);

-- Payment monitoring enhancement
ALTER TABLE "alert" 
    ADD COLUMN "alert_type" VARCHAR(50),
    ADD COLUMN "severity" VARCHAR(20) CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
    ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW();
```

**Rationale:** Additional columns required for alert categorization, priority handling, and duplicate prevention.

---

## Installation & Setup

### Prerequisites
- PostgreSQL database with existing treasury schema
- Node.js backend running
- React frontend running

### Step 1: Install Dependencies
```bash
cd naan-vrm-server
npm install node-cron
```

### Step 2: Database Migration
Run the SQL migration script:
```bash
psql -U postgres -d naan_vrm -f migrations/001_update_alert_table.sql
```

Or execute manually in pgAdmin/SQL client.

### Step 3: Start Server
```bash
node server.js
```

Expected output:
```
Server is running on port 5000
🚀 Starting payment monitoring service...
✅ Payment monitor service started - runs daily at 02:00
```

### Step 4: Verify in Browser
1. Login as treasurer (`role_id = 2`)
2. Navigate to `/payments`
3. Click "הרץ בדיקה" (Run Check) button
4. Check notifications bell for new alerts

---

## User Guide

### For Treasury Staff

**Daily Workflow:**
1. Check payment dashboard upon login (`/payments`)
2. Review overdue transactions (red badges)
3. Process due-today payments (orange badges)
4. Monitor upcoming payments (yellow badges)
5. Mark transactions as paid when completed

**Key Actions:**
- **סמן כשולם** (Mark as Paid): Updates transaction status to 'paid', removes alert
- **הרץ בדיקה** (Run Check): Triggers manual monitoring cycle
- **רענן נתונים** (Refresh Data): Reloads dashboard statistics

### For Branch Managers

**Notifications:**
- Receive alerts 7 days before payment due date
- Receive reminder on payment due date
- Receive daily overdue alerts until resolved
- View all alerts in notifications bell (top-left)

**Portal View:**
- Branch-specific payment tracking
- Filtered view of branch transactions only
- Request supplier additions when needed

---

## API Endpoints

### Dashboard & Data
```http
GET /api/payments/dashboard?branchId=1    # Statistics summary
GET /api/payments/all?branchId=1          # All open transactions
GET /api/payments/overdue?branchId=1      # Overdue transactions
GET /api/payments/upcoming?branchId=1     # Upcoming (7 days)
PUT /api/payments/:id/mark-paid           # Mark transaction paid
POST /api/payments/run-check              # Manual monitoring trigger (treasurer only)
```

### Reports
```http
GET /api/payments/reports/overdue-by-branch    # Overdue report by branch
GET /api/payments/reports/supplier-patterns    # Supplier payment patterns
```

---

## Transaction Status Logic

| Status | Monitored | Alert Sent | Description |
|--------|-----------|-----------|-------------|
| `open` | ✅ Yes | ✅ Yes | Unpaid, actively monitored |
| `paid` | ❌ No | ❌ No | Paid, no further action |
| `frozen` | ❌ No | ❌ No | User-frozen, no alerts |
| `deleted` | ❌ No | ❌ No | Deleted record |

---

## Troubleshooting

### Issue: Cron job not running
**Solution:** 
- Verify `node-cron` installed: `npm install node-cron`
- Check server console for startup message
- Restart server: `node server.js`

### Issue: Alerts not appearing
**Solution:**
- Verify database migration ran successfully
- Check `alert` table has new columns: `alert_type`, `severity`, `created_at`
- Verify `branch_manager_id` set in `branch` table
- Check notifications table for records

### Issue: `/payments` page not loading
**Solution:**
- Clear browser cache
- Verify routes added to `App.js`
- Check browser console for errors
- Restart React dev server: `npm start`

---

## Technical Notes

### Cron Schedule
- **Expression:** `0 2 * * *`
- **Frequency:** Daily at 02:00 AM server time
- **Modification:** Edit `paymentMonitorService.js` line 27

### Alert Severity Rules
```javascript
if (daysOverdue > 30)  → 'critical'  // >1 month overdue
if (daysOverdue > 7)   → 'high'      // >1 week overdue
if (daysOverdue > 0)   → 'medium'    // Any overdue
if (daysOverdue === 0) → 'medium'    // Due today
if (daysUntilDue <= 7) → 'low'       // Upcoming reminder
```

### Code Style
- **Comments:** Minimal English comments in code
- **UI Messages:** Hebrew for all user-facing text
- **Naming:** English camelCase for functions/variables

---

## Future Enhancements

- [ ] Email notifications via `nodemailer`
- [ ] SMS alerts for critical overdue transactions
- [ ] Visual calendar for payment schedule
- [ ] Cash flow forecasting
- [ ] ERP system integration (Priority/SAP)
- [ ] WhatsApp Business API integration

---

## Release Notes Summary

**Feature:** Payment Monitoring & Automated Alerts  
**Type:** New Module  
**Impact:** High - Core treasury functionality

**What's New:**
- ✅ Automated daily monitoring of all open invoices
- ✅ Smart alert system (7-day advance, due date, overdue)
- ✅ Payment dashboard with real-time statistics
- ✅ Payment reports and analytics
- ✅ Branch-specific notifications
- ✅ One-click payment marking

**Database Changes:**
- Enhanced `alert` table with 3 new columns
- New indexes for performance optimization
- Updated `notifications` table structure

**User Experience:**
- New `/payments` dashboard page
- New `/payment-reports` analytics page
- Enhanced notifications system
- Color-coded priority badges

---

## Support

**Technical Issues:** support@kibbutz-naan.co.il  
**Documentation:** See `PAYMENT_MONITORING_SUMMARY.md` for detailed implementation  
**Updates:** Check `UPDATES_CHANGELOG.md` for version history

---

**Last Updated:** October 26, 2025  
**Document Version:** 1.0  
**System Version:** Compatible with Treasury Management System v2.0+
