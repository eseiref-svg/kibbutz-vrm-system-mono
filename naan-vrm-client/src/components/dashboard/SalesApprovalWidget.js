import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

function SalesApprovalWidget() {
  const [pendingSales, setPendingSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalData, setApprovalData] = useState({
    payment_terms: 'current_50', // Default
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
    // Validate invoice_number
    if (!approvalData.invoice_number || approvalData.invoice_number.trim() === '') {
      alert('❌ מספר חשבונית הוא שדה חובה');
      return;
    }

    // Confirmation dialog
    if (!window.confirm('האם אתה בטוח שברצונך לאשר את דרישת התשלום?')) {
      return;
    }

    try {
      await api.put(`/sales/${saleId}/approve`, approvalData);
      alert('✅ דרישת התשלום אושרה בהצלחה!');
      setApprovingId(null);
      setApprovalData({
        payment_terms: 'current_50',
        invoice_number: ''
      });
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

  const handleRejectClick = (sale) => {
    setRejectingId(sale.sale_id);
    setRejectionReason('');
  };

  const handleConfirmReject = async (saleId) => {
    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('❌ יש לציין סיבת דחייה');
      return;
    }

    // Confirmation dialog
    if (!window.confirm('האם אתה בטוח שברצונך לדחות את דרישת התשלום? פעולה זו תודיע למנהל הענף.')) {
      return;
    }

    try {
      await api.put(`/sales/${saleId}/reject`, { rejection_reason: rejectionReason });
      alert('✅ דרישת התשלום נדחתה');
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingSales(); // Refresh list
    } catch (error) {
      console.error('Error rejecting sale:', error);
      alert(error.response?.data?.message || 'שגיאה בדחיית דרישת התשלום');
    }
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectionReason('');
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
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">מספר לקוח</th>
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
                    <div>{sale.client_name}</div>
                    {sale.poc_name && (
                      <div className="text-xs text-gray-500 mt-1">איש קשר: {sale.poc_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sale.client_number || `#${sale.client_id}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sale.branch_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ₪{parseFloat(sale.value).toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(sale.transaction_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {sale.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {approvingId === sale.sale_id || rejectingId === sale.sale_id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={approvingId === sale.sale_id ? handleCancelApprove : handleCancelReject}
                        >
                          ביטול
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveClick(sale)}
                        >
                          אשר
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectClick(sale)}
                        >
                          דחה
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
                
                {/* Approval Form Row */}
                {approvingId === sale.sale_id && (
                  <tr className="bg-blue-50">
                    <td colSpan="7" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 mb-2">פרטי אישור</h4>
                        
                        {/* Client Details */}
                        <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">פרטי הלקוח והעסקה:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-600">שם:</span> <span className="font-medium">{sale.client_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">מספר לקוח:</span> <span className="font-medium">{sale.client_number || `#${sale.client_id}`}</span>
                            </div>
                            {sale.poc_name && (
                              <div>
                                <span className="text-gray-600">איש קשר:</span> <span className="font-medium">{sale.poc_name}</span>
                              </div>
                            )}
                            {sale.poc_phone && (
                              <div>
                                <span className="text-gray-600">טלפון:</span> <span className="font-medium">{sale.poc_phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-200">
                            <div>
                              <span className="text-gray-600">סכום ללא מע"מ:</span> <span className="font-medium">₪{parseFloat(sale.value).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">מע"מ (18%):</span> <span className="font-medium">₪{(parseFloat(sale.value) * 0.18).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">סכום כולל מע"מ:</span> <span className="font-bold text-blue-700">₪{(parseFloat(sale.value) * 1.18).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                        
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
                              מספר חשבונית *
                            </label>
                            <input
                              type="text"
                              name="invoice_number"
                              value={approvalData.invoice_number}
                              onChange={handleApprovalChange}
                              placeholder="הזן מספר חשבונית (חובה)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
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

                {/* Rejection Form Row */}
                {rejectingId === sale.sale_id && (
                  <tr className="bg-red-50">
                    <td colSpan="7" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-red-800 mb-2">דחיית דרישת תשלום</h4>
                        
                        <div className="bg-white p-3 rounded border border-red-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            סיבת הדחייה * <span className="text-red-600">(חובה)</span>
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="נא לפרט את הסיבה לדחיית דרישת התשלום..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="secondary"
                            onClick={handleCancelReject}
                          >
                            ביטול
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleConfirmReject(sale.sale_id)}
                          >
                            דחה דרישת תשלום
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
