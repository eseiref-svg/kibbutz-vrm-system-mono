import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Button from './shared/Button';
import Input from './shared/Input';
import Select from './shared/Select';
import Modal from './shared/Modal';

function AddSupplierForm({ open, onClose, onSupplierAdded, supplierFields, initialData = null }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    address_id: 1, 
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    supplier_field_id: 1, 
    payment_terms_id: 1, 
    status: 'pending'
  });

  // Fill form with initial data if available
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        supplier_id: initialData.requested_supplier_id || '',
        name: initialData.supplier_name || '',
        address_id: 1,
        poc_name: initialData.poc_name || '',
        poc_phone: initialData.poc_phone || '',
        poc_email: initialData.poc_email || '',
        supplier_field_id: initialData.supplier_field_id || 1,
        payment_terms_id: 1,
        status: 'pending'
      });
    } else if (!initialData && open) {
      // Reset form if no initial data
      setFormData({
        supplier_id: '',
        name: '',
        address_id: 1,
        poc_name: '',
        poc_phone: '',
        poc_email: '',
        supplier_field_id: 1,
        payment_terms_id: 1,
        status: 'pending'
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/suppliers', formData);
      onSupplierAdded(response.data); 
      alert('✅ הספק נוסף בהצלחה!');
      onClose();
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('❌ שגיאה בהוספת הספק. אנא נסה שוב.');
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={initialData ? 'אישור הוספת ספק' : 'הוספת ספק חדש'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button variant="success" onClick={handleSubmit}>שמור ספק</Button>
        </>
      }
    >
      <div className="space-y-4">
        {initialData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <p className="text-sm text-blue-800">
              ✨ הטופס ממולא מראש עם הפרטים מהבקשה.
            </p>
          </div>
        )}
        
        <Input 
          name="supplier_id" 
          label="מספר ח.פ. ספק"
          value={formData.supplier_id} 
          onChange={handleChange} 
          required
          helperText="עד 9 ספרות"
        />
        
        <Input 
          name="name" 
          label="שם הספק"
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        
        <Select
          name="supplier_field_id"
          label="תחום הספק"
          value={formData.supplier_field_id}
          onChange={handleChange}
          options={supplierFields.map(field => ({
            value: field.supplier_field_id,
            label: field.field
          }))}
          required
        />
        
        <Input 
          name="poc_name" 
          label="שם איש קשר"
          value={formData.poc_name} 
          onChange={handleChange} 
          required 
        />
        
        <Input 
          name="poc_phone" 
          label="טלפון איש קשר"
          value={formData.poc_phone} 
          onChange={handleChange} 
          required
          helperText="10 ספרות"
        />
        
        <Input 
          name="poc_email" 
          label="אימייל איש קשר"
          type="email"
          value={formData.poc_email} 
          onChange={handleChange} 
          required 
        />
      </div>
    </Modal>
  );
}

export default AddSupplierForm;
