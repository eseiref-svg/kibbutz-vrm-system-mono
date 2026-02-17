import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';
import TransactionDetailsModal from './TransactionDetailsModal';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';


const PaymentsTable = ({ payments, loading, onRefresh, pagination, onPageChange }) => {
  const [markingPaid, setMarkingPaid] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Removed local formatCurrency

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getSeverityBadge = (daysOverdue, daysUntilDue, status) => {
    if (status === 'paid') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">שולם</span>;
    }

    // Logic updated: Check Overdue FIRST
    if (daysOverdue > 0) {
      // Overdue (Red)
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">איחור {daysOverdue} ימים</span>;
    } else if (daysUntilDue === 0) {
      // Today (Blue)
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">היום</span>;
    } else if (daysUntilDue <= 7) {
      // Upcoming (Orange)
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">בעוד {daysUntilDue} ימים</span>;
    } else {
      // Future (Green)
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">עתידי</span>;
    }
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
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                סוג
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                ספק/לקוח
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                ענף
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                סכום
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                תאריך יעד
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
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
                  <div className={`text-sm font-bold text-right ${payment.transaction_type === 'sale' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                    {formatCurrency(Math.abs(payment.value))}
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
                      className={`px-3 py-1 rounded transition-colors text-xs border ${markingPaid[payment.transaction_id]
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300'
                        }`}
                    >
                      {markingPaid[payment.transaction_id] ? 'סוגר...' : 'סמן כשולם'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.current - 1))}
              disabled={pagination.current === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              הקודם
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.current + 1))}
              disabled={pagination.current === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              הבא
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                מציג עמוד <span className="font-medium">{pagination.current}</span> מתוך <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, pagination.current - 1))}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <LuChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Page Numbers */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pagination.totalPages > 7 && Math.abs(pageNum - pagination.current) > 2 && pageNum !== 1 && pageNum !== pagination.totalPages) {
                    if (Math.abs(pageNum - pagination.current) === 3) return <span key={pageNum} className="px-2">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.current === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.current + 1))}
                  disabled={pagination.current === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PaymentsTable;

