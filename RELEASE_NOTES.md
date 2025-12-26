# Release Notes - VRM System

מדריך שינויים מלא בין כל גרסה וגרסה של מערכת ניהול הספקים (VRM).

## Version 2.5.0 - Supplier Requests & Address Management
**Release Date:** 26/12/2025
**Type:** Feature & Infrastructure Refactoring

### שינויים עיקריים
- **בקשות ספקים (Board Workflow)** - יישום מלא של תהליך בקשת ספק חדש ע"י מנהל ענף ואישורו ע"י גזבר.
- **טבלת כתובות מרכזית** - יצירת טבלת `address` המרכזת את כל נתוני הכתובות במערכת (ספקים ולקוחות).
- **הרחבת טפסים** - הוספת שדות כתובת מלאים (עיר, רחוב, מספר, מיקוד) בטפסי `RequestSupplierForm` ו-`SupplierDetails`.
- **חיבור בקשות לכתובות** - קישור בקשות ספקים לטבלת הכתובות (Migration 011), כך שאישור בקשה יוצר אוטומטית ספק עם כתובת מקושרת.
- **Shared Helper** - שימוש ב-`addressHelper` לטיפול אחיד ביצירה ועדכון של כתובות בקוד השרת.
- **תאימות לאחור** - תמיכה בספקים ולקוחות קיימים ללא כתובות.

### שיפורים טכניים
- **Transactions** - שימוש בטרנזקציות (`BEGIN`, `COMMIT`, `ROLLBACK`) לשמירה על שלמות הנתונים בעת שמירת ספק/לקוח וכתובת.
- **Database Migrations** - סקריפטים `008` עד `011` לניהול שינויי הסכמה (Addresses, Timestamps, Nullable IDs, Request Addresses).

---

## Version 2.4.0 - Supplier Quality Rating
**Release Date:** 22/12/2025
**Type:** Feature

### שינויים עיקריים
- **Supplier Quality Rating & Control** - מערכת דירוג איכות לספקים.

---

## Version 2.3.0 - Hybrid Client Flow
**Release Date:** 22/12/2025
**Type:** Feature

### שינויים עיקריים
- **Hybrid Client/Payment Req flow** - זרימה היברידית לבקשות תשלום ולקוחות.

---

## Version 2.2.0 - Previous Release
**Release Date:** 2024-12-19

### Features
- **Client Management**: Enhanced client management capabilities.
- **QA Documentation**: Added QA sanity checks and documentation.
- **System Stability**: Various bug fixes and improvements.

#### שדרוג דשבורד גזבר (Treasurer Dashboard)
- **וידג'טים חדשים** - הוחלפו קוביות הסטטיסטיקה הכלליות בשלושה מדדים ממוקדים לניהול תזרים:
  - **חשבוניות באיחור - לתשלום**: תצוגת סך החובות לספקים שנמצאים בפיגור.
  - **חשבוניות באיחור - לקבלה**: מעקב אחר תשלומים מלקוחות שטרם התקבלו.
  - **מס״ב קרוב**: תאריך העברת המס״ב הקרובה (הזנה ידנית/אינטגרציה עתידית).

#### מערכת התראות (Notifications)
- **יישור קו UX** - הסרת דף "היסטוריית התראות" המיותר למנהלי ענפים לטובת עבודה ממוקדת דרך ה-"פעמון" (Notification Bell) בלבד.
- **אופטימיזציה** - שיפור מנגנון סימון "נקרא" ועדכון המונה בזמן אמת.

#### שיפורי ממשק נוספים
- **זיהוי לקוח** - הצגת **מספר לקוח (Client Number)** במקום מזהה פנימי בווידג'טים של ניהול לקוחות.
- **Code Cleanup** - הסרת הערות בעברית מהקוד לטובת סטנדרטיזציה.

