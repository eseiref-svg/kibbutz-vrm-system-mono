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
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">שם הספק</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הוגש על ידי</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ענף</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map(req => (
              <tr
                key={req.supplier_req_id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(req)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{req.supplier_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.requested_by}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.branch_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString('he-IL')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium w-[160px]">
                  <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onApproveRequest(req)}
                      className="border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 px-3 py-1 rounded transition-colors text-xs"
                    >
                      אשר
                    </button>
                    <button
                      onClick={() => handleReject(req.supplier_req_id)}
                      className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 px-3 py-1 rounded transition-colors text-xs"
                    >
                      דחה
                    </button>
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
