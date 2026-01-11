import MasavWidget from './MasavWidget';


const PaymentStatsCards = ({ stats, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* 1. Late - To Pay */}
      <div className="bg-white rounded-lg shadow p-6 border-r-4 border-red-500">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">חשבוניות באיחור - ספקים</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.overdue_payables_count || 0}</h3>
          <p className="text-sm text-red-600 mt-1 font-semibold">
            {formatCurrency(stats?.overdue_payables_amount || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-r-4 border-orange-500">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">חשבוניות באיחור - לקוחות</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.overdue_receivables_count || 0}</h3>
          <p className="text-sm text-orange-600 mt-1 font-semibold">
            {formatCurrency(stats?.overdue_receivables_amount || 0)}
          </p>
        </div>
      </div>

      {/* 3. Next Masav */}
      <MasavWidget
        initialDate={stats?.next_masav_date}
        initialAmount={stats?.next_masav_amount}
        onUpdate={onRefresh}
      />

      {/* 4. Total Open */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm p-6 transition-transform hover:scale-105">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">סה"כ חשבוניות פתוחות</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {stats?.total_open || 0}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {formatCurrency(stats?.total_amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsCards;

