import React from 'react';


const PaymentStatsCards = ({ stats, loading }) => {
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
      title: 'חשבוניות באיחור',
      value: stats?.overdue_count || 0,
      amount: formatCurrency(stats?.overdue_amount),
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      title: 'תשלומים להיום',
      value: stats?.due_today_count || 0,
      amount: formatCurrency(stats?.due_today_amount),
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      title: 'תשלומים קרובים (7 ימים)',
      value: stats?.upcoming_count || 0,
      amount: null,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'סה"כ חשבוניות פתוחות',
      value: stats?.total_open || 0,
      amount: formatCurrency(stats?.total_amount),
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} border-2 ${card.borderColor} rounded-lg shadow-sm p-6 transition-transform hover:scale-105`}
        >
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
          </div>
          <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
            {card.value}
          </div>
          {card.amount && (
            <div className="text-sm text-gray-600 font-medium">
              {card.amount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentStatsCards;

