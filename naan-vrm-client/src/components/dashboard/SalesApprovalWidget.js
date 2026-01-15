import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateDueDate, formatPaymentTerms, PAYMENT_TERMS_OPTIONS } from '../../utils/paymentTerms';

function SalesApprovalWidget({ onRefresh }) {
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
      if (onRefresh) onRefresh(); // Refresh parent dashboard
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
      if (onRefresh) onRefresh(); // Refresh parent dashboard
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
        בקשות לתשלום חדשות
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סוג</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">יישות (לקוח/ספק)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מזהה</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ענף</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך עסקה</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingTransactions.map((trx) => (
              <React.Fragment key={`${trx.type}-${trx.id}`}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trx.type === 'sale' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        גבייה מלקוח
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        תשלום לספק
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    <div>{trx.entity_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate">
                    {trx.entity_identifier || `#${trx.entity_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate">
                    {trx.branch_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate">
                    {new Date(trx.transaction_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-bold truncate">
                    {formatCurrency(trx.value)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate" title={trx.description}>
                    {trx.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium w-[160px]">
                    {approvingId === trx.id || rejectingId === trx.id ? (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={approvingId === trx.id ? handleCancelApprove : handleCancelReject}
                        >
                          ביטול
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleApproveClick(trx)}
                          className="border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 px-3 py-1 rounded transition-colors text-xs"
                        >
                          אשר
                        </button>
                        <button
                          onClick={() => handleRejectClick(trx)}
                          className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 px-3 py-1 rounded transition-colors text-xs"
                        >
                          דחה
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Approval Form Row */}
                {approvingId === trx.id && (
                  <tr className="bg-blue-50">
                    <td colSpan="7" className="px-4 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 mb-2">פרטי אישור - {trx.type === 'sale' ? 'מכירה' : 'תשלום לספק'}</h4>

                        {trx.type === 'sale' ? (
                          <>
                            {/* Sale Approval Form - Same as before */}
                            <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">פרטי הלקוח והעסקה:</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-200">
                                <div>
                                  <span className="text-gray-600">סכום ללא מע"מ:</span> <span className="font-medium">{formatCurrency(trx.value)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">מע"מ (18%):</span> <span className="font-medium">{formatCurrency(parseFloat(trx.value) * 0.18)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">סכום כולל מע"מ:</span> <span className="font-bold text-blue-700">{formatCurrency(parseFloat(trx.value) * 1.18)}</span>
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
                                  {PAYMENT_TERMS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
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
                              האם ברצונך לאשר את דרישת התשלום לספק <strong>{trx.entity_name}</strong> בסך <strong>{formatCurrency(trx.value)}</strong>?
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
                    <td colSpan="7" className="px-4 py-4">
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
