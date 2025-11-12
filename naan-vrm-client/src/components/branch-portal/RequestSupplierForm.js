import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';

function RequestSupplierForm({ open, onClose, onSuccess, userId, branchId }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    poc_name: '',
    poc_email: '',
    poc_phone: ''
  });
  const [supplierFields, setSupplierFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [newField, setNewField] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (open) {
      api.get('/supplier-fields')
        .then(response => {
          setSupplierFields(response.data);
        })
        .catch(err => {
          console.error("Failed to fetch supplier fields:", err);
          setError("שגיאה בטעינת תחומי הספקים.");
        });
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  const validateForm = () => {
    const errors = {};
    
    // Supplier ID validation - required, up to 9 digits
    if (!formData.supplier_id || !formData.supplier_id.trim()) {
      errors.supplier_id = 'מספר ח.פ. הוא שדה חובה';
    } else if (!/^\d{1,9}$/.test(formData.supplier_id.trim())) {
      errors.supplier_id = 'מספר ח.פ. חייב להכיל עד 9 ספרות';
    }
    
    // Email validation - English letters only and valid format (only if provided)
    if (formData.poc_email && formData.poc_email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.poc_email)) {
        errors.poc_email = 'כתובת אימייל לא תקינה. יש להשתמש באותיות אנגלית בלבד';
      }
    }
    
    // Phone validation - exactly 10 digits (only if provided)
    if (formData.poc_phone && formData.poc_phone.trim()) {
      const phoneDigits = formData.poc_phone.replace(/-/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        errors.poc_phone = 'מספר טלפון חייב להכיל בדיוק 10 ספרות';
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    // Validation check
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    setError('');
    
    try {
      await api.post('/supplier-requests', {
        ...formData,
        requested_by_user_id: userId,
        branch_id: branchId,
        supplier_field_id: selectedField === 'new' ? null : selectedField,
        new_supplier_field: selectedField === 'new' ? newField : null,
      });
      onSuccess();
    } catch (err) {
      console.error("Failed to submit request:", err);
      setError('הגשת הבקשה נכשלה, אנא נסה שוב.');
    }
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose}
      title="בקשה להוספת ספק חדש"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button variant="primary" onClick={handleSubmit}>שלח בקשה</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input 
          autoFocus 
          name="supplier_name" 
          label="שם הספק" 
          value={formData.supplier_name}
          onChange={handleChange} 
          required 
        />
        
        <Input 
          name="supplier_id" 
          label="מספר ח.פ. ספק" 
          value={formData.supplier_id}
          onChange={handleChange} 
          required
          error={validationErrors.supplier_id}
          helperText="עד 9 ספרות"
        />
        
        <Select
          label="תחום הספק"
          value={selectedField}
          onChange={handleFieldChange}
          options={[
            { value: 'new', label: 'אחר (תחום חדש)' },
            ...supplierFields.map(fieldOption => ({
              value: fieldOption.supplier_field_id,
              label: fieldOption.field
            }))
          ]}
          required
        />

        {selectedField === 'new' && (
          <Input 
            name="new_field" 
            label="שם התחום החדש" 
            value={newField}
            onChange={(e) => setNewField(e.target.value)} 
            required 
          />
        )}

        <Input 
          name="poc_name" 
          label="שם איש קשר" 
          value={formData.poc_name}
          onChange={handleChange}
          required
        />
        <Input 
          name="poc_email" 
          label="אימייל איש קשר" 
          type="email" 
          value={formData.poc_email}
          onChange={handleChange}
          error={validationErrors.poc_email}
        />
        <Input 
          name="poc_phone" 
          label="טלפון איש קשר" 
          type="tel" 
          value={formData.poc_phone}
          onChange={handleChange}
          required
          error={validationErrors.poc_phone}
          helperText="ניתן להזין מקפים, לדוגמה: 052-123-1234"
        />
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
    </Modal>
  );
}

export default RequestSupplierForm;
