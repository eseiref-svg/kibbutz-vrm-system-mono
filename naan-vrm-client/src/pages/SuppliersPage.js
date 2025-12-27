import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import SuppliersTable from '../components/SuppliersTable';
import SupplierSearch from '../components/suppliers/SupplierSearch';
import SupplierDetailsCard from '../components/suppliers/SupplierDetailsCard';
import UnifiedSupplierForm from '../components/shared/UnifiedSupplierForm';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';
import { validatePhoneNumber } from '../utils/validation';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierFields, setSupplierFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchSuppliers = (criteria = '', query = '') => {
    setLoading(true);
    api.get(`/suppliers/search`, {
      params: { criteria: criteria.trim(), query: query.trim() }
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

  const fetchSupplierFields = () => {
    api.get('/supplier-fields')
      .then(response => setSupplierFields(response.data))
      .catch(error => console.error("Error fetching supplier fields", error));
  };

  useEffect(() => {
    fetchSuppliers();
    fetchSupplierFields();
  }, []);

  const handleSearch = () => {
    fetchSuppliers(searchCriteria, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchSuppliers('', '');
  };

  const handleSupplierAdded = () => {
    fetchSuppliers();
    setShowAddForm(false);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm(`האם אתה בטוח שברצונך להעביר לארכיון את ספק מספר ${id}?`)) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
        alert('הספק הועבר לארכיון בהצלחה');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('הפעולה נכשלה.');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditClick = (supplier) => {
    setCurrentUser(supplier);
    setErrors({});
    setIsEditing(true);
  };

  const handleUpdateSupplier = async () => {
    if (!currentUser) return;

    // Validation
    const phoneValidation = validatePhoneNumber(currentUser.poc_phone);
    if (!phoneValidation.isValid) {
      setErrors({ poc_phone: phoneValidation.error });
      return;
    }

    try {
      const response = await api.put(`/suppliers/${currentUser.supplier_id}`, currentUser);
      fetchSuppliers();
      setIsEditing(false);
      if (selectedSupplier && selectedSupplier.supplier_id === currentUser.supplier_id) {
        setSelectedSupplier(response.data);
      }
      setCurrentUser(null);
      alert('הספק עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('נכשל בעדכון הספק.');
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">ניהול ספקים</h2>
        {!selectedSupplier && (
          <Button
            variant="success"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'הסתר טופס' : 'הוסף ספק חדש'}
          </Button>
        )}
      </div>

      {showAddForm && (
        <UnifiedSupplierForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            try {
              await api.post('/suppliers', data);
              handleSupplierAdded();
            } catch (e) {
              alert('שגיאה בהוספת הספק: ' + (e.response?.data?.message || e.message));
            }
          }}
          mode="treasurer"
          submitLabel="שמור ספק"
        />
      )}

      {selectedSupplier ? (
        <SupplierDetailsCard
          supplier={selectedSupplier}
          onBackToList={() => setSelectedSupplier(null)}
          onEdit={handleEditClick}
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
          <div className="mt-8">
            {loading ? (
              <p>טוען נתונים...</p>
            ) : (
              <SuppliersTable
                suppliers={suppliers}
                onDelete={handleDeleteSupplier}
                onEdit={handleEditClick}
                onRowClick={setSelectedSupplier}
              />
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="עריכת ספק"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>ביטול</Button>
            <Button variant="primary" onClick={handleUpdateSupplier}>שמור שינויים</Button>
          </>
        }
      >
        {currentUser && (
          <div className="space-y-4">
            <Input
              label="שם הספק"
              name="name"
              value={currentUser.name || ''}
              onChange={handleEditChange}
            />
            <Input
              label="איש קשר"
              name="poc_name"
              value={currentUser.poc_name || ''}
              onChange={handleEditChange}
            />
            <Input
              label="טלפון"
              name="poc_phone"
              value={currentUser.poc_phone || ''}
              onChange={handleEditChange}
              error={errors.poc_phone}
              helperText="נייד (10 ספרות) או נייח (9 ספרות)"
            />
            <Input
              label="אימייל"
              type="email"
              name="poc_email"
              value={currentUser.poc_email || ''}
              onChange={handleEditChange}
            />
            <Select
              name="supplier_field_id"
              label="תחום ספק"
              value={currentUser.supplier_field_id || ''}
              onChange={handleEditChange}
              options={supplierFields.map(field => ({
                value: field.supplier_field_id,
                label: field.field
              }))}
            />
            <Input
              label="סטטוס"
              name="status"
              value={currentUser.status || ''}
              onChange={handleEditChange}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SuppliersPage;
