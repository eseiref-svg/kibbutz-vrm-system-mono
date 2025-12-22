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

  const cards = [
    {
      title: 'חשבוניות באיחור - לתשלום',
      value: stats?.overdue_payables_count || 0,
      amount: formatCurrency(stats?.overdue_payables_amount),
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      title: 'חשבוניות באיחור - לקבל',
      value: stats?.overdue_receivables_count || 0,
      amount: formatCurrency(stats?.overdue_receivables_amount),
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      title: 'סה"כ חשבוניות פתוחות',
      value: stats?.total_open || 0,
      amount: formatCurrency(stats?.total_amount),
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* 1. Late - To Pay */}
      <div className={`${cards[0].bgColor} border-2 ${cards[0].borderColor} rounded-lg shadow-sm p-6 transition-transform hover:scale-105`}>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">{cards[0].title}</h3>
        </div>
        <div className={`text-3xl font-bold ${cards[0].textColor} mb-2`}>
          {cards[0].value}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {cards[0].amount}
        </div>
      </div>

      {/* 2. Late - To Receive */}
      <div className={`${cards[1].bgColor} border-2 ${cards[1].borderColor} rounded-lg shadow-sm p-6 transition-transform hover:scale-105`}>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">{cards[1].title}</h3>
        </div>
        <div className={`text-3xl font-bold ${cards[1].textColor} mb-2`}>
          {cards[1].value}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {cards[1].amount}
        </div>
      </div>

      {/* 3. Next Masav */}
      <MasavWidget
        initialDate={stats?.next_masav_date}
        initialAmount={stats?.next_masav_amount}
        onUpdate={onRefresh}
      />

      {/* 4. Total Open */}
      <div className={`${cards[2].bgColor} border-2 ${cards[2].borderColor} rounded-lg shadow-sm p-6 transition-transform hover:scale-105`}>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">{cards[2].title}</h3>
        </div>
        <div className={`text-3xl font-bold ${cards[2].textColor} mb-2`}>
          {cards[2].value}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {cards[2].amount}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsCards;

