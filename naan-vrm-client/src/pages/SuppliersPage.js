import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import api from '../api/axiosConfig';
import SuppliersTable from '../components/SuppliersTable';
import SupplierSearch from '../components/suppliers/SupplierSearch';
import SupplierDetailsCard from '../components/suppliers/SupplierDetailsCard';
import UnifiedSupplierForm from '../components/shared/UnifiedSupplierForm';
import Button from '../components/shared/Button';

import { useLocation } from 'react-router-dom';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const location = useLocation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Unified Form State for Add/Edit
  const [showUnifiedForm, setShowUnifiedForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // If set, we are editing. If null, adding.

  const fetchSuppliers = (criteria = '', query = '', page = 1) => {
    setLoading(true);
    // User requested only APPROVED suppliers in the table.
    api.get(`/suppliers/search`, {
      params: {
        criteria: criteria.trim(),
        query: query.trim(),
        status: 'approved', // Strict filter
        page: page,
        limit: limit
      }
    })
      .then(response => {
        if (response.data.data) {
          setSuppliers(response.data.data);
          setTotalPages(Math.ceil(response.data.total / limit));
          setCurrentPage(parseInt(response.data.page));
        } else {
          // Fallback
          setSuppliers(response.data);
          setTotalPages(1);
          setCurrentPage(1);
        }
      })
      .catch(error => {
        console.error("There was an error fetching the suppliers!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // deeply link to specific supplier if ID is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openSupplierId = params.get('openSupplierId');

    if (openSupplierId) {
      // Fetch specific supplier details
      api.get(`/suppliers/${openSupplierId}`)
        .then(res => {
          setSelectedSupplier(res.data);
          // Optional: clear the param from URL without reload so refresh doesn't reopen? 
          // For now leaving it is fine, or user might want to bookmark it.
        })
        .catch(err => console.error("Could not load requested supplier", err));
    }
  }, [location.search]);

  useEffect(() => {
    fetchSuppliers(searchCriteria, debouncedQuery, 1);
  }, [debouncedQuery, searchCriteria]);

  const handleSearch = () => {
    // Kept for Enter key compatibility
    fetchSuppliers(searchCriteria, searchQuery, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchQuery('');
    fetchSuppliers('', '', 1);
  };

  const handleFormSuccess = async (data) => {
    fetchSuppliers(); // Refresh list
    setShowUnifiedForm(false);

    // If editing and creating, api usually returns the new/updated object.
    // Ideally update standard view if selected.
    if (editingSupplier && selectedSupplier && selectedSupplier.supplier_id === data.supplier_id) {
      // We might need to fetch fresh details if "data" from form isn't complete (e.g. joined fields)
      // But let's assume form returns enough or we force refresh if needed.
      // Actually, form calls 'onSubmit' then 'api.post/put'. 
      // Our UnifiedForm handles the POST call itself if mode!=treasurer, OR calls onSubmit prop.
      // In Treasurer mode (default), UnifiedForm calls onSubmit(payload). It does NOT call API internally in that mode?
      // Wait, looking at UnifiedForm refactor:
      // if (mode === 'branch_manager') await api.post...
      // else await onSubmit(payload)
      // So HERE in Treasurer mode, we must implement the API call.

      // Wait, let's fix UnifiedForm usage:
      // UnifiedForm: "In Treasurer mode... handled by parent typically... or we pass payload."
      // Let's implement the API calls here for clarity.
    }
  };

  const handleTreasurerSubmit = async (payload) => {
    try {
      if (editingSupplier) {
        const res = await api.put(`/suppliers/${editingSupplier.supplier_id}`, payload);
        if (selectedSupplier && selectedSupplier.supplier_id === editingSupplier.supplier_id) {
          setSelectedSupplier(res.data);
        }
        alert('הספק עודכן בהצלחה');
      } else {
        await api.post('/suppliers', payload);
        alert('הספק נוצר בהצלחה');
      }
      fetchSuppliers();
      setShowUnifiedForm(false);
    } catch (e) {
      console.error("Error saving supplier:", e);
      alert('שגיאה בשמירת הספק: ' + (e.response?.data?.message || e.message));
    }
  };


  const handleStatusToggle = async (supplier) => {
    const newStatus = !(supplier.is_active !== false); // Toggle
    const actionName = newStatus ? 'להפעיל' : 'להשבית';

    if (window.confirm(`האם אתה בטוח שברצונך ${actionName} את ספק מספר ${supplier.supplier_id}?`)) {
      try {
        await api.put(`/suppliers/${supplier.supplier_id}`, {
          ...supplier,
          is_active: newStatus
        });
        fetchSuppliers();
      } catch (error) {
        console.error('Error updating supplier status:', error);
        alert('הפעולה נכשלה.');
      }
    }
  };

  const openAddForm = () => {
    setEditingSupplier(null);
    setShowUnifiedForm(true);
  };

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);
    setShowUnifiedForm(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ניהול ספקים</h2>
        {!selectedSupplier && (
          <Button
            variant="success"
            onClick={openAddForm}
            className="w-full md:w-auto"
          >
            הוסף ספק חדש
          </Button>
        )}
      </div>

      {showUnifiedForm && (
        <UnifiedSupplierForm
          open={showUnifiedForm}
          onClose={() => setShowUnifiedForm(false)}
          onSubmit={handleTreasurerSubmit}
          initialData={editingSupplier}
          mode="treasurer"
          submitLabel={editingSupplier ? "עדכן ספק" : "שמור ספק"}
        />
      )}

      {selectedSupplier ? (
        <SupplierDetailsCard
          supplier={selectedSupplier}
          mode="treasurer"
          onBackToList={() => {
            setSelectedSupplier(null);
            fetchSuppliers(searchCriteria, searchQuery, currentPage);
          }}
          onEdit={openEditForm}
          onStatusToggle={() => handleStatusToggle(selectedSupplier)}
        />
      ) : (
        <>
          <SupplierSearch
            query={searchQuery}
            setQuery={setSearchQuery}
            criteria={searchCriteria}
            setCriteria={setSearchCriteria}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
          <div className="mt-8 overflow-x-auto">
            {loading ? (
              <p>טוען נתונים...</p>
            ) : (
              <SuppliersTable
                suppliers={suppliers}
                mode="treasurer"
                onDeactivate={handleStatusToggle}
                onEdit={openEditForm}
                onRowClick={setSelectedSupplier}
                pagination={{ current: currentPage, totalPages: totalPages }}
                onPageChange={(page) => fetchSuppliers(searchCriteria, debouncedQuery, page)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SuppliersPage;
