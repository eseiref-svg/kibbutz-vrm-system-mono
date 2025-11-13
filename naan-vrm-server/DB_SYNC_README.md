# 🔄 מנגנון שכפול DB אוטומטי

מערכת אוטומטית, בטוחה ונוחה לשכפול DB מקומי ל-Railway Production.

---

## 🎯 מטרה

לאפשר שכפול מהיר ובטוח של מסד הנתונים המקומי למסד הנתונים הציבורי ב-Railway,  
כחלק מתהליך הפיתוח והבדיקות.

---

## ⚡ שימוש מהיר

```bash
cd naan-vrm-server
node db-sync-manager.js
```

**זהו!** הסקריפט ידריך אותך בכל השלבים.

---

## 📋 דרישות מקדימות

### 1. PostgreSQL Client Tools

הסקריפט דורש `pg_dump` לגיבוי ה-DB.

**התקנה:**
- **Windows (Chocolatey)**: `choco install postgresql`
- **Windows (Manual)**: הורד מ-[postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql-client`

### 2. קובץ .env

ודא שיש קובץ `.env` עם פרטי ה-DB המקומי:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=naan_vrm
```

### 3. DATABASE_URL של Railway

תצטרך את ה-DATABASE_URL הציבורי מ-Railway:
1. לך ל-[Railway Dashboard](https://railway.app)
2. בחר את הפרויקט
3. לך ל-PostgreSQL service → Variables
4. העתק את **DATABASE_PUBLIC_URL** (לא DATABASE_URL הפנימי!)

---

## 🔧 תהליך השכפול

הסקריפט מבצע 5 שלבים:

### 1️⃣ קבלת פרטי חיבור
- מחפש DATABASE_URL ב:
  - משתנה סביבה `RAILWAY_DATABASE_URL`
  - קובץ שמור `.railway-db-url`
  - קלט מהמשתמש (ושומר לפעם הבאה)

### 2️⃣ יצירת גיבוי מקומי
- יוצר גיבוי SQL מ-DB המקומי
- נשמר ב-`backups/local_db_export_YYYY-MM-DD_HH-mm-ss.sql`

### 3️⃣ גיבוי Railway (אופציונלי)
- יוצר גיבוי של Railway DB לפני השכתוב
- נשמר ב-`backups/railway_db_backup_YYYY-MM-DD_HH-mm-ss.sql`
- לשחזור במקרה של בעיה

### 4️⃣ שחזור ל-Railway
- מעתיק את כל הנתונים מה-SQL file ל-Railway
- מטפל בשגיאות קטנות אוטומטית

### 5️⃣ אימות
- בודק שמספר הטבלאות תואם
- מציג סיכום

---

## 🛡️ אבטחה

### מה מוגן?
- ✅ `.railway-db-url` **לא** נשמר ב-Git (`.gitignore`)
- ✅ קבצי גיבוי `.sql` **לא** נשמרים ב-Git
- ✅ `.env` **לא** נשמר ב-Git

### מה כדאי לעשות?
- 🔒 אל תשתף את ה-DATABASE_URL
- 🔒 אל תעלה קבצי גיבוי ל-Git
- 🔒 החלף סיסמאות בייצור באופן קבוע

---

## 📁 מבנה קבצים

```
naan-vrm-server/
├── db-sync-manager.js          # ← סקריפט ראשי
├── .railway-db-url             # ← שמור DATABASE_URL (לא ב-Git)
├── .env                        # ← פרטי DB מקומי (לא ב-Git)
├── backups/                    # ← תיקיית גיבויים
│   ├── local_db_export_*.sql  # גיבויים מקומיים
│   └── railway_db_backup_*.sql # גיבויי Railway
└── DB_SYNC_README.md           # ← מסמך זה
```

---

## 🔄 תרחישי שימוש

### תרחיש 1: שכפול רגיל (פיתוח)
```bash
node db-sync-manager.js
```

### תרחיש 2: שכפול עם DATABASE_URL חדש
```bash
# מחק את הקובץ השמור
rm .railway-db-url

# הרץ שוב
node db-sync-manager.js
```

### תרחיש 3: שחזור Railway מגיבוי
```bash
# אם משהו השתבש, שחזר מהגיבוי
psql "postgresql://..." -f backups/railway_db_backup_2025-11-12_21-30-00.sql
```

---

## 🐛 פתרון בעיות

### בעיה: "pg_dump לא נמצא"
**פתרון:** התקן PostgreSQL client tools (ראה "דרישות מקדימות")

### בעיה: "getaddrinfo ENOTFOUND postgres.railway.internal"
**פתרון:** השתמש ב-DATABASE_PUBLIC_URL (לא DATABASE_URL הפנימי)  
הכתובת הציבורית מכילה: `@trolley.proxy.rlwy.net` או דומה

### בעיה: "שגיאות בשחזור"
**פתרון:** רוב השגיאות ניתנות להתעלמות (constraints קיימים וכו')  
בדוק שהטבלאות והנתונים קיימים ב-Railway Dashboard

### בעיה: "relation does not exist"
**פתרון:** ה-schema לא מלא. הרץ migrations תחילה:
```bash
node run-migrations-railway.js
```

---

## 📊 סטטיסטיקות

| פעולה | זמן משוער |
|-------|-----------|
| גיבוי מקומי | 5-10 שניות |
| גיבוי Railway | 10-20 שניות |
| שחזור ל-Railway | 2-5 דקות |
| **סה"כ** | **~3-6 דקות** |

---

## 🚀 טיפים

1. **הרץ לפני deploy חדש** - ודא שהנתונים מעודכנים
2. **שמור גיבויים** - אל תמחק גיבויים ישנים מיד
3. **בדוק ב-Railway Dashboard** - אמת שהנתונים עודכנו
4. **בדוק באפליקציה** - התחבר ל-[אפליקציה](https://kibbutz-vrm-system-mono.vercel.app)

---

## 📞 תמיכה

- 📚 **תיעוד מלא**: ראה `DEPLOYMENT_CHECKLIST.md`
- 🐛 **בעיות**: צור issue ב-GitHub
- 💬 **שאלות**: פנה למפתח הראשי

---

**תאריך עדכון:** 13/11/2025  
**גרסה:** 1.0.0

