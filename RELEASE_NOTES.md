# Release Notes - VRM System

מדריך שינויים מלא בין כל גרסה וגרסה של מערכת ניהול הספקים (VRM).

## Version 2.2.0 - Payment Logic & UX Enhancements


#### דרישת תשלום מספק (Supplier Payment Request)
- **יצירת דרישת תשלום** - מנהלי ענף יכולים ליצור דרישת תשלום לספק קיים ישירות מכרטיס הספק, הכוללת סכום, תאריך יעד, ומספר חשבונית/תיאור.
- **תהליך אישור גזבר** - התווסף מנגנון אישור ייעודי בדשבורד הגזבר עבור דרישות תשלום מספקים (לצד אישור מכירות ללקוחות).
- **מעקב ובקרה** - דרישות תשלום שאושרו נכנסות אוטומטית למעקב התשלומים (סטטוס 'Open') והוצאות הענף.


#### דירוג איכות ספקים (Quality Rating)
- **מערכת דירוג** - הוספת אפשרות לדרג ספקים (1-5 כוכבים) בכרטיס הספק תחת לשונית "ביצועים ודירוג".
- **התראות בזמן אמת (Active Alerting)** - מנגנון **Monitoring** המזהה ירידה בממוצע הדירוג של ספק מתחת ל-3.0 ושולח התראה מיידית לגזבר ולמנהלי המערכת.
- **דשבורד חשבונאי** - הוספת וידג'ט **"ספקים בסיכון"** בדשבורד הגזבר המרכז את כל הספקים בעלי ציון נמוך הדורשים בחינה מחדש.


#### תהליך רישום לקוח אחוד (Hybrid Flow)
- **טופס רישום משודרג** - הוספת אפשרות להזין **פרטי הצעת מחיר** (סכום, תנאי תשלום, תיאור) כבר בשלב רישום הלקוח החדש.
- **אוטומציה חכמה** - במידה והוזנו פרטי תשלום, אישור הלקוח ע"י הגזבר יוצר **אוטומטית** גם את דרישת התשלום (מכירה) בסטטוס 'פתוח'.
- **גמישות תפעולית** - תמיכה גם ברישום לקוח "רזה" (ללא פרטי תשלום) וגם ברישום מלא הכולל עסקה ראשונה מיידית.

#### שיפורי תשתית (Backend)
- **Sequence Management** - תיקון וסנכרון מונים (Sequences) בבסיס הנתונים למניעת התנגשויות מזהים.
- **Enhanced Validation** - בדיקות תקינות נוספות בעת יצירת בקשות לקוח.


#### מנגנון תשלומים חכם (Smart Payments)
- **חישוב מע״מ אוטומטי** - המערכת מחשבת אוטומטית 18% מע״מ בעת יצירת מכירה/דרישת תשלום.
- **תנאי תשלום מתקדמים** - תמיכה מלאה בתנאי תשלום (שוטף+15, +30, +45, +60, +90).
- **חישוב מועד פירעון (Payment Cycle Logic)** - אלגוריתם חכם המחשב את תאריך הפירעון הסופי לפי מחזורי התשלום של הקיבוץ (ה-5 או ה-20 לחודש) הקרובים ביותר לאחר ימי האשראי.

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

## Version 2.2.0 - Previous Release
**Release Date:** 2024-12-19

### Features
- **Client Management**: Enhanced client management capabilities.
- **QA Documentation**: Added QA sanity checks and documentation.
- **System Stability**: Various bug fixes and improvements.

#### קבצים חדשים
- `README.md` - מדריך ראשי למערכת
- `OPERATION_GUIDE.md` - מדריך הפעלה מלא
- `RELEASE_NOTES.md` - מסמך זה

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

## Migration Instructions

### מ-GitHub נפרד למונורפו

אם יש לך את הפרויקטים הישנים:

```bash
# 1. שכפל את המונורפו החדש
git clone https://github.com/eseiref-svg/kibbutz-vrm-system-mono.git
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

## Versions Summary

| Version | Date | Type | Summary |
|---------|------|------|---------|
| **2.5.0** | 24/12/2025 | Feature | Supplier Payment Requests |
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

**Last Updated:** 24/12/2025  
**Maintained by:** VRM Development Team
