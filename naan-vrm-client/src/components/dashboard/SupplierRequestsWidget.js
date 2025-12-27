import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import { useNotifications } from '../../context/NotificationContext';
import RequestDetailsModal from './RequestDetailsModal';

function SupplierRequestsWidget({ requests, onUpdateRequest, onApproveRequest }) {
  const { triggerRefresh } = useNotifications();
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleReject = async (requestId) => {
    const reason = window.prompt('אנא הזן את סיבת הדחייה:');
    if (reason === null) return; // Cancelled

    try {
      await api.put(`/supplier-requests/${requestId}`, { status: 'rejected', rejection_reason: reason });
      onUpdateRequest(requestId);
      triggerRefresh(); // Refresh notification bell immediately
      alert('✅ הבקשה נדחתה בהצלחה.');
    } catch (error) {
      console.error('Failed to reject request:', error);
      const errorMessage = error.response?.data?.message || 'שגיאה בלתי צפויה';
      alert(`❌ הפעולה נכשלה.\n\nפרטי השגיאה: ${errorMessage}`);
    }
  };

  const handleRowClick = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const handleApproveFromModal = (request) => {
    onApproveRequest(request);
    handleCloseDetails();
  };

  const handleRejectFromModal = (requestId) => {
    handleReject(requestId);
    handleCloseDetails();
  };

  if (!requests || requests.length === 0) {
    return (
      <div id="supplier-requests-widget" className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות ספקים חדשים להוספה</h3>
        <p className="text-gray-500 text-center py-4">אין בקשות חדשות הממתינות לאישור.</p>
      </div>
    );
  }

  return (
    <div id="supplier-requests-widget" className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות ספקים חדשים להוספה</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-right font-semibold">שם הספק</th>
              <th className="py-2 px-3 text-right font-semibold">הוגש על ידי</th>
              <th className="py-2 px-3 text-right font-semibold">ענף</th>
              <th className="py-2 px-3 text-right font-semibold">תאריך</th>
              <th className="py-2 px-3 text-center font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr
                key={req.supplier_req_id}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(req)}
              >
                <td className="py-2 px-3">{req.supplier_name}</td>
                <td className="py-2 px-3">{req.requested_by}</td>
                <td className="py-2 px-3">{req.branch_name}</td>
                <td className="py-2 px-3">{new Date(req.created_at).toLocaleDateString('he-IL')}</td>
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onApproveRequest(req)}
                    >
                      אשר
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(req.supplier_req_id)}
                    >
                      דחה
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={handleCloseDetails}
        data={selectedRequest}
        type="supplier"
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
      />
    </div>
  );
}

export default SupplierRequestsWidget;
