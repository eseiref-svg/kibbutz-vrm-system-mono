# תוכנית בדיקה ותיקון - תהליך חדש לקוחות ודרישות תשלום

## 📋 סיכום בעיות שזוהו ותוקנו

### בעיות קריטיות שזוהו:
1. ❌ **סטטוס 'pending_approval' לא קיים** - טבלת transaction מגבילה סטטוסים ל-`open`, `frozen`, `deleted`, `paid`
2. ❌ **שדה 'description' לא קיים** - הקוד מנסה להכניס `description` אבל השדה לא קיים בטבלה
3. ⚠️ **Import לא בשימוש** - `Select` component ב-SalesApprovalWidget

### תיקונים שבוצעו:
1. ✅ יצירת migration: `002_add_pending_approval_status.sql`
   - הוספת `pending_approval` ל-CHECK constraint
   - הוספת שדה `description` לטבלת transaction
2. ✅ יצירת סקריפט הרצה: `run-migration-pending-approval.sql`
3. ✅ הסרת import לא בשימוש מ-SalesApprovalWidget

---

## 🔧 שלב 1: הרצת Migration

### צעדים:
1. **התחבר למסד הנתונים:**
   ```bash
   psql -U postgres -d naan_vrm
   ```

2. **הרץ את ה-migration:**
   ```bash
   psql -U postgres -d naan_vrm -f naan-vrm-server/migrations/002_add_pending_approval_status.sql
   ```
   
   או:
   ```bash
   psql -U postgres -d naan_vrm -f naan-vrm-server/run-migration-pending-approval.sql
   ```

3. **וודא שהשינויים בוצעו:**
   ```sql
   -- בדוק את ה-CHECK constraint
   SELECT conname, pg_get_constraintdef(oid) 
   FROM pg_constraint 
   WHERE conrelid = 'transaction'::regclass 
     AND conname = 'transaction_status_check';
   
   -- בדוק את שדה description
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'transaction' 
     AND column_name = 'description';
   ```

**תוצאה צפויה:**
- ✅ CHECK constraint כולל `pending_approval`
- ✅ שדה `description` קיים בטבלה

---

## 🧪 שלב 2: בדיקת Endpoints בשרת

### 2.1: בדיקת POST /api/sales/request

**בדיקה ידנית:**
```bash
# התחבר כמנהל ענף וקבל token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"111222333"}'

# שמור את ה-token מהתגובה

# צור דרישת תשלום
curl -X POST http://localhost:5000/api/sales/request \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  -d '{
    "client_id": 1,
    "branch_id": 1,
    "value": 10000,
    "transaction_date": "2025-11-11",
    "description": "בדיקת QA"
  }'
```

**תוצאה צפויה:**
- ✅ Status: 201 Created
- ✅ Transaction נוצר עם status `pending_approval`
- ✅ Sale נוצר
- ✅ התראה נשלחה לגזבר

### 2.2: בדיקת GET /api/sales/pending-approval

```bash
# התחבר כגזבר
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"treasury@test.com","password":"111222333"}'

# קבל דרישות ממתינות
curl -X GET http://localhost:5000/api/sales/pending-approval \
  -H "x-auth-token: TREASURER_TOKEN"
```

**תוצאה צפויה:**
- ✅ Status: 200 OK
- ✅ רשימת דרישות תשלום עם status `pending_approval`
- ✅ כולל: client_name, branch_name, value, transaction_date, description

### 2.3: בדיקת PUT /api/sales/:id/approve

```bash
# אשר דרישת תשלום
curl -X PUT http://localhost:5000/api/sales/1/approve \
  -H "Content-Type: application/json" \
  -H "x-auth-token: TREASURER_TOKEN" \
  -d '{
    "payment_terms": "current_50",
    "invoice_number": "INV-2025-001"
  }'
```

**תוצאה צפויה:**
- ✅ Status: 200 OK
- ✅ Transaction status השתנה ל-`open`
- ✅ Transaction due_date חושב נכון (היום + 50 ימים)
- ✅ Sale payment_terms = `current_50`
- ✅ Sale invoice_number = `INV-2025-001`
- ✅ מנהל הענף קיבל התראה

---

## 🎨 שלב 3: בדיקת Frontend Components

### 3.1: בדיקת SalesApprovalWidget

**בדיקה ידנית:**
1. התחבר כגזבר (`treasury@test.com`)
2. עבור לדשבורד
3. מצא את הווידג'ט "דרישות תשלום ממתינות לאישור"

