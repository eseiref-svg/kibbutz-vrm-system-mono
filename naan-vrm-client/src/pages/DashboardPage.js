import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import InfoCard from '../components/dashboard/InfoCard';
import BankBalanceWidget from '../components/dashboard/BankBalanceWidget';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import ExpensesChart from '../components/dashboard/ExpensesChart';
import SupplierRequestsWidget from '../components/dashboard/SupplierRequestsWidget';
import ClientRequestsWidget from '../components/dashboard/ClientRequestsWidget';
import SalesApprovalWidget from '../components/dashboard/SalesApprovalWidget';
import LowRatedSuppliersWidget from '../components/dashboard/LowRatedSuppliersWidget';
import UnifiedSupplierForm from '../components/shared/UnifiedSupplierForm';
import ApproveClientModal from '../components/dashboard/ApproveClientModal';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function DashboardPage() {
  const { user } = useAuth();
  const isCommunityManager = user?.role === 'community_manager';
  const { triggerRefresh } = useNotifications();
  const [summaryData, setSummaryData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [clientRequests, setClientRequests] = useState([]);
  const [supplierFields, setSupplierFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveClientModal, setShowApproveClientModal] = useState(false);
  const [selectedClientRequest, setSelectedClientRequest] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    const summaryPromise = api.get('/dashboard/summary', { params: { period } });
    const requestsPromise = api.get('/supplier-requests/pending');
    const clientRequestsPromise = api.get('/client-requests', { params: { status: 'pending' } });
    const fieldsPromise = api.get('/supplier-fields');

    Promise.all([summaryPromise, requestsPromise, clientRequestsPromise, fieldsPromise])
      .then(([summaryRes, requestsRes, clientRequestsRes, fieldsRes]) => {
        setSummaryData(summaryRes.data);
        setRequests(requestsRes.data);
        setClientRequests(clientRequestsRes.data || []);
        setSupplierFields(fieldsRes.data);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setError('שגיאה בטעינת הנתונים.');
      })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestUpdate = (requestId) => {
    setRequests(prevRequests => prevRequests.filter(req => req.supplier_req_id !== requestId));
  };

  const handleClientRequestUpdate = (requestId) => {
    setClientRequests(prevRequests => prevRequests.filter(req => req.client_req_id !== requestId));
  };

  const handleApproveClientRequest = (request) => {
    setSelectedClientRequest(request);
    setShowApproveClientModal(true);
  };

  const handleConfirmApproveClient = async (requestId, approvalData) => {
    try {
      await api.put(`/client-requests/${requestId}/approve`, approvalData);
      handleClientRequestUpdate(requestId);
      triggerRefresh(); // Refresh notification bell immediately
      alert('✅ הבקשה אושרה בהצלחה! הלקוח נוצר במערכת.');
      setShowApproveClientModal(false);
      setSelectedClientRequest(null);
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Failed to approve client request:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleCloseApproveClientModal = () => {
    setShowApproveClientModal(false);
    setSelectedClientRequest(null);
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setShowAddSupplierForm(true);
  };

  const handleSupplierAdded = async (supplierId) => {
    // Update request status to approved
    try {
      await api.put(`/supplier-requests/${selectedRequest.supplier_req_id}`, { status: 'approved', requested_supplier_id: supplierId });
      // Remove request from list
      setRequests(prevRequests => prevRequests.filter(req => req.supplier_req_id !== selectedRequest.supplier_req_id));
      triggerRefresh(); // Refresh notification bell immediately
      setShowAddSupplierForm(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleCloseAddSupplierForm = () => {
    setShowAddSupplierForm(false);
    setSelectedRequest(null);
  };

  const handleExportPDF = () => {
    if (!summaryData) return;
    const doc = new jsPDF();

    doc.addFont('arial', 'Arial', 'normal');
    doc.setFont('arial');

    doc.text(`סיכום לוח מחוונים - ${new Date().toLocaleDateString('he-IL')}`, 105, 15, { align: 'center' });

    doc.text(`יתרה לתשלום לספקים: ${parseFloat(summaryData.totalSupplierBalance).toLocaleString('he-IL')} ש"ח`, 20, 30);
    doc.text(`חשבוניות בחריגה: ${summaryData.overdueInvoices}`, 20, 40);
    doc.text(`בקשות ספקים ממתינות: ${requests.length}`, 20, 50);

    doc.autoTable({
      startY: 60,
      head: [['ענף', 'סך הוצאות (ש"ח)']],
      body: summaryData.expensesByBranch.map(e => [e.name, parseFloat(e.total_expenses).toLocaleString('he-IL')]),
      styles: { font: "arial", halign: 'right' },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`dashboard_summary_${period}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">
          {isCommunityManager ? 'לוח מחוונים - מנהל קהילה' : 'לוח מחוונים - גזבר/ית'}
        </h2>
        <div className="flex items-center gap-4">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'monthly', label: 'תצוגה חודשית' },
              { value: 'quarterly', label: 'תצוגה רבעונית' },
              { value: 'annual', label: 'תצוגה שנתית' }
            ]}
            fullWidth={false}
            className="min-w-[180px]"
          />
          <Button variant="success" onClick={handleExportPDF}>
            ייצוא ל-PDF
          </Button>
        </div>
      </div>

      {loading && <p>טוען נתונים...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && summaryData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <BankBalanceWidget />
            <InfoCard title="תזרים מזומנים (לתקופה)">
              <CashFlowChart />
            </InfoCard>
            <InfoCard title="הוצאות לפי ענפים (לתקופה)">
              <Link to="/reports" className="block hover:bg-gray-50 p-2 rounded transition-colors">
                <ExpensesChart data={summaryData.expensesByBranch} />
                <div className="text-blue-600 text-sm mt-2 font-medium">לחץ לפרטים נוספים →</div>
              </Link>
            </InfoCard>
            <InfoCard title="מעקב תשלומים">
              <Link to="/payments" className="block hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="text-3xl font-extrabold text-blue-700">₪{parseFloat(summaryData.totalSupplierBalance).toLocaleString('he-IL')}</div>
                <p className="text-gray-600 text-sm my-2">יתרה לתשלום (לתקופה)</p>
                <div className="text-red-600 font-bold">{summaryData.overdueInvoices} חשבוניות בחריגה</div>
                <div className="text-blue-600 text-sm mt-2 font-medium">לחץ לפרטים נוספים →</div>
              </Link>
            </InfoCard>
          </div>
          <SupplierRequestsWidget
            requests={requests}
            onUpdateRequest={handleRequestUpdate}
            onApproveRequest={handleApproveRequest}
          />

          {/* Show Low Rated Suppliers for Treasurer/Admin */}
          {!isCommunityManager && (
            <div className="mb-8">
              <LowRatedSuppliersWidget />
            </div>
          )}

          <ClientRequestsWidget
            requests={clientRequests}
            onUpdateRequest={handleClientRequestUpdate}
            onApproveRequest={handleApproveClientRequest}
          />

          <SalesApprovalWidget />

          <UnifiedSupplierForm
            open={showAddSupplierForm}
            onClose={handleCloseAddSupplierForm}
            onSubmit={async (data) => {
              try {
                const res = await api.post('/suppliers', data);
                await handleSupplierAdded(res.data.supplier_id); // Logic to refresh and close
              } catch (e) {
                alert('שגיאה בהוספת הספק: ' + (e.response?.data?.message || e.message));
              }
            }}
            initialData={selectedRequest}
            mode="treasurer"
            title={selectedRequest ? 'אישור ספק (מרכז בקשות)' : 'הוספת ספק חדש'}
            submitLabel="אשר וצור ספק"
          />

          <ApproveClientModal
            isOpen={showApproveClientModal}
            onClose={handleCloseApproveClientModal}
            clientRequest={selectedClientRequest}
            onApprove={handleConfirmApproveClient}
          />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
