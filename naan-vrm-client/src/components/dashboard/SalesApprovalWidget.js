import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

function SalesApprovalWidget() {
  const [pendingSales, setPendingSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [approvalData, setApprovalData] = useState({
    payment_terms: 'current_50', // ברירת מחדל
    invoice_number: ''
  });

  useEffect(() => {
    fetchPendingSales();
  }, []);

  const fetchPendingSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/pending-approval');
      setPendingSales(response.data || []);
    } catch (error) {
      console.error('Error fetching pending sales:', error);
      setError('שגיאה בטעינת דרישות תשלום ממתינות');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (sale) => {
    setApprovingId(sale.sale_id);
    setApprovalData({
      payment_terms: 'current_50',
      invoice_number: ''
    });
  };

  const handleApprovalChange = (e) => {
    setApprovalData({
      ...approvalData,
      [e.target.name]: e.target.value
    });
  };

  const handleConfirmApprove = async (saleId) => {
    try {
      await api.put(`/sales/${saleId}/approve`, approvalData);
      alert('דרישת התשלום אושרה בהצלחה!');
      setApprovingId(null);
      fetchPendingSales(); // Refresh list
    } catch (error) {
      console.error('Error approving sale:', error);
      alert(error.response?.data?.message || 'שגיאה באישור דרישת התשלום');
    }
  };

  const handleCancelApprove = () => {
    setApprovingId(null);
    setApprovalData({
      payment_terms: 'current_50',
      invoice_number: ''
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום ממתינות לאישור</h3>
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום ממתינות לאישור</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (pendingSales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">דרישות תשלום ממתינות לאישור</h3>
        <p className="text-gray-600">אין דרישות תשלום ממתינות לאישור.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        דרישות תשלום ממתינות לאישור ({pendingSales.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">לקוח</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ענף</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">סכום</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך עסקה</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">תיאור</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingSales.map((sale) => (
              <React.Fragment key={sale.sale_id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.client_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sale.branch_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ₪{parseFloat(sale.value).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(sale.transaction_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {sale.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {approvingId === sale.sale_id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelApprove}
                        >
                          ביטול
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApproveClick(sale)}
                      >
                        אשר
                      </Button>
                    )}
                  </td>
                </tr>
                
                {/* Approval Form Row */}
                {approvingId === sale.sale_id && (
                  <tr className="bg-blue-50">
                    <td colSpan="6" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">פרטי אישור</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              תנאי תשלום *
                            </label>
                            <select
                              name="payment_terms"
                              value={approvalData.payment_terms}
                              onChange={handleApprovalChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="immediate">מיידי (0 ימים)</option>
                              <option value="current_15">שוטף 15+ (15 ימים)</option>
                              <option value="current_35">שוטף 35+ (35 ימים)</option>
                              <option value="current_50">שוטף 50+ (50 ימים) - ברירת מחדל</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              מספר חשבונית
                            </label>
                            <input
                              type="text"
                              name="invoice_number"
                              value={approvalData.invoice_number}
                              onChange={handleApprovalChange}
                              placeholder="מספר חשבונית (רשות)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="secondary"
                            onClick={handleCancelApprove}
                          >
                            ביטול
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleConfirmApprove(sale.sale_id)}
                          >
                            אשר דרישת תשלום
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesApprovalWidget;

