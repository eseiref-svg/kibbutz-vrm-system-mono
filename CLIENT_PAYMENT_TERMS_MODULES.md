# חלוקת מודולים לפיצ'ר לקוחות ותנאי תשלום

## סקירה כללית
הפיצ'ר כולל ניהול לקוחות עם מספר לקוח ייחודי ותנאי תשלום ברירת מחדל, ושימוש בהם ביצירת ואישור דרישות תשלום.

---

## מודול 1: Client Display & Search Module
**מטרה:** הצגת וחיפוש לקוחות עם מספר לקוח ותנאי תשלום

### קבצים קיימים:
- `components/branch-portal/BranchClientManagement.js` - ניהול לקוחות למנהל ענף
- `components/clients/ClientSearch.js` - חיפוש לקוחות
- `components/clients/ClientDetailsCard.js` - פרטי לקוח

### משימות להשלמה:
1. ✅ **הצגת מספר לקוח** - הוספת עמודה/שדה להצגת `client_number`
2. ✅ **הצגת תנאי תשלום** - הוספת שדה להצגת `default_payment_terms` (תרגום לעברית)
3. ✅ **חיפוש לפי מספר לקוח** - הוספת אפשרות חיפוש ב-`ClientSearch`
4. ✅ **עדכון Backend** - וידוא ש-`/api/clients/search` מחזיר `client_number` ו-`default_payment_terms`

---

## מודול 2: Client Management Module
**מטרה:** ניהול פרטי לקוח כולל עדכון תנאי תשלום

### קבצים קיימים:
- `components/dashboard/ApproveClientModal.js` - אישור לקוח חדש (כולל client_number ו-payment_terms)
- `components/branch-portal/ClientRequestForm.js` - יצירת בקשה ללקוח חדש

### משימות להשלמה:
1. ✅ **עדכון תנאי תשלום** - יצירת modal/form לעדכון `default_payment_terms` של לקוח קיים
2. ✅ **עדכון Backend** - endpoint `PUT /api/clients/:id` לעדכון `default_payment_terms`
3. ✅ **הצגת מספר לקוח** - הוספת שדה read-only להצגת `client_number` ב-`ClientDetailsCard`

---

## מודול 3: Sale Request Creation Module
**מטרה:** יצירת דרישת תשלום עם שימוש אוטומטי בתנאי תשלום ברירת מחדל

### קבצים קיימים:
- `components/clients/CreateSaleForm.js` - טופס יצירת דרישת תשלום

### משימות להשלמה:
1. ⚠️ **שימוש ב-default_payment_terms** - טעינת `default_payment_terms` של הלקוח והצגתו כהצעה (read-only או editable)
2. ⚠️ **עדכון Backend** - וידוא ש-`POST /api/sales/request` מקבל `payment_terms` (אופציונלי, אם לא נשלח - משתמש ב-default)
3. ✅ **הצגת מידע** - הוספת הודעה/הצגה של תנאי התשלום המוצע

---

## מודול 4: Sale Approval Module
**מטרה:** אישור דרישת תשלום עם שימוש בתנאי תשלום ברירת מחדל

### קבצים קיימים:
- `components/dashboard/SalesApprovalWidget.js` - ווידג'ט אישור דרישות תשלום

### משימות להשלמה:
1. ⚠️ **שימוש ב-default_payment_terms** - טעינת `default_payment_terms` של הלקוח והצגתו כברירת מחדל בטופס האישור
2. ⚠️ **עדכון Backend** - וידוא ש-`GET /api/sales/pending-approval` מחזיר `client_default_payment_terms`
3. ✅ **הצגת מידע** - הוספת עמודה/הודעה המציגה את תנאי התשלום המוצע

---

## מודול 5: Payment Terms Utilities Module
**מטרה:** פונקציות עזר לטיפול בתנאי תשלום

### קבצים חדשים ליצירה:
- `utils/paymentTerms.js` - פונקציות עזר:
  - `formatPaymentTerms(paymentTerms)` - תרגום לעברית
  - `getPaymentTermsOptions()` - רשימת אפשרויות
  - `calculateDueDate(transactionDate, paymentTerms)` - חישוב תאריך פירעון

### משימות להשלמה:
1. ✅ **יצירת קובץ עזר** - `utils/paymentTerms.js`
2. ✅ **תרגום לעברית** - פונקציה להצגת תנאי תשלום בעברית
3. ✅ **שימוש במודול** - שימוש בפונקציות בכל הקבצים הרלוונטיים

---

## סדר עבודה מוצע:

### שלב 1: Utilities & Display (מודול 5 + חלק ממודול 1)
- יצירת `utils/paymentTerms.js`
- עדכון הצגת לקוחות להציג `client_number` ו-`default_payment_terms`
- עדכון Backend להחזיר את השדות

### שלב 2: Sale Request Creation (מודול 3)
- עדכון `CreateSaleForm` להשתמש ב-`default_payment_terms`
- עדכון Backend לקבל `payment_terms` (אופציונלי)

### שלב 3: Sale Approval (מודול 4)
- עדכון `SalesApprovalWidget` להשתמש ב-`default_payment_terms` כברירת מחדל
- עדכון Backend להחזיר `client_default_payment_terms`

### שלב 4: Client Management (מודול 2)
- יצירת modal לעדכון `default_payment_terms`
- עדכון Backend עם endpoint לעדכון

### שלב 5: Search Enhancement (השלמת מודול 1)
- הוספת חיפוש לפי `client_number`

---

## הערות טכניות:

### Backend Changes Needed:
1. `GET /api/clients/search` - להוסיף `client_number`, `default_payment_terms` ל-SELECT
2. `GET /api/sales/pending-approval` - להוסיף JOIN ל-`client` ולהחזיר `client_default_payment_terms`
3. `POST /api/sales/request` - לקבל `payment_terms` (אופציונלי), אם לא נשלח - לקחת מ-`client.default_payment_terms`
4. `PUT /api/clients/:id` - endpoint חדש לעדכון `default_payment_terms`

### Frontend Changes Needed:
1. כל מקום שמציג לקוח - להוסיף `client_number`
2. כל מקום שמציג תנאי תשלום - להשתמש ב-`formatPaymentTerms()`
3. `CreateSaleForm` - לטעון `default_payment_terms` ולהציגו
4. `SalesApprovalWidget` - לטעון `default_payment_terms` ולהשתמש בו כברירת מחדל

