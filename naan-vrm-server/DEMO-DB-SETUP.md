# DEMO – העתקת DB מלא לסביבת הדמו

## האם ה-DB הועתק אוטומטית?

**לא.** כשמשכפלים את תיקיית הפרויקט ל-DEMO, רק הקוד והקבצים מועתקים. בסיס הנתונים (PostgreSQL) נשאר **נפרד**. כדי שלסביבת DEMO יהיה עותק מלא של הנתונים, צריך להריץ תהליך העתקה (פעם אחת או whenever you want to refresh).

---

## איך לוודא ש-DEMO משתמשת ב-DB נפרד

1. **בסביבת DEMO** – קובץ `naan-vrm-server/.env` חייב להצביע על DB בשם **vrm_demo** (ולא naan_vrm):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vrm_demo
   DB_USER=postgres
   DB_PASSWORD=...
   ```
   אל תגדיר `DATABASE_URL` ב-DEMO (כדי שלא יתחבר ל-Railway).

2. **יצירת DB מקומי ל-DEMO** (פעם אחת, אם עדיין לא קיים):
   ```bash
   psql -U postgres -c "CREATE DATABASE vrm_demo;"
   ```
   אחרי זה להריץ מיגרציות על `vrm_demo` (אותו סכמה כמו ב-naan_vrm).

---

## שתי דרכים למלא את vrm_demo בנתונים

### אפשרות א: העתקה מהמקור המקומי (naan_vrm → vrm_demo)

מתאים כשהמקור שלך הוא **המחשב המקומי** (DB בשם `naan_vrm`).

1. **העתק את הסקריפט** מהמונו ל-DEMO (או הרץ מהמונו – הסקריפט מתחבר ל-localhost בשני ה-DBs):
   - מקור: `kibbutz-vrm-system-mono/naan-vrm-server/scripts/copy-local-to-demo.js`
   - יעד: `kibbutz-vrm-system-DEMO/naan-vrm-server/scripts/copy-local-to-demo.js`
   - או מהמונו: `copy copy-local-to-demo.js ..\kibbutz-vrm-system-DEMO\naan-vrm-server\scripts\`

2. הרץ מתוך תיקיית השרת של DEMO:
   ```bash
   cd c:\Users\eseir\kibbutz-vrm-system-DEMO\naan-vrm-server
   node scripts/copy-local-to-demo.js
   ```
   הסקריפט מתחבר ל-`naan_vrm` (מקור) ול-`vrm_demo` (יעד) ומעתיק את כל הטבלאות הרלוונטיות (כולל לקוחות, ספקים, דירוגים, דרישות תשלום, client_request, supplier_request, review, alert וכו').

### אפשרות ב: העתקה מ-Production (Railway → vrm_demo)

מתאים כשאתה רוצה שהדמו יהיה עותק של **ה-Production ב-Railway**.

ב-DEMO כבר קיימים סקריפטים:

- **copy-prod-to-demo.js** – משתמש ב-`pg_dump` מ-Railway ומשחזר ל-`vrm_demo` (עותק מלא כולל סכמה).
- **copy-prod-data.js** – מעתיק רק **נתונים** מ-Railway ל-`vrm_demo` (דרך Node + pg).

**חשוב:** אם אתה משתמש ב-`copy-prod-data.js`, וודא שהוא מעתיק את **כל** הטבלאות. הרשימה המלאה שצריכה להיות שם (לפי הסדר הנכון ל-FK):

```
supplier_field, address, balance, branch, "user", client, supplier,
transaction, payment_req, sale, notification, supplier_review, system_settings,
client_request, supplier_request, review, alert
```

אם חסרות טבלאות (למשל `client_request`, `supplier_request`, `review`, `alert`) – יש להוסיף אותן ל-`TABLES_TO_COPY` בתוך `copy-prod-data.js` באותו סדר.

---

## סיכום

| שאלה | תשובה |
|------|--------|
| האם שכפול התיקייה מעתיק גם את ה-DB? | **לא.** רק קוד וקבצים. |
| איך מקבלים עותק מלא של ה-DB ב-DEMO? | להריץ העתקה: **מקומי** → `copy-local-to-demo.js`, **מ-Railway** → `copy-prod-to-demo.js` או `copy-prod-data.js`. |
| האם DEMO משפיעה על ה-DB המקורי? | **לא**, כל עוד ב-DEMO מוגדר `DB_NAME=vrm_demo` ולא מתחברים ל-naan_vrm או ל-Railway. |

אחרי שהרצת את סקריפט ההעתקה המתאים, ב-`vrm_demo` יהיו כל הנתונים הרלוונטיים (לקוחות, ספקים, דירוגים, דרישות תשלום, בקשות וכו') והדמו יהיה מנותק מה-DB המקורי.
