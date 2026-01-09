import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/branch-portal/BalanceCard';
import BranchSupplierSearch from '../components/branch-portal/BranchSupplierSearch';
import BranchSupplierInfoCard from '../components/branch-portal/BranchSupplierInfoCard';
import RequestSupplierForm from '../components/branch-portal/RequestSupplierForm';
import NotificationsList from '../components/branch-portal/NotificationsList';
import Button from '../components/shared/Button';
import BranchClientManagement from '../components/branch-portal/BranchClientManagement';
import TransactionsWidget from '../components/branch-portal/TransactionsWidget';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function BranchPortalPage() {
  const { user } = useAuth();
  const transactionsWidgetRef = useRef();

  const [branch, setBranch] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [foundSuppliers, setFoundSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      api.get(`/users/${user.id}/branch`)
        .then(response => {
          setBranch(response.data);
        })
        .catch(error => {
          console.error("Could not find a branch for this manager:", error);
          setLoading(false); // Warning: Ensure we stop loading state
        });
    }
  }, [user]);

  useEffect(() => {
    if (!branch) return;

    const fetchBalance = api.get(`/branches/${branch.branch_id}/balance`);
    const fetchTransactions = api.get(`/branches/${branch.branch_id}/transactions`);
    const fetchMySuppliers = api.get(`/branches/${branch.branch_id}/suppliers`);

    Promise.all([fetchBalance, fetchTransactions, fetchMySuppliers])
      .then(([balanceRes, transactionsRes, suppliersRes]) => {
        setBalance(balanceRes.data);
        setTransactions(transactionsRes.data);
        setFoundSuppliers(suppliersRes.data);
      })
      .catch(error => console.error("Error fetching branch data:", error))
      .finally(() => setLoading(false));

  }, [branch]);

  const handleSupplierSearch = () => {
    api.get('/suppliers/search', {
      params: { criteria: searchCriteria, query: searchQuery.trim() }
    })
      .then(response => {
        setFoundSuppliers(response.data);
      })
      .catch(error => console.error("Error searching suppliers:", error));
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Reload my suppliers
    if (branch) {
      api.get(`/branches/${branch.branch_id}/suppliers`)
        .then(res => setFoundSuppliers(res.data))
        .catch(console.error);
    }
  };

  const handleRequestSent = () => {
    setShowRequestForm(false);
    alert('הבקשה נשלחה בהצלחה ותועבר לאישור הגזבר.');
  };

  const handleSaleCreated = () => {
    // Refresh transactions widget after sale creation
    if (transactionsWidgetRef.current) {
      transactionsWidgetRef.current.refresh();
    }
  };

  const handleExportPDF = () => {
    if (!branch || !balance) return;
    const doc = new jsPDF();

    // Add Hebrew font support (using standard font for now, might need custom font for full Hebrew support)
    doc.addFont('arial', 'Arial', 'normal');
    doc.setFont('arial');

    // Title
    doc.setFontSize(18);
    doc.text(`דוח תקציב - ${branch.name}`, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`תאריך דוח: ${new Date().toLocaleDateString('he-IL')}`, 105, 22, { align: 'center' });

    // Balance Info
    doc.setFontSize(14);
    doc.text('סיכום תקציב:', 190, 35, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`מסגרת אשראי: ₪${parseFloat(balance.credit).toLocaleString()}`, 190, 45, { align: 'right' });
    doc.text(`נוצל: ₪${parseFloat(balance.debit).toLocaleString()}`, 190, 52, { align: 'right' });
    doc.text(`יתרה: ₪${(parseFloat(balance.credit) - parseFloat(balance.debit)).toLocaleString()}`, 190, 59, { align: 'right' });

    // Transactions Table
    autoTable(doc, {
      startY: 70,
      head: [['תאריך', 'ספק', 'סכום (₪)', 'סטטוס']],
      body: transactions.map(t => [
        new Date(t.due_date).toLocaleDateString('he-IL'),
        t.supplier_name,
        parseFloat(t.value).toLocaleString(),
        t.status === 'paid' ? 'שולם' : t.status === 'open' ? 'פתוח' : 'אחר'
      ]),
      styles: { font: "arial", halign: 'right' },
      headStyles: { fillColor: [41, 128, 185], halign: 'right' },
    });

    doc.save(`budget_report_${branch.branch_id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
          <img src="/favicon.png" alt="לוגו המערכת" className="h-12 w-auto object-contain hover:opacity-90 transition-opacity" />
          <h2 className="text-3xl font-bold text-gray-800">
            פורטל מנהל ענף {branch ? `- ${branch.name}` : ''}
          </h2>
        </div>
        {branch && (
          <Button variant="success" onClick={handleExportPDF}>
            ייצוא דוח תקציב (PDF)
          </Button>
        )}
      </div>

      {loading ? (
        <p>טוען נתונים...</p>
      ) : branch ? (
        <div className="space-y-8">
          <BalanceCard balanceData={balance} />

          <NotificationsList />

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-800">מאגר ספקים מאושרים</h3>
              <Button
                variant="success"
                onClick={() => setShowRequestForm(true)}
              >
                הגש בקשה לספק חדש
              </Button>
            </div>
            <BranchSupplierSearch
              query={searchQuery}
              setQuery={setSearchQuery}
              criteria={searchCriteria}
              setCriteria={setSearchCriteria}
              onSearch={handleSupplierSearch}
              onClear={clearSearch}
            />
            {foundSuppliers.length > 0 && (
              <div className="mt-4 space-y-4">
                {foundSuppliers.map(supplier => (
                  <BranchSupplierInfoCard
                    key={supplier.supplier_id}
                    supplier={supplier}
                    onClear={clearSearch}
                    branchId={branch.branch_id}
                  />
                ))}
              </div>
            )}
          </div>

          <BranchClientManagement
            branchId={branch.branch_id}
            onSaleCreated={handleSaleCreated}
          />

          <TransactionsWidget
            ref={transactionsWidgetRef}
            branchId={branch.branch_id}
            supplierTransactions={transactions}
          />
        </div>
      ) : (
        <p>לא משויך ענף למשתמש זה.</p>
      )}

      {branch && (
        <RequestSupplierForm
          open={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSent}
          userId={user?.id}
          branchId={branch.branch_id}
        />
      )}
    </div>
  );
}

export default BranchPortalPage;
