import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';
import { validatePhoneNumber, validateEmail, validateRequired } from '../../utils/validation';

function ApproveClientModal({ isOpen, onClose, clientRequest, onApprove }) {
  const [formData, setFormData] = useState({
    client_number: '',
    client_name: '',
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    city: '',
    street_name: '',
    house_no: '',
    zip_code: '',
    payment_terms: 'current_50', // Default: current +50 days
    review_notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (clientRequest) {
      setFormData({
        client_number: '',
        client_name: clientRequest.client_name || '',
        poc_name: clientRequest.poc_name || '',
        poc_phone: clientRequest.poc_phone || '',
        poc_email: clientRequest.poc_email || '',
        city: clientRequest.city || '',
        street_name: clientRequest.street_name || '',
        house_no: clientRequest.house_no || '',
        zip_code: clientRequest.zip_code || '',
        payment_terms: 'current_50',
        review_notes: ''
      });
    }
  }, [clientRequest]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      { value: formData.client_number, name: 'client_number', label: 'מספר לקוח' },
      { value: formData.client_name, name: 'client_name', label: 'שם הלקוח' },
      { value: formData.poc_name, name: 'poc_name', label: 'שם איש קשר' }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onApprove(clientRequest.client_req_id, formData);
      onClose();
    } catch (error) {
      console.error('Error approving client:', error);
      setErrors({ submit: error.response?.data?.message || 'שגיאה באישור הלקוח' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!clientRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="אישור בקשה ללקוח חדש"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Client number - required */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">מספר לקוח *</h4>
          <Input
            name="client_number"
            label="מספר לקוח (מזהה עסקי ייחודי) *"
            value={formData.client_number}
            onChange={handleChange}
            error={errors.client_number}
            placeholder="לדוגמה: C12345 או 12345"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            הזן מספר ייחודי ללקוח. מספר זה ישמש לזיהוי הלקוח במערכת (בהמשך יימסר ע"י ERP חיצוני).
          </p>
        </div>

        {/* Payment terms - default */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">תנאי תשלום</h4>
          <Select
            name="payment_terms"
            label="תנאי תשלום ברירת מחדל ללקוח"
            value={formData.payment_terms}
            onChange={handleChange}
            options={[
              { value: 'immediate', label: 'מיידי' },
              { value: 'current_15', label: 'שוטף +15 ימים' },
              { value: 'current_35', label: 'שוטף +35 ימים' },
              { value: 'current_50', label: 'שוטף +50 ימים' }
            ]}
            fullWidth
          />
          <p className="text-sm text-gray-600 mt-1">
            תנאי תשלום אלו ישמשו כברירת מחדל עבור עסקאות עם לקוח זה.
          </p>
        </div>

        {/* Client details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">פרטי הלקוח (ניתן לעריכה)</h4>

          <Input
            name="client_name"
            label="שם הלקוח *"
            value={formData.client_name}
            onChange={handleChange}
            error={errors.client_name}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="poc_name"
              label="שם איש קשר *"
              value={formData.poc_name}
              onChange={handleChange}
              error={errors.poc_name}
              required
            />

            <Input
              name="poc_phone"
              label="טלפון איש קשר *"
              value={formData.poc_phone}
              onChange={handleChange}
              error={errors.poc_phone}
              required
              helperText="נייד (10 ספרות) או נייח (9 ספרות)"
            />
          </div>

          <Input
            name="poc_email"
            label="אימייל איש קשר"
            type="email"
            value={formData.poc_email}
            onChange={handleChange}
            error={errors.poc_email}
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

          <Input
            name="review_notes"
            label="הערות (אופציונלי)"
            value={formData.review_notes}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? 'מאשר...' : 'אשר וצור לקוח'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ApproveClientModal;


