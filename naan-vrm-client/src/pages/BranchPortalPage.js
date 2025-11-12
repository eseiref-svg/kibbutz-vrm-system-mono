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
        });
    }
  }, [user]);

  useEffect(() => {
    if (!branch) return;

    const fetchBalance = api.get(`/branches/${branch.branch_id}/balance`);
    const fetchTransactions = api.get(`/branches/${branch.branch_id}/transactions`);

    Promise.all([fetchBalance, fetchTransactions])
      .then(([balanceRes, transactionsRes]) => {
        setBalance(balanceRes.data);
        setTransactions(transactionsRes.data);
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
    setFoundSuppliers([]);
    setSearchQuery('');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">
          פורטל מנהל ענף {branch ? `- ${branch.name}` : ''}
        </h2>
      </div>
      
      {loading ? (
        <p>טוען נתונים...</p>
      ) : branch ? (
        <div className="space-y-8">
          <NotificationsList />
          
          <BalanceCard balanceData={balance} />
          
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
