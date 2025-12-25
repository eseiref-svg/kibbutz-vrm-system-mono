import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import { calculateDueDate, formatPaymentTerms } from '../../utils/paymentTerms';

function SalesApprovalWidget() {
  const [pendingTransactions, setPendingTransactions] = useState([]);
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
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/pending-approval');
      setPendingTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setError('שגיאה בטעינת בקשות ממתינות');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (transaction) => {
    setApprovingId(transaction.id);
    // For sales, reset form. For payments, nothing specialized needed yet.
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

  const handleConfirmApprove = async (transaction) => {
    // If it's a Sale, validate fields
    if (transaction.type === 'sale') {
      if (!approvalData.invoice_number || approvalData.invoice_number.trim() === '') {
        alert('❌ מספר חשבונית הוא שדה חובה');
        return;
      }
    }

    // Confirmation dialog
    if (!window.confirm('האם אתה בטוח שברצונך לאשר את דרישת התשלום?')) {
      return;
    }

    try {
      if (transaction.type === 'sale') {
        await api.put(`/sales/${transaction.id}/approve`, approvalData);
      } else {
        // Payment Request (Supplier)
        await api.put(`/payment-requests/${transaction.id}/approve`, {});
      }

      alert('✅ הבקשה אושרה בהצלחה!');
      setApprovingId(null);
      fetchPendingTransactions(); // Refresh list
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert(error.response?.data?.message || 'שגיאה באישור הבקשה');
    }
  };

  const handleCancelApprove = () => {
    setApprovingId(null);
    setApprovalData({
      payment_terms: 'current_50',
      invoice_number: ''
    });
  };

  const handleRejectClick = (transaction) => {
    setRejectingId(transaction.id);
    setRejectionReason('');
  };

  const handleConfirmReject = async (transaction) => {
    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('❌ יש לציין סיבת דחייה');
      return;
    }

    // Confirmation dialog
    if (!window.confirm('האם אתה בטוח שברצונך לדחות את הבקשה? פעולה זו תודיע למנהל הענף.')) {
      return;
    }

    try {
      if (transaction.type === 'sale') {
        await api.put(`/sales/${transaction.id}/reject`, { rejection_reason: rejectionReason });
      } else {
        await api.put(`/payment-requests/${transaction.id}/reject`, { rejection_reason: rejectionReason });
      }

      alert('✅ הבקשה נדחתה');
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingTransactions(); // Refresh list
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert(error.response?.data?.message || 'שגיאה בדחיית הבקשה');
    }
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectionReason('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">בקשות ממתינות לאישור</h3>
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">בקשות ממתינות לאישור</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (pendingTransactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">בקשות ממתינות לאישור</h3>
        <p className="text-gray-600">אין בקשות ממתינות לאישור.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        בקשות ממתינות לאישור ({pendingTransactions.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">יישות (לקוח/ספק)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">מזהה</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">סוג</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ענף</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">סכום</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך עסקה</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">תיאור</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingTransactions.map((trx) => (
              <React.Fragment key={`${trx.type}-${trx.id}`}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>{trx.entity_name}</div>
                    {/* Assuming poc_name might not be returned in union query or needs handling, currently focusing on main fields */}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {trx.entity_identifier || `#${trx.entity_id}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trx.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {trx.type === 'sale' ? 'מכירה ללקוח' : 'תשלום לספק'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {trx.branch_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ₪{parseFloat(trx.value).toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(trx.transaction_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {trx.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {approvingId === trx.id || rejectingId === trx.id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={approvingId === trx.id ? handleCancelApprove : handleCancelReject}
                        >
                          ביטול
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveClick(trx)}
                        >
                          אשר
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectClick(trx)}
                        >
                          דחה
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Approval Form Row */}
                {approvingId === trx.id && (
                  <tr className="bg-blue-50">
                    <td colSpan="8" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 mb-2">פרטי אישור - {trx.type === 'sale' ? 'מכירה' : 'תשלום לספק'}</h4>

                        {trx.type === 'sale' ? (
                          <>
                            {/* Sale Approval Form - Same as before */}
                            <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">פרטי הלקוח והעסקה:</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-200">
                                <div>
                                  <span className="text-gray-600">סכום ללא מע"מ:</span> <span className="font-medium">₪{parseFloat(trx.value).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">מע"מ (18%):</span> <span className="font-medium">₪{(parseFloat(trx.value) * 0.18).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">סכום כולל מע"מ:</span> <span className="font-bold text-blue-700">₪{(parseFloat(trx.value) * 1.18).toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
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
                                <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                                  <span className="font-semibold">תאריך תשלום מחושב: </span>
                                  {calculateDueDate(trx.transaction_date, approvalData.payment_terms)?.toLocaleDateString('he-IL')}
                                </div>
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
                          </>
                        ) : (
                          // Payment Request Approval (Simple Confirmation)
                          <div className="bg-white p-4 rounded border border-gray-200">
                            <p className="text-gray-700 mb-2">
                              האם ברצונך לאשר את דרישת התשלום לספק <strong>{trx.entity_name}</strong> בסך <strong>₪{parseFloat(trx.value).toLocaleString()}</strong>?
                            </p>
                            <p className="text-gray-600 text-sm">
                              אישור הבקשה יהפוך אותה לסטטוס "פתוח" ויכניס אותה למעקב התשלומים.
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="secondary"
                            onClick={handleCancelApprove}
                          >
                            ביטול
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleConfirmApprove(trx)}
                          >
                            אשר בקשה
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Rejection Form Row */}
                {rejectingId === trx.id && (
                  <tr className="bg-red-50">
                    <td colSpan="8" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-red-800 mb-2">דחיית בקשה</h4>

                        <div className="bg-white p-3 rounded border border-red-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            סיבת הדחייה * <span className="text-red-600">(חובה)</span>
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="נא לפרט את הסיבה לדחיית הבקשה..."
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
                            onClick={() => handleConfirmReject(trx)}
                          >
                            דחה בקשה
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
    </div >
  );
}

export default SalesApprovalWidget;
