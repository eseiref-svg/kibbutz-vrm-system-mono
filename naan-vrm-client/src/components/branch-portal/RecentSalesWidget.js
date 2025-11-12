import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

function RecentSalesWidget({ branchId }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentSales();
  }, [branchId]);

  const fetchRecentSales = async () => {
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
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval':
        return { text: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
      case 'open':
        return { text: 'אושר - ממתין לתשלום', color: 'bg-green-100 text-green-800', icon: '🟢' };
      case 'paid':
        return { text: 'שולם', color: 'bg-blue-100 text-blue-800', icon: '✅' };
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום אחרונות</h3>
        <p className="text-gray-600 text-center py-4">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום אחרונות</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום אחרונות</h3>
        <p className="text-gray-600 text-center py-4">אין דרישות תשלום עדיין</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        דרישות תשלום אחרונות ({sales.length})
      </h3>

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
            {sales.map((sale) => {
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
    </div>
  );
}

export default RecentSalesWidget;

