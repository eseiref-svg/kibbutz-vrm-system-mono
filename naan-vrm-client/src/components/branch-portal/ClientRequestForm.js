import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import Input from '../shared/Input';

function ClientRequestForm({ open, onClose, onSuccess, branchId }) {
  const [formData, setFormData] = useState({
    client_name: '',
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    city: '',
    street_name: '',
    house_no: '',
    zip_code: ''
  });
  
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      client_name: '',
      poc_name: '',
      poc_phone: '',
      poc_email: '',
      city: '',
      street_name: '',
      house_no: '',
      zip_code: ''
    });
    setError('');
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.client_name || !formData.client_name.trim()) {
      errors.client_name = 'שם הלקוח הוא שדה חובה';
    }
    
    if (!formData.poc_name || !formData.poc_name.trim()) {
      errors.poc_name = 'שם איש הקשר הוא שדה חובה';
    }
    
    // Phone validation - required, exactly 10 digits
    if (!formData.poc_phone || !formData.poc_phone.trim()) {
      errors.poc_phone = 'טלפון איש קשר הוא שדה חובה';
    } else {
      const phoneDigits = formData.poc_phone.replace(/-/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        errors.poc_phone = 'מספר טלפון חייב להכיל בדיוק 10 ספרות';
      }
    }
    
    // Email validation - English letters only and valid format (only if provided)
    if (formData.poc_email && formData.poc_email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.poc_email)) {
        errors.poc_email = 'כתובת אימייל לא תקינה. יש להשתמש באותיות אנגלית בלבד';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const requestData = {
        branch_id: branchId,
        ...formData
      };
      
      await api.post('/client-requests', requestData);
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error submitting client request:', err);
      setError(err.response?.data?.message || 'שגיאה בשליחת הבקשה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="בקשה לרישום לקוח חדש"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Client Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">פרטי הלקוח</h4>
          
          <Input
            name="client_name"
            label="שם הלקוח *"
            value={formData.client_name}
            onChange={handleChange}
            error={validationErrors.client_name}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="poc_name"
              label="שם איש קשר *"
              value={formData.poc_name}
              onChange={handleChange}
              error={validationErrors.poc_name}
              required
            />

            <Input
              name="poc_phone"
              label="טלפון איש קשר *"
              value={formData.poc_phone}
              onChange={handleChange}
              error={validationErrors.poc_phone}
              required
            />
          </div>

          <Input
            name="poc_email"
            label="אימייל איש קשר"
            type="email"
            value={formData.poc_email}
            onChange={handleChange}
            error={validationErrors.poc_email}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="city"
              label="עיר"
              value={formData.city}
              onChange={handleChange}
            />

            <Input
              name="street_name"
              label="רחוב"
              value={formData.street_name}
              onChange={handleChange}
            />

            <Input
              name="house_no"
              label="מספר בית"
              value={formData.house_no}
              onChange={handleChange}
            />
          </div>

          <Input
            name="zip_code"
            label="מיקוד"
            value={formData.zip_code}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'שולח...' : 'שלח בקשה'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ClientRequestForm;

