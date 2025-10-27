import React from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

function SupplierRequestsWidget({ requests, onUpdateRequest, onApproveRequest }) {

  const handleReject = async (requestId) => {
    if (!window.confirm('האם אתה בטוח שברצונך לדחות את הבקשה?')) {
      return;
    }
    
    try {
      await api.put(`/supplier-requests/${requestId}`, { status: 'rejected' });
      onUpdateRequest(requestId);
      alert('✅ הבקשה נדחתה בהצלחה.');
    } catch (error) {
      console.error('Failed to reject request:', error);
      const errorMessage = error.response?.data?.message || 'שגיאה בלתי צפויה';
      alert(`❌ הפעולה נכשלה.\n\nפרטי השגיאה: ${errorMessage}`);
    }
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
              <tr key={req.request_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{req.supplier_name}</td>
                <td className="py-2 px-3">{req.requested_by}</td>
                <td className="py-2 px-3">{req.branch_name}</td>
                <td className="py-2 px-3">{new Date(req.created_at).toLocaleDateString('he-IL')}</td>
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-2">
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
    </div>
  );
}

export default SupplierRequestsWidget;
