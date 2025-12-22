const db = require('../db');

class AlertService {
  async createOrUpdateAlert(transaction, daysUntilDue) {
    try {
      const alertType = this.determineAlertType(daysUntilDue);
      const severity = this.determineSeverity(daysUntilDue);

      if (transaction.alert_id) {
        await this.updateExistingAlert(transaction.alert_id, alertType, severity);
        await this.sendNotificationToUser(transaction, alertType, daysUntilDue);
        return { updated: true, created: false, alert_id: transaction.alert_id };
      } else {
        const newAlert = await this.createNewAlert(transaction.transaction_id, alertType, severity);
        await this.linkAlertToTransaction(transaction.transaction_id, newAlert.alert_id);
        await this.sendNotificationToUser(transaction, alertType, daysUntilDue);
        return { created: true, updated: false, alert_id: newAlert.alert_id };
      }
    } catch (error) {
      console.error(`Error creating/updating alert for transaction ${transaction.transaction_id}:`, error);
      throw error;
    }
  }

  determineAlertType(daysUntilDue) {
    if (daysUntilDue === 7) return 'upcoming_payment';
    if (daysUntilDue === 0) return 'payment_due_today';
    if (daysUntilDue < 0) return 'payment_overdue';
    return 'other';
  }

  determineSeverity(daysUntilDue) {
    if (daysUntilDue < -30) return 'critical';
    if (daysUntilDue < -7) return 'high';
    if (daysUntilDue < 0) return 'medium';
    if (daysUntilDue === 0) return 'medium';
    if (daysUntilDue <= 7) return 'low';
    return 'low';
  }

  async createNewAlert(transactionId, alertType, severity) {
    const query = `
      INSERT INTO alert (transaction_id, alert_type, severity, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await db.query(query, [transactionId, alertType, severity]);
    return result.rows[0];
  }

  async updateExistingAlert(alertId, alertType, severity) {
    const query = `
      UPDATE alert 
      SET alert_type = $2, severity = $3, created_at = NOW()
      WHERE alert_id = $1
      RETURNING *
    `;
    const result = await db.query(query, [alertId, alertType, severity]);
    return result.rows[0];
  }

  async linkAlertToTransaction(transactionId, alertId) {
    const query = `UPDATE transaction SET alert_id = $2 WHERE transaction_id = $1`;
    await db.query(query, [transactionId, alertId]);
  }

  async sendNotificationToUser(transaction, alertType, daysUntilDue) {
    try {
      const userId = transaction.branch_manager_id || 1;
      const message = this.generateNotificationMessage(transaction, alertType, daysUntilDue);
      const title = this.generateNotificationTitle(alertType, daysUntilDue);

      const query = `
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES ($1, $2, $3, $4, FALSE, NOW())
        RETURNING *
      `;

      const notificationType = alertType === 'payment_overdue' ? 'alert' : 'info';
      const result = await db.query(query, [userId, title, message, notificationType]);

      console.log(`Notification sent to user ${userId} for transaction ${transaction.transaction_id}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  generateNotificationTitle(alertType, daysUntilDue) {
    if (alertType === 'upcoming_payment') return '⏰ תזכורת: תשלום בעוד 7 ימים';
    if (alertType === 'payment_due_today') return 'תשלום בתאריך היעד - היום!';
    if (alertType === 'payment_overdue') {
      const daysOverdue = Math.abs(daysUntilDue);
      return `⚠️ איחור בתשלום - ${daysOverdue} ימים`;
    }
    return 'התראת תשלום';
  }

  generateNotificationMessage(transaction, alertType, daysUntilDue) {
    const amount = new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(Math.abs(transaction.value));

    const entityName = transaction.supplier_name || 'לא ידוע';
    const branchName = transaction.branch_name || 'לא ידוע';
    const transactionType = transaction.transaction_type === 'payment' ? 'תשלום לספק' : 'גביה מלקוח';

    if (alertType === 'upcoming_payment') {
      return `${transactionType}: ${entityName} | סכום: ${amount} | ענף: ${branchName} | תאריך יעד: ${new Date(transaction.due_date).toLocaleDateString('he-IL')} (בעוד 7 ימים)`;
    }
    if (alertType === 'payment_due_today') {
      return `${transactionType}: ${entityName} | סכום: ${amount} | ענף: ${branchName} | מועד התשלום הינו היום!`;
    }
    if (alertType === 'payment_overdue') {
      const daysOverdue = Math.abs(daysUntilDue);
      return `${transactionType}: ${entityName} | סכום: ${amount} | ענף: ${branchName} | איחור של ${daysOverdue} ימים (תאריך יעד: ${new Date(transaction.due_date).toLocaleDateString('he-IL')})`;
    }

    return `עסקה: ${transactionType} | ${entityName} | ${amount}`;
  }

  async removeAlertForPaidTransaction(transactionId) {
    try {
      const transactionQuery = await db.query(
        'SELECT alert_id FROM transaction WHERE transaction_id = $1',
        [transactionId]
      );

      if (transactionQuery.rows.length > 0 && transactionQuery.rows[0].alert_id) {
        const alertId = transactionQuery.rows[0].alert_id;
        await db.query('DELETE FROM alert WHERE alert_id = $1', [alertId]);
        await db.query('UPDATE transaction SET alert_id = NULL WHERE transaction_id = $1', [transactionId]);
        console.log(`✅ Alert removed for paid transaction ${transactionId}`);
      }
    } catch (error) {
      console.error('Error removing alert:', error);
    }
  }

  async getAllActiveAlerts() {
    const query = `
      SELECT a.*, t.transaction_id, t.value, t.due_date, t.status
      FROM alert a
      JOIN transaction t ON a.transaction_id = t.transaction_id
      WHERE t.status = 'open'
      ORDER BY a.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async sendActionNotification(userId, title, message, type = 'action_required') {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES ($1, $2, $3, $4, FALSE, NOW())
        RETURNING *
      `;
      const result = await db.query(query, [userId, title, message, type]);
      console.log(`Notification (${type}) sent to user ${userId}: ${title}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error sending action notification:', error);
    }
  }
}

const alertService = new AlertService();
module.exports = alertService;

