import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import SuppliersTable from '../components/SuppliersTable';
import SupplierSearch from '../components/suppliers/SupplierSearch';
import SupplierDetailsCard from '../components/suppliers/SupplierDetailsCard';
import UnifiedSupplierForm from '../components/shared/UnifiedSupplierForm';
import Button from '../components/shared/Button';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Unified Form State for Add/Edit
  const [showUnifiedForm, setShowUnifiedForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // If set, we are editing. If null, adding.

  const fetchSuppliers = (criteria = '', query = '') => {
    setLoading(true);
    // User requested only APPROVED suppliers in the table.
    api.get(`/suppliers/search`, {
      params: {
        criteria: criteria.trim(),
        query: query.trim(),
        status: 'approved' // Strict filter
      }
    })
      .then(response => {
        setSuppliers(response.data);
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

  const handleSearch = () => {
    fetchSuppliers(searchCriteria, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchSuppliers('', '');
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
            fetchSuppliers(searchCriteria, searchQuery);
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
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SuppliersPage;
