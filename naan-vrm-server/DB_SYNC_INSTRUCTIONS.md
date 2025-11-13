# 📋 הוראות שכפול DB מקומי ל-Railway

## 🎯 מטרה
שכפול מסד הנתונים המקומי (Local DB) למסד הנתונים הציבורי ב-Railway.

---

## 📝 לפני שמתחילים

### 1. קבלת DATABASE_URL מ-Railway

1. **לך ל-Railway Dashboard**: https://railway.app
2. **בחר את הפרויקט שלך**: `truthful-recreation-production`
3. **לך ל-PostgreSQL service** (השירות של מסד הנתונים)
4. **לחץ על "Variables"** או **"Connect"**
5. **העתק את `DATABASE_URL`**
   - זה נראה כמו: `postgresql://user:password@host:port/database`

**⚠️ חשוב:** שמור את ה-DATABASE_URL במקום בטוח!

---

## 🚀 שימוש בסקריפט

### אפשרות 1: סקריפט פשוט (מומלץ)

```powershell
cd naan-vrm-server
.\sync-local-db-to-railway-simple.ps1 -RailwayDatabaseUrl "postgresql://..."
```

**דוגמה:**
```powershell
.\sync-local-db-to-railway-simple.ps1 -RailwayDatabaseUrl "postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### אפשרות 2: סקריפט מלא (עם אפשרויות נוספות)

```powershell
# שכפול רגיל
.\sync-local-db-to-railway.ps1 -RailwayDatabaseUrl "postgresql://..."

# Dry run (בלי לבצע שינויים)
.\sync-local-db-to-railway.ps1 -RailwayDatabaseUrl "postgresql://..." -DryRun

# דילוג על גיבוי (אם כבר יש גיבוי)
.\sync-local-db-to-railway.ps1 -RailwayDatabaseUrl "postgresql://..." -SkipBackup
```

---

## ⚠️ אזהרות חשובות

1. **זה ימחק את כל הנתונים הקיימים ב-Railway DB!**
   - ודא שיש לך גיבוי של ה-DB הציבורי לפני השכפול
   - או שזה בדיוק מה שאתה רוצה לעשות

2. **ודא שהקוד החדש כבר מפולט**
   - אם יש שינויים ב-schema, ודא שהם כבר ב-Railway
   - אחרת עלולים להיות שגיאות

3. **זמן ביצוע**
   - שכפול יכול לקחת כמה דקות (תלוי בגודל ה-DB)
   - אל תסגור את הטרמינל במהלך השכפול

---

## 📋 תהליך השכפול

הסקריפט מבצע:

1. **גיבוי DB מקומי**
   - יוצר קובץ `.sql` בתיקיית `backups/`
   - שם הקובץ: `local_db_export_YYYY-MM-DD_HH-mm-ss.sql`

2. **שחזור ל-Railway**
   - מעתיק את כל הטבלאות והנתונים
   - מחליף את כל הנתונים הקיימים

---

## ✅ אחרי השכפול

1. **בדוק ב-Railway Dashboard**
   - לך ל-PostgreSQL service → Data
   - ודא שהטבלאות והנתונים קיימים

2. **בדוק את האפליקציה**
   - לך ל: https://kibbutz-vrm-system-mono.vercel.app
   - התחבר ובדוק שהכל עובד

3. **בדוק את ה-API**
   - לך ל: https://truthful-recreation-production.up.railway.app/health
   - ודא שהשרת עובד

---

## 🔧 פתרון בעיות

### שגיאה: "pg_dump לא נמצא"
**פתרון:** התקן PostgreSQL client tools:
- Windows: https://www.postgresql.org/download/windows/
- או דרך Chocolatey: `choco install postgresql`

### שגיאה: "קובץ .env לא נמצא"
**פתרון:** ודא שיש קובץ `.env` בתיקיית `naan-vrm-server/` עם:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=naan_vrm
```

### שגיאה בחיבור ל-Railway
**פתרון:**
- ודא שה-DATABASE_URL נכון
- ודא שיש חיבור לאינטרנט
- בדוק ב-Railway Dashboard שהשירות פעיל

### שגיאות foreign key או constraints
**פתרון:**
- ייתכן שיש בעיות ב-schema
- בדוק את ה-logs של הסקריפט
- ייתכן שצריך להריץ migrations לפני השכפול

---

## 📞 תמיכה

אם יש בעיות:
1. בדוק את ה-logs של הסקריפט
2. בדוק את Railway logs: Railway Dashboard → Deployments → Logs
3. בדוק את ה-DB ב-Railway Dashboard → Database → Data

---

**תאריך עדכון:** 12/11/2025  
**גרסה:** 1.0


