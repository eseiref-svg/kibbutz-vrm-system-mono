# naan-vrm-server

Backend server for the VRM System - חלק מה-monorepo `kibbutz-vrm-system-mono`

## 📍 מיקום

השרת חייב לרוץ מתוך תיקייה זו: `naan-vrm-server/`

## 🚀 הפעלת השרת

### התקנת dependencies
```bash
cd naan-vrm-server
npm install
```

### הגדרת משתני סביבה

צור קובץ `.env` בתיקיית `naan-vrm-server/` (או העתק מ-`.env.example`):

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Zaq1Xsw2
DB_NAME=naan_vrm
JWT_SECRET=VRM_Super_Secret_Key_2024_!@#$%^&*()_Naan_Kibbutz_System
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### הפעלת השרת

```bash
npm start
```

השרת ירוץ על: `http://localhost:5000`

## 🗄️ חיבור ל-Database

השרת תומך בשתי סביבות:

1. **Development (מקומי)**: משתמש במשתני סביבה נפרדים (`DB_HOST`, `DB_USER`, וכו')
2. **Production (Railway)**: משתמש ב-`DATABASE_URL` (מוגדר אוטומטית על ידי Railway)

הקובץ `db.js` בודק אוטומטית איזו סביבה פעילה ומתחבר בהתאם.

## ✅ בדיקת תקינות

לאחר הפעלת השרת, בדוק:
- הודעת "✅ חיבור ל-DB הצליח!" בקונסול
- גש ל-`http://localhost:5000/health` לקבלת אישור שהשרת והמסד נתונים פעילים

## 📂 מבנה התיקייה

```
naan-vrm-server/
├── server.js              # קובץ השרת הראשי
├── db.js                  # תצורת חיבור למסד נתונים
├── package.json           # הגדרות הפרויקט
├── .env                   # משתני סביבה (לא בקוד!)
├── middleware/            # Middleware (authentication)
├── services/              # שירותים (payment monitoring, alerts)
└── migrations/            # migrations למסד הנתונים
```

## ⚠️ חשוב!

- השרת **חייב** לרוץ מתוך תיקיית `naan-vrm-server/`
- קובץ ה-`.env` חייב להיות בתיקיית `naan-vrm-server/`
- אל תעלה את קובץ ה-`.env` ל-git!