#### שיפורי תשתית וקוד (Code & Infrastructure)
- **Shared Component** - פיתוח רכיב משותף (`TransactionInputSection`) המאחד את הלוגיקה (כולל חישוב תאריך פירעון) והעיצוב בין טפסי בקשת לקוח, דרישת תשלום, וכל טופס עתידי.
- **Single Source of Truth** - לוגיקת החישובים (מע"מ, תאריכי תשלום) מנוהלת במקום אחד בלבד, מה שמבטיח התנהגות אחידה בכל המערכת.
- **My Suppliers** - מנגנון חכם המציג אוטומטית ספקים פעילים ("הספקים שלי") בפורטל הענף לגישה מהירה ללא חיפוש.

---

## Version 2.1.0 - Monorepo Release
**Release Date:** 27/10/2025  
**Type:** Infrastructure Update

### מה השתנה?

#### מבנה פרויקט חדש
- **Monorepo Architecture** - איחוד הפרויקטים ל-repository אחד
- מבנה מסודר: `naan-vrm-server/` ו-`naan-vrm-client/`
- ניהול משותף של dependencies
- קל יותר לדפלוי ולתחזוקה

#### קבצים חדשים
- `README.md` - מדריך ראשי למערכת
- `OPERATION_GUIDE.md` - מדריך הפעלה מלא
- `RELEASE_NOTES.md` - מסמך זה
- `.gitignore` מעודכן למונורפו

#### ניקוי משני
- **Removed Development Artifacts**: Deleted `scripts/` directory in server, `backups/`, and loose script files (`create_test_users.js`, `verify_late_payments.js`, etc.) to minimize production footprint.
- **Removed User-Specific Files**: Cleaned up personal documents (`.docx`, `.pdf`) and temporary dumps from the repository root.

### Migration Guide
לאחר ששכפלת את המונורפו החדש:
```bash
cd kibbutz-vrm-system-mono
cd naan-vrm-server && npm install
cd ../naan-vrm-client && npm install
```

---

## Version 2.0.0 - Payment Monitoring System
**Release Date:** 26/10/2025  
**Type:** Major Feature Release

### תכונות חדשות עיקריות

#### מערכת ניטור תשלומים אוטומטית
- **מעקב אוטומטי יומי** - סריקה ב-02:00 כל לילה
- **התראות חכמות** - התראה 7 ימים לפני, ביום התשלום, ואחרי
- **דשבורד מלא** - תצוגת כל התשלומים הפתוחים
- **דוחות ואנליטיקה** - דוחות תזרים מזומנים מפורטים

#### דפים חדשים
- **דשבורד תשלומים** (`/payments`) - ניטור מרכזי
- **דוחות תשלומים** - אנליטיקה וצפי

#### שינויים טכניים
- הוספת `paymentMonitorService.js` - לוגיקת ניטור אוטומטי
- הוספת `alertService.js` - ניהול התראות
- 8 endpoints חדשים ב-API
- Migration למערכת ההתראות

### קבצים שעודכנו
- `server.js` - endpoints חדשים
- `alert` table - 3 עמודות חדשות
- רכיבי React חדשים למערכת תשלומים

---

## Version 1.1.0 - Enhanced Features
**Release Date:** 24/10/2025  
**Type:** Feature Enhancement

### תכונות חדשות

#### מערכת התראות מלאה
- הוספת רכיב `NotificationsBell`
- תמיכה בהתראות שלא נקראו
- סימון התראות כנקראו
- תצוגה ויזואלית משופרת

#### שיפורי Dashboard
- אינטגרציה עם מערכת התשלומים
- תצוגה טובה יותר של בקשות ספקים
- סטטיסטיקות משופרות

### שיפורים טכניים
- אופטימיזציה של API calls
- שיפור ביצועים
- תיקון בעיות styling

---

## Version 1.0.0 - Initial Release
**Release Date:** 23/10/2025  
**Type:** Initial Stable Release

### תכונות בסיסיות

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

### Tags
- **SERVER:** `v1.0.0` - יציב ומוכן לייצור
- **CLIENT:** `v1.0.0` - יציב ומוכן לייצור

---

## Versions Summary

| Version | Date | Type | Summary |
|---------|------|------|---------|
| **2.5.0** | 26/12/2025 | Feature | Supplier Requests & Centralized Addresses |
| **2.4.0** | 22/12/2025 | Feature | Supplier Quality Rating & Control |
| **2.3.0** | 22/12/2025 | Feature | Hybrid Client/Payment Req flow |
| **2.2.0** | 22/12/2025 | Feature | Smart payments, VAT, Dashboard & UX |
| **2.1.0** | 27/10/2025 | Infrastructure | Monorepo migration |
| **2.0.0** | 26/10/2025 | Major | Payment monitoring system |
| **1.1.0** | 24/10/2025 | Feature | Notifications & enhancements |
| **1.0.0** | 23/10/2025 | Initial | Stable release |

---

## Roadmap - תכונות עתידיות

### Planned Features
- התראות אימייל (נסיידר)
- SMS למועדים קריטיים
- אינטגרציה עם ERP (Priority/SAP)
- חיזוי תזרים מזומנים
- API לדוחות חיצוניים

### Known Issues
- אין בעיות ידועות

---

## Support

**Questions?** צור issue ב-GitHub  
**Bugs?** צור issue עם תיוג `bug`  
**Features?** צור issue עם תיוג `enhancement`

---

**Last Updated:** 26/12/2025  
**Maintained by:** VRM Development Team
