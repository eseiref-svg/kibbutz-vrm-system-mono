import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { validatePhoneNumber, validateEmail, validateRequired } from '../utils/validation';
import Button from './shared/Button';
import Input from './shared/Input';
import Select from './shared/Select';
import Modal from './shared/Modal';

function AddSupplierForm({ open, onClose, onSupplierAdded, supplierFields, initialData = null }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    address_id: null,
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    supplier_field_id: 1,
    payment_terms_id: 1,
    status: 'pending',
    street: '',
    house_no: '',
    city: '',
    zip_code: ''
  });
  const [errors, setErrors] = useState({});

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
        address_id: null,
        poc_name: '',
        poc_phone: '',
        poc_email: '',
        supplier_field_id: 1,
        payment_terms_id: 1,
        status: 'pending',
        street: '',
        house_no: '',
        city: '',
        zip_code: ''
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    const requiredFields = [
      { value: formData.supplier_id, name: 'supplier_id', label: 'מספר ח.פ. ספק' },
      { value: formData.name, name: 'name', label: 'שם הספק' },
      { value: formData.poc_name, name: 'poc_name', label: 'שם איש קשר' },
      { value: formData.poc_phone, name: 'poc_phone', label: 'טלפון איש קשר' },
      { value: formData.poc_email, name: 'poc_email', label: 'אימייל איש קשר' }
    ];

    for (const field of requiredFields) {
      const validation = validateRequired(field.value, field.label);
      if (!validation.isValid) {
        newErrors[field.name] = validation.error;
      }
    }

    const phoneValidation = validatePhoneNumber(formData.poc_phone);
    if (!phoneValidation.isValid) {
      newErrors.poc_phone = phoneValidation.error;
    }

    const emailValidation = validateEmail(formData.poc_email);
    if (!emailValidation.isValid) {
      newErrors.poc_email = emailValidation.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
          error={errors.supplier_id}
        />

        <Input
          name="name"
          label="שם הספק"
          value={formData.name}
          onChange={handleChange}
          required
          error={errors.name}
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
          error={errors.poc_name}
        />

        <Input
          name="poc_phone"
          label="טלפון איש קשר"
          value={formData.poc_phone}
          onChange={handleChange}
          required
          helperText="נייד (10 ספרות) או נייח (9 ספרות)"
          error={errors.poc_phone}
        />

        <Input
          name="poc_email"
          label="אימייל איש קשר"
          type="email"
          value={formData.poc_email}
          onChange={handleChange}
          required
          error={errors.poc_email}
        />

        <div className="border-t pt-2 mt-2">
          <h4 className="text-md font-semibold mb-2">כתובת</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="city"
              label="עיר"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              name="street"
              label="רחוב"
              value={formData.street}
              onChange={handleChange}
            />
            <Input
              name="house_no"
              label="מס' בית"
              value={formData.house_no}
              onChange={handleChange}
            />
            <Input
              name="zip_code"
              label="מיקוד"
              value={formData.zip_code}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AddSupplierForm;