**תוצאה צפויה:**
- ✅ הווידג'ט מופיע בדשבורד
- ✅ מציג רשימת דרישות תשלום ממתינות
- ✅ כפתור "אשר" עובד
- ✅ טופס אישור נפתח עם:
  - בחירת תנאי תשלום (4 אופציות)
  - שדה מספר חשבונית
  - כפתור "אשר דרישת תשלום"

### 3.2: בדיקת CreateSaleForm

**בדיקה ידנית:**
1. התחבר כמנהל ענף
2. עבור ל"ניהול לקוחות ודרישות תשלום"
3. לחץ על לקוח קיים
4. מלא טופס דרישת תשלום

**תוצאה צפויה:**
- ✅ טופס מציג רק: סכום, תאריך עסקה, תיאור
- ✅ **אין** שדה תנאי תשלום
- ✅ שליחה עובדת

### 3.3: בדיקת ClientRequestForm

**בדיקה ידנית:**
1. התחבר כמנהל ענף
2. לחץ "בקשה ללקוח חדש"

**תוצאה צפויה:**
- ✅ טופס מציג רק פרטי לקוח
- ✅ **אין** שדות עסקה (סכום, תנאי תשלום)
- ✅ שליחה עובדת

---

## 🔄 שלב 4: בדיקה End-to-End מלאה

### תרחיש מלא:

#### שלב א': רישום לקוח חדש
1. מנהל ענף → "בקשה ללקוח חדש"
2. מלא פרטי לקוח → שלח
3. גזבר → אשר בקשה
4. ✅ לקוח נוצר במערכת

#### שלב ב': יצירת דרישת תשלום
1. מנהל ענף → בחר לקוח → "צור דרישת תשלום"
2. מלא: סכום=10000, תאריך=היום, תיאור="test"
3. שלח לאישור
4. ✅ דרישה נוצרה עם status `pending_approval`

#### שלב ג': אישור דרישת תשלום
1. גזבר → "דרישות תשלום ממתינות לאישור"
2. לחץ "אשר" על הדרישה
3. בחר: תנאי תשלום=`שוטף 50+`, חשבונית=`TEST-001`
4. אשר
5. ✅ דרישה אושרה, status=`open`, תאריך יעד=היום+50

#### שלב ד': בדיקת התוצאה
1. בדוק בטבלת transaction:
   ```sql
   SELECT * FROM transaction WHERE status = 'open' ORDER BY transaction_id DESC LIMIT 1;
   ```
2. בדוק בטבלת sale:
   ```sql
   SELECT * FROM sale ORDER BY sale_id DESC LIMIT 1;
   ```
3. ✅ הכל נכון!

---

## ✅ רשימת בדיקות מהירה (Checklist)

### Database:
- [ ] Migration הורץ בהצלחה
- [ ] CHECK constraint כולל `pending_approval`
- [ ] שדה `description` קיים בטבלת transaction

### Backend Endpoints:
- [ ] POST /api/sales/request - יוצר transaction עם `pending_approval`
- [ ] GET /api/sales/pending-approval - מחזיר דרישות ממתינות
- [ ] PUT /api/sales/:id/approve - מאשר ומעדכן status ל-`open`

### Frontend Components:
- [ ] SalesApprovalWidget מופיע בדשבורד
- [ ] CreateSaleForm - רק פרטי עסקה (ללא תנאי תשלום)
- [ ] ClientRequestForm - רק פרטי לקוח (ללא עסקה)

### End-to-End:
- [ ] תהליך רישום לקוח עובד
- [ ] תהליך יצירת דרישת תשלום עובד
- [ ] תהליך אישור דרישת תשלום עובד
- [ ] התראות נשלחות נכון

---

## 🐛 פתרון בעיות

### בעיה: Migration נכשל
**פתרון:**
```sql
-- בדוק אם ה-constraint קיים
SELECT * FROM pg_constraint WHERE conname = 'transaction_status_check';

-- אם קיים, מחק אותו ידנית
ALTER TABLE transaction DROP CONSTRAINT transaction_status_check;

-- הרץ שוב את ה-migration
```

### בעיה: Endpoint מחזיר שגיאה 500
**פתרון:**
1. בדוק את לוגי השרת
2. וודא שה-migration הורץ
3. בדוק שהשדות קיימים בטבלה

### בעיה: Frontend לא מציג דרישות
**פתרון:**
1. בדוק את console בדפדפן
2. וודא שה-API מחזיר נתונים
3. בדוק את הרשת (Network tab)

---

**תאריך יצירה**: 11/11/2025
**גרסה**: 1.0


