# 📋 Release Notes - VRM System

מדריך שינויים מלא בין כל גרסה וגרסה של מערכת ניהול הספקים (VRM).

---

## 📦 Version 2.2.0 - Client Management & QA Improvements
**Release Date:** 12/11/2025  
**Type:** Feature Enhancement & Code Cleanup

### 🎯 מה השתנה?

#### 🆕 ווידג'טים חדשים בפורטל הסניפים
- **RecentSalesWidget** - תצוגת דרישות תשלום אחרונות
  - טבלה מסודרת עם סטטוסים ויזואליים
  - תצוגת לקוח, מספר לקוח, סכום ותאריך עסקה
  - סטטוסים: ממתין לאישור, אושר - ממתין לתשלום, שולם
  
- **TransactionsWidget** - ווידג'ט תנועות כספיות מתקדם
  - תצוגה דו-כיוונית: תנועות נכנסות (לקבל) ויוצאות (לשלם)
  - מיון דינמי לפי עמודות (תאריך, סכום, סטטוס)
  - סינון לפי סטטוס
  - רענון דינמי מה-parent component

#### 📚 תיעוד QA מקיף
- **QA_PLAN_CLIENT_MANAGEMENT.md** - תוכנית בדיקות לניהול לקוחות
- **QA_PLAN_NEW_CLIENT_SALES_FLOW.md** - תוכנית בדיקות לזרימת מכירות לקוח חדש
- **QA_PLAN_SALES_APPROVAL.md** - תוכנית בדיקות לאישור מכירות
- **QA_TEST_PLAN_UPDATED.md** - תוכנית בדיקות מעודכנת
- **TESTING_PLAN_FIXES.md** - תיקונים בתוכנית הבדיקות
- **TESTING_SUMMARY.md** - סיכום בדיקות
- **QUICK_TEST_GUIDE.md** - מדריך בדיקות מהיר
- **CLIENT_PAYMENT_TERMS_MODULES.md** - תיעוד מודולי תנאי תשלום ללקוחות
- **NOTIFICATIONS_IMPROVEMENTS.md** - שיפורי מערכת התראות
- **FIX_SERVER_RESTART.md** - תיעוד תיקון הפעלה מחדש של השרת

#### 🔧 שיפורים טכניים
- שיפורי SalesApprovalWidget - תצוגה משופרת של אישורי מכירות
- שיפורי CreateSaleForm - יצירת מכירות משופרת
- שיפורי ClientRequestForm - טיפול טוב יותר בבקשות לקוחות
- שיפורי BranchClientManagement - ניהול לקוחות סניף משופר
- שיפורי NotificationsBell - התראות משופרות
- שיפורי PaymentFilters - סינון תשלומים משופר
- שיפורי TransactionDetailsModal - פרטי תנועה מפורטים יותר

#### 🧹 ניקוי קוד
- הסרת 30+ קבצי סקריפטים ישנים שלא בשימוש
- הסרת קבצי migration ישנים
- הסרת קבצי test ישנים
- הוספת `run-full-qa-tests.js` - סקריפט בדיקות QA מלא

#### 📊 סטטיסטיקות
- **81 קבצים** שונו
- **3,265 שורות** נוספו
- **4,317 שורות** הוסרו
- ניקוי נטו של **1,052 שורות** קוד

### 🏷️ Tags
- **v2.2.0** - יציב ומוכן לייצור

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
| **2.2.0** | 12/11/2025 | Feature Enhancement | Client management improvements, QA docs, code cleanup |
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

**Last Updated:** 12/11/2025  
**Maintained by:** VRM Development Team

