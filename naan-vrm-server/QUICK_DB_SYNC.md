# ⚡ שכפול DB מהיר

## שימוש מהיר

```bash
cd naan-vrm-server
node db-sync-complete-auto.js
```

## מה זה עושה?

1. ✅ מתחבר ל-DB מקומי ו-Railway
2. ✅ מוחק את כל הטבלאות ב-Railway
3. ✅ יוצר schema מחדש
4. ✅ מעתיק את כל הנתונים
5. ✅ מאמת שהכל עבד

## פעם ראשונה?

הסקריפט יבקש ממך DATABASE_URL של Railway:
1. לך ל-[Railway Dashboard](https://railway.app)
2. בחר: truthful-recreation-production
3. PostgreSQL service → Variables
4. העתק: DATABASE_PUBLIC_URL

הסקריפט ישמור אותו לפעמים הבאות.

## כמה זמן זה לוקח?

- טבלאות קטנות (< 100 שורות): **~30 שניות**
- טבלאות בינוניות (100-1000 שורות): **~2 דקות**
- טבלאות גדולות (1000+ שורות): **~5 דקות**

## בעיות?

- ❌ **"Cannot find module"** → ודא שאתה ב-`naan-vrm-server/`
- ❌ **"Connection failed"** → בדוק את DATABASE_URL
- ❌ **"שגיאות בשחזור"** → בדוק שה-schema תקין

---

**עודכן:** 13/11/2025

