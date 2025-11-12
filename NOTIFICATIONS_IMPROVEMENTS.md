# 📬 שיפורים מוצעים למערכת ההתראות

## 🎯 מטרה
שיפור חוויית המשתמש כאשר יש עשרות התראות במערכת.

---

## 📋 הצעת שיפור

### 1. **מסך ראשי (Dashboard) - התראות חדשות בלבד**
- ✅ **כבר קיים** - מציג רק התראות לא נקראות
- ✅ פעמון ההתראות מציג מספר התראות חדשות
- ✅ לחיצה על ההתראה מסמנת אותה כנקראה

### 2. **עמוד היסטוריית התראות חדש** 🆕
- **נתיב מוצע**: `/notifications-history` או `/notifications`
- **תצוגה**: טבלה/רשימה של כל ההתראות (נקראות ולא נקראות)
- **Pagination**: 20 התראות בעמוד
- **סינון** (בהמשך):
  - לפי תאריך
  - לפי סוג (אישור/דחייה/כללי)
  - לפי סטטוס (נקרא/לא נקרא)
- **חיפוש** (בהמשך):
  - חיפוש טקסט חופשי בתוכן ההתראה

### 3. **ניקיון אוטומטי** (אופציונלי)
- **Cron Job** שמוחק התראות ישנות מעל X ימים (למשל 90 יום)
- או **ארכוב** - העברה לטבלת `notifications_archive`

---

## 🛠️ יישום מוצע

### Frontend:
```
/notifications-history
  - NotificationsHistoryPage.js
    - NotificationsTable.js (עם pagination)
    - NotificationsFilters.js (בהמשך)
```

### Backend:
```javascript
// GET /api/notifications/history
// Query params: page, limit, status, type, dateFrom, dateTo
app.get('/api/notifications/history', auth, async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT * FROM notifications 
    WHERE user_id = $1
  `;
  
  if (status) query += ` AND is_read = ${status === 'read'}`;
  if (type) query += ` AND type = '${type}'`;
  
  query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  
  // ... execute query
});
```

---

## 📊 עדיפויות

| # | משימה | עדיפות | הערות |
|---|-------|---------|-------|
| 1 | עמוד היסטוריה בסיסי | 🔴 גבוהה | רק תצוגה + pagination |
| 2 | קישור בתפריט | 🔴 גבוהה | "היסטוריית התראות" |
| 3 | סינון בסיסי | 🟡 בינונית | נקרא/לא נקרא, סוג |
| 4 | חיפוש טקסט | 🟢 נמוכה | Nice to have |
| 5 | ניקיון אוטומטי | 🟢 נמוכה | רק אחרי שיש הרבה נתונים |

---

## 💡 הערות נוספות

- **NotificationsBell** ימשיך לספור רק התראות לא נקראות
- **Dashboard** ימשיך להציג רק התראות חדשות (לא נקראות)
- **עמוד ההיסטוריה** יהיה נגיש דרך התפריט הראשי
- שקול להוסיף **badge** ליד "היסטוריית התראות" עם מספר התראות לא נקראות

---

**תאריך יצירה**: 8.11.2025  
**סטטוס**: הצעה - ממתין ליישום


