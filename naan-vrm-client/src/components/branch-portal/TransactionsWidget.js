import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';

const TransactionsWidget = forwardRef(({ branchId, supplierTransactions, isBusiness = true }, ref) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(isBusiness ? 'incoming' : 'outgoing'); // Default based on branch type
  const [statusFilter, setStatusFilter] = useState('open'); // Default to 'Waiting'

  useEffect(() => {
    setActiveTab(isBusiness ? 'incoming' : 'outgoing');
  }, [isBusiness]);

  const fetchRecentSales = useCallback(async () => {
    if (!branchId) {
      setSales([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('/sales/recent', {
        params: { branchId, limit: 10 }
      });
      setSales(response.data || []);
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      setError('שגיאה בטעינת דרישות תשלום אחרונות');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchRecentSales();
  }, [fetchRecentSales]);

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: fetchRecentSales
  }));

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval':
        return { text: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800' };
      case 'open':
        return { text: 'אושר - ממתין לתשלום', color: 'bg-green-100 text-green-800' };
      case 'paid':
        return { text: 'שולם', color: 'bg-blue-100 text-blue-800', icon: '✅' };
      case 'approved':
        return { text: 'מאושר', color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'pending':
        return { text: 'ממתין', color: 'bg-yellow-100 text-yellow-800' };
      case 'rejected':
        return { text: 'נדחה', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: '⚪' };
    }
  };

  // Removed local formatCurrency

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const getFilteredData = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.filter(item => {
      if (statusFilter === 'paid') {
        return item.status === 'paid';
      }
      if (statusFilter === 'overdue') {
        const dueDate = new Date(item.due_date);
        return item.status === 'open' && dueDate < today;
      }
      if (statusFilter === 'open') {
        return item.status === 'open';
      }
      return true;
    });
  };

  const getSortedData = (data) => {
    // Static Sort: Oldest to Newest
    return [...data].sort((a, b) => {
      const dateA = new Date(a.due_date || a.transaction_date).getTime();
      const dateB = new Date(b.due_date || b.transaction_date).getTime();
      return dateA - dateB;
    });
  };

  const processedSales = getSortedData(getFilteredData(sales));
  const processedSupplierTransactions = getSortedData(getFilteredData(supplierTransactions || []));



  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        תשלומים פתוחים
      </h3>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {isBusiness && (
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-2 font-semibold transition-colors ${activeTab === 'incoming'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            לקבל מלקוחות ({sales.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-6 py-2 font-semibold transition-colors ${activeTab === 'outgoing'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          לשלם לספקים ({supplierTransactions?.length || 0})
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">סינון לפי סטטוס:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="open">ממתין לתשלום</option>
          <option value="paid">שולם</option>
          <option value="overdue">ממתין לתשלום - באיחור</option>
        </select>
      </div>

      {/* Content */}
      {activeTab === 'incoming' ? (
        // Sales
        loading ? (
          <p className="text-gray-600 text-center py-4">טוען...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : processedSales.length === 0 ? (
          <p className="text-gray-600 text-center py-4">{statusFilter !== 'all' ? 'אין תוצאות תואמות' : 'אין דרישות תשלום עדיין'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-right font-semibold">לקוח</th>
                  <th className="py-2 px-3 text-right font-semibold">מספר לקוח</th>
                  <th className="py-2 px-3 text-right font-semibold">סכום</th>
                  <th className="py-2 px-3 text-right font-semibold">תאריך עסקה</th>
                  <th className="py-2 px-3 text-right font-semibold">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {processedSales.map((sale) => {
                  const statusInfo = getStatusLabel(sale.status);
                  return (
                    <tr key={sale.sale_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="font-semibold text-gray-800">{sale.client_name}</div>
                        {sale.description && (
                          <div className="text-xs text-gray-500">{sale.description}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {sale.client_number || `#${sale.client_id}`}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">
                        {formatCurrency(sale.value)}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(sale.transaction_date)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Supplier transactions
        !supplierTransactions || processedSupplierTransactions.length === 0 ? (
          <p className="text-gray-600 text-center py-4">{statusFilter !== 'all' ? 'אין תוצאות תואמות' : 'לא נמצאו עסקאות אחרונות עבור ענף זה.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-right font-semibold">ספק</th>
                  <th className="py-2 px-3 text-right font-semibold">תאריך יעד</th>
                  <th className="py-2 px-3 text-right font-semibold">סכום</th>
                  <th className="py-2 px-3 text-right font-semibold">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {processedSupplierTransactions.map((tx) => {
                  const statusInfo = getStatusLabel(tx.status);
                  return (
                    <tr key={tx.transaction_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gray-800">
                        {tx.supplier_name}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(tx.due_date)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">
                        {formatCurrency(tx.value)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
});

TransactionsWidget.displayName = 'TransactionsWidget';

export default TransactionsWidget;

