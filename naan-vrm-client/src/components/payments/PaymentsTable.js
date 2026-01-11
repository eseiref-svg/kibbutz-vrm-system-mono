import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import TransactionDetailsModal from './TransactionDetailsModal';


const PaymentsTable = ({ payments, loading, onRefresh }) => {
  const [markingPaid, setMarkingPaid] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount) || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getSeverityBadge = (daysOverdue, daysUntilDue, status) => {
    if (status === 'paid') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">שולם</span>;
    }

    if (daysOverdue > 0) {
      if (daysOverdue > 30) {
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">איחור {daysOverdue} ימים</span>;
      } else if (daysOverdue > 7) {
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">איחור {daysOverdue} ימים</span>;
      } else {
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">איחור {daysOverdue} ימים</span>;
      }
    } else if (daysUntilDue === 0) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">להיום</span>;
    } else if (daysUntilDue <= 7) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">בעוד {daysUntilDue} ימים</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">עתידי</span>;
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'payment' ? 'תשלום לספק' : 'גביה מלקוח';
  };


  const handleMarkAsPaid = async (transactionId) => {
    try {
      setMarkingPaid(prev => ({ ...prev, [transactionId]: true }));

      await api.put(`/payments/${transactionId}/mark-paid`, {
        actualDate: new Date().toISOString().split('T')[0]
      });

      alert('התשלום סומן כשולם בהצלחה!');

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('שגיאה בסימון התשלום. נסה שוב.');
    } finally {
      setMarkingPaid(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          <p>אין חשבוניות פתוחות</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סוג
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ספק/לקוח
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ענף
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סכום
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                תאריך יעד
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr
                key={payment.transaction_id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(payment)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-gray-700">{getTransactionTypeLabel(payment.transaction_type)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.entity_name || 'לא ידוע'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.branch_name || 'לא ידוע'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${payment.transaction_type === 'sale' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                    {formatCurrency(payment.value)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(payment.due_date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSeverityBadge(payment.days_overdue, payment.days_until_due, payment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payment.status !== 'paid' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsPaid(payment.transaction_id);
                      }}
                      disabled={markingPaid[payment.transaction_id]}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${markingPaid[payment.transaction_id]
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {markingPaid[payment.transaction_id] ? 'מסמן...' : 'סמן כשולם'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PaymentsTable;

