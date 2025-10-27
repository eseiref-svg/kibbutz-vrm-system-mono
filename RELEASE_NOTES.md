# 📋 Release Notes - VRM System

מדריך שינויים מלא בין כל גרסה וגרסה של מערכת ניהול הספקים (VRM).

---

## 📦 Version 2.1.0 - Monorepo Release
**Release Date:** 27/10/2025  
**Type:** Infrastructure Update

### 🎯 מה השתנה?

#### מבנה פרויקט חדש
- **Monorepo Architecture** - איחוד הפרויקטים ל-repository אחד
- מבנה מסודר: `naan-vrm-server/` ו-`naan-vrm-client/`
- ניהול משותף של dependencies
- קל יותר לדפלוי ולתחזוקה
- ניתן לתחזק גרסאות סינכרוניות של Client ו-Server

#### קבצים חדשים
- `README.md` - מדריך ראשי מלא למערכת
- `RELEASE_NOTES.md` - מסמך זה
- `.gitignore` מעודכן למונורפו

### 🔄 Migration Guide

לאחר ששכפלת את המונורפו החדש:
```bash
cd kibbutz-vrm-system-mono
cd naan-vrm-server && npm install
cd ../naan-vrm-client && npm install
```

---

## 📦 Version 2.0.0 - Payment Monitoring System
**Release Date:** 26/10/2025  
**Type:** Major Feature Release

### 🎉 תכונות חדשות עיקריות

#### 💰 מערכת ניטור תשלומים אוטומטית
- **מעקב אוטומטי יומי** - סריקה ב-02:00 כל לילה
- **התראות חכמות** - התראה 7 ימים לפני, ביום התשלום, ואחרי
- **דשבורד מלא** - תצוגת כל התשלומים הפתוחים
- **דוחות ואנליטיקה** - דוחות תזרים מזומנים מפורטים

#### 📊 דפים חדשים
- **דשבורד תשלומים** (`/payments`) - ניטור מרכזי
- **דוחות תשלומים** - אנליטיקה וצפי

#### 🔧 שינויים טכניים
- הוספת `paymentMonitorService.js` - לוגיקת ניטור אוטומטי
- הוספת `alertService.js` - ניהול התראות
- 8 endpoints חדשים ב-API
- Migration למערכת ההתראות

### 📝 קבצים שעודכנו
- `server.js` - endpoints חדשים
- `alert` table - 3 עמודות חדשות
- רכיבי React חדשים למערכת תשלומים

---

## 📦 Version 1.1.0 - Enhanced Features
**Release Date:** 24/10/2025  
**Type:** Feature Enhancement

### 🎉 תכונות חדשות

#### 🔔 מערכת התראות מלאה
- הוספת רכיב `NotificationsBell`
- תמיכה בהתראות שלא נקראו
- סימון התראות כנקראו
- תצוגה ויזואלית משופרת

#### 📊 שיפורי Dashboard
- אינטגרציה עם מערכת התשלומים
- תצוגה טובה יותר של בקשות ספקים
- סטטיסטיקות משופרות

### 🔧 שיפורים טכניים
- אופטימיזציה של API calls
- שיפור ביצועים
- תיקון בעיות styling

---

## 📦 Version 1.0.0 - Initial Release
**Release Date:** 23/10/2025  
**Type:** Initial Stable Release

### ✨ תכונות בסיסיות

#### Backend (Server)
- מערכת אימות JWT מלאה
- ניהול משתמשים ומספקים
- API מלא לכל הפעולות
- חיבור PostgreSQL

#### Frontend (Client)
- דשבורד מרכזי
- ניהול ספקים
- פורטל סניפים
- מערכת דוחות

### 🏷️ Tags
- **SERVER:** `v1.0.0` - יציב ומוכן לייצור
- **CLIENT:** `v1.0.0` - יציב ומוכן לייצור

---

## 🔄 Migration Instructions

### מ-GitHub נפרד למונורפו

אם יש לך את הפרויקטים הישנים:

```bash
# 1. שכפל את המונורפו החדש
git clone https://github.com/your-username/kibbutz-vrm-system-mono.git
cd kibbutz-vrm-system-mono

# 2. העתק את הקבצים מה-repositories הישנים
# (אופציונלי - אם יש שינויים שלא נשמרו)

# 3. התקן dependencies
cd naan-vrm-server && npm install
cd ../naan-vrm-client && npm install

# 4. הרץ את המערכת
npm start  # במונורפו החדש
```

---

## 📈 Versions Summary

| Version | Date | Type | Summary |
|---------|------|------|---------|
| **2.1.0** | 27/10/2025 | Infrastructure | Monorepo migration |
| **2.0.0** | 26/10/2025 | Major | Payment monitoring system |
| **1.1.0** | 24/10/2025 | Feature | Notifications & enhancements |
| **1.0.0** | 23/10/2025 | Initial | Stable release |

---

## 🔮 Roadmap - תכונות עתידיות

### Planned Features
- 📧 התראות אימייל (נסיידר)
- 📱 SMS למועדים קריטיים
- 🖥️ אינטגרציה עם ERP (Priority/SAP)
- 📊 חיזוי תזרים מזומנים
- 🔗 API לדוחות חיצוניים
- 🔐 Two-factor authentication
- 📱 אפליקציית מובייל

### Known Issues
- אין בעיות ידועות

---

## 📞 Support

**Questions?** צור issue ב-GitHub  
**Bugs?** צור issue עם תיוג `bug`  
**Features?** צור issue עם תיוג `enhancement`

---

**Last Updated:** 27/10/2025  
**Maintained by:** VRM Development Team

