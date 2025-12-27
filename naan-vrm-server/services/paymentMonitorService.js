/**
 * Payment Monitoring Service
 * Automatic payment monitoring and alerts service
 * 
 * Roles:
 * 1. Scan open invoices (status='open')
 * 2. Check for upcoming payment dates
 * 3. Create automatic alerts
 */

const cron = require('node-cron');
const db = require('../db');
const alertService = require('./alertService');

class PaymentMonitorService {
  constructor() {
    this.isRunning = false;
  }


  start() {
    if (this.isRunning) {
      console.log('⚠️  Payment monitor service is already running');
      return;
    }

    cron.schedule('0 2 * * *', async () => {
      console.log('Starting daily payment monitoring...');
      await this.performDailyCheck();
    });

    this.isRunning = true;
    console.log('Payment monitor service started - runs daily at 02:00');
  }


  async performDailyCheck() {
    try {
      const startTime = Date.now();

      const openTransactions = await this.getOpenTransactions();

      console.log(`Found ${openTransactions.length} open transactions to check`);

      let alertsCreated = 0;
      let alertsUpdated = 0;

      for (const transaction of openTransactions) {
        const daysUntilDue = this.calculateDaysUntilDue(transaction.due_date);

        const shouldAlert = this.shouldCreateAlert(daysUntilDue, transaction);

        if (shouldAlert) {
          const alertResult = await alertService.createOrUpdateAlert(
            transaction,
            daysUntilDue
          );

          if (alertResult.created) {
            alertsCreated++;
          } else if (alertResult.updated) {
            alertsUpdated++;
          }
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`Daily check completed in ${duration}s`);
      console.log(`   - Alerts created: ${alertsCreated}`);
      console.log(`   - Alerts updated: ${alertsUpdated}`);

      return {
        success: true,
        transactionsChecked: openTransactions.length,
        alertsCreated,
        alertsUpdated,
        duration
      };

    } catch (error) {
      console.error('❌ Error in daily payment check:', error);
      throw error;
    }
  }


  async getOpenTransactions() {
    try {
      const query = `
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          t.alert_id,
          pr.payment_req_id,
          pr.supplier_id,
          pr.branch_id,
          s.name as supplier_name,
          s.poc_email as supplier_email,
          b.name as branch_name,
          b.manager_id as branch_manager_id,
          s.payment_terms,
          'payment' as transaction_type
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id AND s.status IN ('pending', 'approved')
        LEFT JOIN branch b ON pr.branch_id = b.branch_id
        WHERE t.status = 'open' AND pr.payment_req_id IS NOT NULL
        
        UNION ALL
        
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          t.alert_id,
          sa.sale_id as payment_req_id,
          sa.client_id as supplier_id,
          sa.branch_id,
          c.name as supplier_name,
          c.poc_email as supplier_email,
          b.name as branch_name,
          b.manager_id as branch_manager_id,
          NULL as payment_terms_eom,
          'sale' as transaction_type
        FROM transaction t
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        LEFT JOIN client c ON sa.client_id = c.client_id
        LEFT JOIN branch b ON sa.branch_id = b.branch_id
        WHERE t.status = 'open' AND sa.sale_id IS NOT NULL
        
        ORDER BY due_date ASC
      `;

      const result = await db.query(query);
      return result.rows;

    } catch (error) {
      console.error('Error fetching open transactions:', error);
      throw error;
    }
  }


  calculateDaysUntilDue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  shouldCreateAlert(daysUntilDue, transaction) {


    if (daysUntilDue === 7) {

      return true;
    }

    if (daysUntilDue === 0) {

      return true;
    }

    if (daysUntilDue < 0) {

      return true;
    }

    return false;
  }

  async runManualCheck() {
    console.log('Running manual payment check...');
    return await this.performDailyCheck();
  }


  stop() {
    this.isRunning = false;
    console.log('⏹️  Payment monitor service stopped');
  }
}


const paymentMonitorService = new PaymentMonitorService();

module.exports = paymentMonitorService;

