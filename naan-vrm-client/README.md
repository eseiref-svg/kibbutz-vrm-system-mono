# naan-vrm-client

Frontend React application for the VRM System - חלק מה-monorepo `kibbutz-vrm-system-mono`

## 📍 מיקום

הקליינט חייב לרוץ מתוך תיקייה זו: `naan-vrm-client/`

## 🚀 הפעלת הקליינט

### התקנת dependencies
```bash
cd naan-vrm-client
npm install
```

### הגדרת משתני סביבה

צור קובץ `.env` בתיקיית `naan-vrm-client/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**חשוב**: עבור Production (Vercel), משתנה הסביבה `REACT_APP_API_URL` מוגדר ב-Vercel Dashboard ולא בקובץ `.env`.

### הפעלת הקליינט

```bash
npm start
```

האפליקציה תרוץ על: `http://localhost:3000`

## 🔗 חיבור לשרת (Backend)

הקליינט מתחבר לשרת דרך:
- **Development**: `http://localhost:5000/api` (מוגדר ב-`.env`)
- **Production**: כתובת השרת ב-Vercel Dashboard

הקובץ `src/api/axiosConfig.js` מגדיר את חיבור ה-axios ומטפל בהזרקת ה-token אוטומטית לכל בקשה.

## ✅ בדיקת תקינות

לאחר הפעלת הקליינט:
1. ודא שהשרת רץ על `http://localhost:5000`
2. פתח את הדפדפן ב-`http://localhost:3000`
3. נסה להתחבר עם:
   - Email: `admin@naan.com`
   - Password: `111222333`

## 📂 מבנה התיקייה

```
naan-vrm-client/
├── src/
│   ├── api/
│   │   └── axiosConfig.js      # תצורת axios וחיבור לשרת
│   ├── components/             # קומפוננטות React
│   ├── context/                # React Context (Auth)
│   ├── pages/                  # דפי האפליקציה
│   ├── App.js                  # קומפוננטה ראשית
│   └── index.js                # נקודת כניסה
├── public/                     # קבצים סטטיים
├── package.json                # הגדרות הפרויקט
└── .env                        # משתני סביבה (לא בקוד!)
```

## 🎨 טכנולוגיות

- **React 18.2.0** - ספריית UI
- **React Router** - ניהול ניווט
- **Material-UI (MUI)** - ספריית UI components
- **Axios** - בקשות HTTP
- **Chart.js** - גרפים וויזואליזציות
- **Tailwind CSS** - עיצוב

## ⚠️ חשוב!

- הקליינט **חייב** לרוץ מתוך תיקיית `naan-vrm-client/`
- קובץ ה-`.env` חייב להיות בתיקיית `naan-vrm-client/`
- אל תעלה את קובץ ה-`.env` ל-git!
- ודא שהשרת רץ לפני הפעלת הקליינט

## 📦 בנייה ל-Production

```bash
npm run build
```

זה יוצר תיקיית `build/` עם הקבצים המוכנים לפריסה ב-Vercel.

## 🧪 הרצת בדיקות

```bash
npm test
```

## 📝 Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**⚠️ One-way operation!** Ejects from Create React App (not recommended)
