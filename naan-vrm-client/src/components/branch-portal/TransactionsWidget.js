import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import api from '../../api/axiosConfig';

const TransactionsWidget = forwardRef(({ branchId, supplierTransactions }, ref) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('incoming'); // incoming (לקבל) or outgoing (לשלם)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');

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
        return { text: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
      case 'open':
        return { text: 'אושר - ממתין לתשלום', color: 'bg-green-100 text-green-800', icon: '🟢' };
      case 'paid':
        return { text: 'שולם', color: 'bg-blue-100 text-blue-800', icon: '✅' };
      case 'approved':
        return { text: 'מאושר', color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'pending':
        return { text: 'ממתין', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
      case 'rejected':
        return { text: 'נדחה', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: '⚪' };
    }
  };

  const formatCurrency = (value) => {
    return `₪${parseFloat(value).toLocaleString('he-IL', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle numeric values
      if (sortConfig.key === 'value') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      // Handle dates
      if (sortConfig.key === 'transaction_date' || sortConfig.key === 'due_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getFilteredData = (data) => {
    if (statusFilter === 'all') return data;
    return data.filter(item => item.status === statusFilter);
  };

  const processedSales = getSortedData(getFilteredData(sales));
  const processedSupplierTransactions = getSortedData(getFilteredData(supplierTransactions || []));

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return (
      <span className="text-blue-600 ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        תשלומים פתוחים
      </h3>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-6 py-2 font-semibold transition-colors ${
            activeTab === 'incoming'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          לקבל מלקוחות ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-6 py-2 font-semibold transition-colors ${
            activeTab === 'outgoing'
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
          <option value="all">הכל</option>
          <option value="pending_approval">ממתין לאישור</option>
          <option value="open">אושר - ממתין לתשלום</option>
          <option value="paid">שולם</option>
          <option value="approved">מאושר</option>
          <option value="pending">ממתין</option>
        </select>
      </div>

      {/* Content */}
      {activeTab === 'incoming' ? (
        // Sales (לקבל)
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
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('client_name')}
                  >
                    <span className="flex items-center justify-end">
                      לקוח
                      <SortIcon columnKey="client_name" />
                    </span>
                  </th>
                  <th className="py-2 px-3 text-right font-semibold">מספר לקוח</th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('value')}
                  >
                    <span className="flex items-center justify-end">
                      סכום
                      <SortIcon columnKey="value" />
                    </span>
                  </th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('transaction_date')}
                  >
                    <span className="flex items-center justify-end">
                      תאריך עסקה
                      <SortIcon columnKey="transaction_date" />
                    </span>
                  </th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('status')}
                  >
                    <span className="flex items-center justify-end">
                      סטטוס
                      <SortIcon columnKey="status" />
                    </span>
                  </th>
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
        // Supplier transactions (לשלם)
        !supplierTransactions || processedSupplierTransactions.length === 0 ? (
          <p className="text-gray-600 text-center py-4">{statusFilter !== 'all' ? 'אין תוצאות תואמות' : 'לא נמצאו עסקאות אחרונות עבור ענף זה.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('supplier_name')}
                  >
                    <span className="flex items-center justify-end">
                      ספק
                      <SortIcon columnKey="supplier_name" />
                    </span>
                  </th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('due_date')}
                  >
                    <span className="flex items-center justify-end">
                      תאריך יעד
                      <SortIcon columnKey="due_date" />
                    </span>
                  </th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('value')}
                  >
                    <span className="flex items-center justify-end">
                      סכום
                      <SortIcon columnKey="value" />
                    </span>
                  </th>
                  <th 
                    className="py-2 px-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('status')}
                  >
                    <span className="flex items-center justify-end">
                      סטטוס
                      <SortIcon columnKey="status" />
                    </span>
                  </th>
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

