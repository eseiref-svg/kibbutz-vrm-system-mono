import React from 'react';

const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const getStatusBadge = (transaction) => {
    if (transaction.days_overdue > 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">באיחור</span>;
    } else if (transaction.days_until_due === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">להיום</span>;
    } else if (transaction.days_until_due <= 7) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">קרוב</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">עתידי</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">פרטי עסקה</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* מידע כללי */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">מידע כללי</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">מספר עסקה</label>
                  <p className="mt-1 text-sm text-gray-900">{transaction.transaction_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">סוג עסקה</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {transaction.transaction_type === 'payment' ? 'תשלום לספק' : 'גביה מלקוח'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">סכום</label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">{formatCurrency(transaction.value)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">מצב</label>
                  <p className="mt-1">{getStatusBadge(transaction)}</p>
                </div>
              </div>
            </div>

            {/* תאריכים */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">תאריכים</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">תאריך פירעון</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.due_date)}</p>
                </div>
                {transaction.days_overdue > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ימים באיחור</label>
                    <p className="mt-1 text-sm text-red-600 font-semibold">{transaction.days_overdue} ימים</p>
                  </div>
                )}
                {transaction.days_until_due > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ימים עד לפירעון</label>
                    <p className="mt-1 text-sm text-blue-600 font-semibold">{transaction.days_until_due} ימים</p>
                  </div>
                )}
              </div>
            </div>

            {/* פרטי ישות */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי ישות</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">שם</label>
                  <p className="mt-1 text-sm text-gray-900">{transaction.entity_name || 'לא זמין'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ענף</label>
                  <p className="mt-1 text-sm text-gray-900">{transaction.branch_name || 'לא זמין'}</p>
                </div>
              </div>
            </div>

            {/* התראות */}
            {transaction.alert_type && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">התראות</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">סוג התראה</label>
                    <p className="mt-1 text-sm text-gray-900">{transaction.alert_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">חומרה</label>
                    <p className="mt-1 text-sm text-gray-900">{transaction.severity || 'לא מוגדר'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
