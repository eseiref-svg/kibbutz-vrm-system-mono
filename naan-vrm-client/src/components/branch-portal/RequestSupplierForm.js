import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { validatePhoneNumber, validateEmail, validateRequired } from '../../utils/validation';
function RequestSupplierForm({ open, onClose, onSuccess, userId, branchId }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    poc_name: '',
    poc_email: '',
    poc_phone: '',
    street_name: '',
    house_no: '',
    city: '',
    zip_code: ''
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

    const requiredFields = [
      { value: formData.supplier_name, name: 'supplier_name', label: 'שם הספק' },
      { value: formData.supplier_id, name: 'supplier_id', label: 'מספר ח.פ. ספק' },
      { value: formData.city, name: 'city', label: 'עיר' },
      { value: formData.street_name, name: 'street_name', label: 'רחוב' },
      { value: formData.house_no, name: 'house_no', label: 'מספר בית' },
      { value: formData.poc_name, name: 'poc_name', label: 'שם איש קשר' },
      { value: formData.poc_phone, name: 'poc_phone', label: 'טלפון איש קשר' }
    ];

    if (!selectedField) {
      errors.selectedField = 'תחום הספק הוא שדה חובה';
    }
    if (selectedField === 'new' && !newField) {
      errors.new_field = 'שם התחום החדש הוא שדה חובה';
    }

    for (const field of requiredFields) {
      const validation = validateRequired(field.value, field.label);
      if (!validation.isValid) {
        errors[field.name] = validation.error;
      }
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(formData.poc_phone);
    if (!phoneValidation.isValid) {
      errors.poc_phone = phoneValidation.error;
    }

    // Email validation
    const emailValidation = validateEmail(formData.poc_email);
    if (!emailValidation.isValid) {
      errors.poc_email = emailValidation.error;
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
          error={validationErrors.supplier_name}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="city"
            label="עיר"
            value={formData.city}
            onChange={handleChange}
            required
            error={validationErrors.city}
          />
          <Input
            name="street_name"
            label="רחוב"
            value={formData.street_name}
            onChange={handleChange}
            required
            error={validationErrors.street_name}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="house_no"
            label="מספר בית"
            value={formData.house_no}
            onChange={handleChange}
            required
            error={validationErrors.house_no}
          />
          <Input
            name="zip_code"
            label="מיקוד"
            value={formData.zip_code}
            onChange={handleChange}
            error={validationErrors.zip_code}
          />
        </div>

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
          error={validationErrors.selectedField}
        />

        {selectedField === 'new' && (
          <Input
            name="new_field"
            label="שם התחום החדש"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            required
            error={validationErrors.new_field}
          />
        )}

        <Input
          name="poc_name"
          label="שם איש קשר"
          value={formData.poc_name}
          onChange={handleChange}
          required
          error={validationErrors.poc_name}
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
