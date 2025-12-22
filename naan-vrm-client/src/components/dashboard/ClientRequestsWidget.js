import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import { useNotifications } from '../../context/NotificationContext';
import RequestDetailsModal from './RequestDetailsModal';

function ClientRequestsWidget({ requests, onUpdateRequest, onApproveRequest }) {
  const { triggerRefresh } = useNotifications();
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleReject = async (requestId) => {
    // Confirm rejection
    if (!window.confirm('האם אתה בטוח שברצונך לדחות את בקשת הלקוח?')) {
      return;
    }

    const reviewNotes = window.prompt('הזן הערות לדחיית הבקשה (אופציונלי):');

    // User can cancel at prompt stage too
    if (reviewNotes === null) {
      return;
    }

    try {
      await api.put(`/client-requests/${requestId}/reject`, {
        review_notes: reviewNotes || null
      });
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
      <div id="client-requests-widget" className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות לקוחות חדשים להוספה</h3>
        <p className="text-gray-500 text-center py-4">אין בקשות חדשות הממתינות לאישור.</p>
      </div>
    );
  }

  return (
    <div id="client-requests-widget" className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות לקוחות חדשים להוספה</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-right font-semibold">שם הלקוח</th>
              <th className="py-2 px-3 text-right font-semibold">איש קשר</th>
              <th className="py-2 px-3 text-right font-semibold">טלפון</th>
              <th className="py-2 px-3 text-right font-semibold">הוגש על ידי</th>
              <th className="py-2 px-3 text-right font-semibold">ענף</th>
              <th className="py-2 px-3 text-right font-semibold">תאריך</th>
              <th className="py-2 px-3 text-center font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr
                key={req.request_id}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(req)}
              >
                <td className="py-2 px-3">
                  <div className="font-semibold">{req.client_name}</div>
                  {req.client_id && (
                    <div className="text-xs text-gray-500">לקוח קיים ({req.client_number || `#${req.client_id}`})</div>
                  )}
                  {!req.client_id && (
                    <div className="text-xs text-blue-600">לקוח חדש</div>
                  )}
                </td>
                <td className="py-2 px-3">{req.poc_name || 'לא זמין'}</td>
                <td className="py-2 px-3">{req.poc_phone || 'לא זמין'}</td>
                <td className="py-2 px-3">{req.requested_by_name || 'לא זמין'}</td>
                <td className="py-2 px-3">{req.branch_name || 'לא זמין'}</td>
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
                      onClick={() => handleReject(req.request_id)}
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
        type="client"
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
      />
    </div>
  );
}

export default ClientRequestsWidget;

