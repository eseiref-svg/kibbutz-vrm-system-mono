import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import InfoCard from '../components/dashboard/InfoCard';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import ExpensesChart from '../components/dashboard/ExpensesChart';
import SupplierRequestsWidget from '../components/dashboard/SupplierRequestsWidget';
import AddSupplierForm from '../components/AddSupplierForm';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function DashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [supplierFields, setSupplierFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    const summaryPromise = api.get('/dashboard/summary', { params: { period } });
    const requestsPromise = api.get('/supplier-requests/pending');
    const fieldsPromise = api.get('/supplier-fields');

    Promise.all([summaryPromise, requestsPromise, fieldsPromise])
      .then(([summaryRes, requestsRes, fieldsRes]) => {
        setSummaryData(summaryRes.data);
        setRequests(requestsRes.data);
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
    setRequests(prevRequests => prevRequests.filter(req => req.request_id !== requestId));
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setShowAddSupplierForm(true);
  };

  const handleSupplierAdded = async (supplier) => {
    // עדכון הבקשה לסטטוס approved
    try {
      await api.put(`/supplier-requests/${selectedRequest.request_id}`, { status: 'approved' });
      // הסרת הבקשה מהרשימה
      setRequests(prevRequests => prevRequests.filter(req => req.request_id !== selectedRequest.request_id));
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
        <h2 className="text-3xl font-bold text-gray-800">לוח מחוונים - גזבר/ית</h2>
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
                <InfoCard title="יתרות בנקים (₪)">
                  <div className="text-4xl font-extrabold text-green-600">₪12,350,000</div>
                  <p className="text-gray-600 text-sm mt-1">נתון סטטי לדוגמה</p>
                </InfoCard>
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
        
            <AddSupplierForm
              open={showAddSupplierForm}
              onClose={handleCloseAddSupplierForm}
              onSupplierAdded={handleSupplierAdded}
              supplierFields={supplierFields}
              initialData={selectedRequest}
            />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
