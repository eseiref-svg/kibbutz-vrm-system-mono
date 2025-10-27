import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import PaymentStatsCards from '../components/payments/PaymentStatsCards';
import PaymentsTable from '../components/payments/PaymentsTable';
import PaymentFilters from '../components/payments/PaymentFilters';


const PaymentsDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // all, overdue, upcoming

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchPayments()
      ]);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (filters.branchId) {
        params.branchId = filters.branchId;
      }

      const response = await api.get('/payments/dashboard', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const params = {
        // הגבלה לחודש הנוכחי
        currentMonth: true
      };
      
      // הוספת פילטרים
      if (filters.branchId && filters.branchId !== 'all') {
        params.branchId = filters.branchId;
      }
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type;
      }

      // בחירת endpoint לפי טאב פעיל
      let endpoint = '/payments/all';
      if (activeTab === 'overdue') {
        endpoint = '/payments/overdue';
        params.status = 'overdue';
      } else if (activeTab === 'upcoming') {
        endpoint = '/payments/upcoming';
        params.status = 'upcoming';
      }

      const response = await api.get(endpoint, { params });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleRunManualCheck = async () => {
    if (!window.confirm('האם להריץ בדיקת תשלומים ידנית עכשיו?')) {
      return;
    }

    try {
      const response = await api.post('/payments/run-check');
      alert(`בדיקה הושלמה!\n- עסקאות שנבדקו: ${response.data.transactionsChecked}\n- התראות שנוצרו: ${response.data.alertsCreated}\n- התראות שעודכנו: ${response.data.alertsUpdated}`);
      handleRefresh();
    } catch (error) {
      console.error('Error running manual check:', error);
      alert('שגיאה בהרצת הבדיקה. ייתכן שאין לך הרשאה.');
    }
  };

  const tabs = [
    { id: 'all', label: 'כל התשלומים' },
    { id: 'overdue', label: 'באיחור', count: stats?.overdue_count },
    { id: 'upcoming', label: 'קרובים (7 ימים)', count: stats?.upcoming_count },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* כותרת */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">לוח בקרה תשלומים</h1>
            <p className="text-gray-600">מעקב אוטומטי אחר כל החשבוניות הפתוחות במערכת</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              רענן נתונים
            </button>
            <button
              onClick={handleRunManualCheck}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              title="הרצת בדיקה ידנית"
            >
              הרץ בדיקה
            </button>
          </div>
        </div>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <PaymentStatsCards stats={stats} loading={loading && !stats} />

      {/* סינונים */}
      <PaymentFilters onFilterChange={handleFilterChange} />

      {/* טאבים */}
      <div className="bg-white rounded-t-lg shadow">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`mr-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* טבלת תשלומים */}
      <div className="rounded-b-lg">
        <PaymentsTable 
          payments={payments} 
          loading={loading} 
          onRefresh={handleRefresh}
        />
      </div>

      {/* מידע נוסף */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">על מערכת מעקב התשלומים:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>המערכת מבצעת סריקה אוטומטית כל יום בשעה 02:00</li>
            <li>התראות נשלחות 7 ימים לפני מועד התשלום וביום הפירעון</li>
            <li>חשבוניות באיחור מקבלות התראות יומיות</li>
            <li>ניתן לסמן חשבונית כשולמת באמצעות כפתור "סמן כשולם"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboardPage;

