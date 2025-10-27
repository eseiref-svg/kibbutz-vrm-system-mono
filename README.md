# VRM System - Monorepo

מערכת ניהול ספקים (Vendor Relationship Management) מלאה במונורפו - כולל Frontend ו-Backend באותו repository.

## 📋 תוכן עניינים
- [מבנה המערכת](#מבנה-המערכת)
- [התקנה מהירה](#התקנה-מהירה)
- [הגדרת מסד נתונים](#הגדרת-מסד-נתונים)
- [הרצת המערכת](#הרצת-המערכת)
- [תכונות עיקריות](#תכונות-עיקריות)
- [תיעוד](#תיעוד)

## 📁 מבנה המערכת

```
kibbutz-vrm-system-mono/
├── naan-vrm-server/           # Backend API (Node.js + Express)
│   ├── server.js             # נקודת הכניסה של השרת
│   ├── db.js                 # הגדרות PostgreSQL
│   ├── middleware/           # Middleware (auth, etc.)
│   ├── services/             # שירותי מערכת (alerts, payments)
│   └── migrations/           # מיגרציות מסד נתונים
│
├── naan-vrm-client/           # Frontend (React + Tailwind CSS)
│   ├── src/
│   │   ├── pages/            # עמודים
│   │   ├── components/       # רכיבי React
│   │   ├── context/          # Context API
│   │   └── api/              # הגדרות Axios
│   └── public/               # קבצים סטטיים
│
├── RELEASE_NOTES.md          # היסטוריית שינויים
└── README.md                 # מדריך זה
```

## 🚀 התקנה מהירה

### 1. שכפול ה-Repository
```bash
git clone https://github.com/your-username/kibbutz-vrm-system-mono.git
cd kibbutz-vrm-system-mono
```

### 2. התקנת Dependencies

**Backend:**
```bash
cd naan-vrm-server
npm install
```

**Frontend:**
```bash
cd ../naan-vrm-client
npm install
```

## 🗄️ הגדרת מסד נתונים

### 1. יצירת מסד נתונים PostgreSQL

```bash
# התחבר ל-PostgreSQL
psql -U postgres

# צור מסד נתונים חדש
CREATE DATABASE vrm_system;

# צא
\q
```

### 2. הגדרת Connection String

ערוך את הקובץ `naan-vrm-server/db.js`:
```javascript
const connectionString = 'postgresql://username:password@localhost:5432/vrm_system';
```

### 3. ייבוא סכמת מסד הנתונים

אם יש לך קובץ schema:
```bash
psql -U postgres -d vrm_system -f schema.sql
```

## 🏃 הרצת המערכת

### מצב פיתוח (Development)

**Terminal 1 - Backend:**
```bash
cd naan-vrm-server
npm start
# Server רץ על: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd naan-vrm-client
npm start
# Client רץ על: http://localhost:3000
```

הדפדפן יפתח אוטומטית ב-`http://localhost:3000`

### מצב ייצור (Production)

**בניית ה-Client:**
```bash
cd naan-vrm-client
npm run build
```

**הרצת ה-Server עם Production Build:**
```bash
cd ../naan-vrm-server
NODE_ENV=production npm start
```

## 🎯 תכונות עיקריות

### Backend (naan-vrm-server)
- ✅ מערכת אימות JWT מלאה
- ✅ ניהול משתמשים ורמות הרשאות
- ✅ ניהול ספקים מלא
- ✅ מערכת תשלומים וניטור
- ✅ מערכת התראות אוטומטית
- ✅ API מלא לכל הפעולות
- ✅ Job Scheduler (node-cron) לניטור תשלומים

### Frontend (naan-vrm-client)
- ✅ דשבורד מרכזי עם סטטיסטיקות
- ✅ ניהול ספקים מלא
- ✅ פורטל סניפים
- ✅ מערכת תשלומים וניטור
- ✅ דוחות מתקדמים עם תרשימים
- ✅ מערכת התראות בזמן אמת
- ✅ ניהול משתמשים ורמות הרשאות
- ✅ עיצוב מודרני עם Tailwind CSS

## 📚 תיעוד

| קובץ | תיאור |
|------|-------|
| **RELEASE_NOTES.md** | היסטוריית גרסאות ושינויים |
| **naan-vrm-server/PAYMENT_MONITORING_README.md** | מדריך מערכת ניטור התשלומים |

## 🔐 רמות הרשאות

המערכת תומכת ב-4 רמות הרשאות:

1. **Admin** (permissions_id: 1) - גישה מלאה לכל המערכת
2. **Treasurer** (permissions_id: 2) - גזבר, ניהול תשלומים
3. **Branch Manager** (permissions_id: 3) - מנהל סניף
4. **User** (permissions_id: 4) - משתמש רגיל

## 🏷️ גרסאות

צפה ב-[RELEASE_NOTES.md](RELEASE_NOTES.md) להיסטוריה מלאה.

- **v2.1.0** - מונורפו Architecture
- **v2.0.0** - מערכת ניטור תשלומים
- **v1.1.0** - מערכת התראות
- **v1.0.0** - גרסה ראשונית

## 🛠️ טכנולוגיות

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- node-cron

### Frontend
- React 18
- Tailwind CSS
- Chart.js
- Axios
- React Router

## 🐛 פתרון בעיות

### Server לא מתחיל
```bash
# בדוק שהפורט 5000 פנוי
netstat -an | findstr :5000

# בדוק את Connection String ב-db.js
```

### Client לא נטען
```bash
cd naan-vrm-client
rm -rf node_modules build
npm install
npm start
```

### בעיות מסד נתונים
```bash
# בדוק חיבור ל-PostgreSQL
psql -U postgres -d vrm_system

# אם לא עובד:
# 1. ודא ש-PostgreSQL רץ
# 2. בדוק את ה-connection string ב-db.js
# 3. בדוק הרשאות משתמש במסד הנתונים
```

## 📞 יצירת קשר ותמיכה

- **GitHub Issues:** דיווח על בעיות או בקשות תכונות
- **תיעוד נוסף:** קרא את קבצי ה-README הפנימיים

## 📝 רישיון

ISC License

---

**אחראי:** צוות VRM  
**גרסה:** 2.1.0  
**עודכן לאחרונה:** 2025
