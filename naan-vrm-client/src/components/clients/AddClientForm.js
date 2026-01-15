import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { validatePhoneNumber, validateEmail, validateRequired } from '../../utils/validation';
import { PAYMENT_TERMS_OPTIONS } from '../../utils/paymentTerms';

function AddClientForm({ onClientAdded, initialData = null, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    client_number: initialData?.client_number || '', // Added client_number
    poc_name: initialData?.poc_name || '',
    poc_phone: initialData?.poc_phone || '',
    poc_email: initialData?.poc_email || '',
    city: initialData?.city || '',
    street: initialData?.street_name || '', // Note: DB returns street_name
    postal_code: initialData?.zip_code || '', // Note: DB returns zip_code
    payment_terms: initialData?.payment_terms || 'immediate'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const requiredFields = [
      { value: formData.name, name: 'שם הלקוח' },
      { value: formData.poc_name, name: 'שם איש קשר' },
      { value: formData.poc_phone, name: 'טלפון' }
    ];

    for (const field of requiredFields) {
      const validation = validateRequired(field.value, field.name);
      if (!validation.isValid) {
        setError(validation.error);
        setLoading(false);
        return;
      }
    }

    const phoneValidation = validatePhoneNumber(formData.poc_phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error);
      setLoading(false);
      return;
    }

    const emailValidation = validateEmail(formData.poc_email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setLoading(false);
      return;
    }

    // Map frontend fields to backend expectation if needed
    // Backend expects: name, poc_name, poc_phone, poc_email, city, street_name, zip_code, payment_terms, client_number
    // Frontend state uses: street, postal_code
    const payload = {
      ...formData,
      street_name: formData.street,
      zip_code: formData.postal_code
    };
    // Ensure client_number is sent even if empty string (will be handled as null/empty by backend if logic permits, or we should check)
    // Backend `client_number || null` logic handles empty string as valid string usually, let's explicit null if empty
    if (!payload.client_number) delete payload.client_number; // Or send as is if backend handles it. Backend: client_number || null. 
    // If client_number is '' (empty string), JS `'' || null` is `null`. Correct.

    try {
      if (initialData) {
        await api.put(`/clients/${initialData.client_id}`, payload);
        alert('הלקוח עודכן בהצלחה!');
      } else {
        await api.post('/clients', payload);
        alert('הלקוח נוסף בהצלחה!');
      }

      onClientAdded();
      if (!initialData) {
        setFormData({
          name: '',
          client_number: '',
          poc_name: '',
          poc_phone: '',
          poc_email: '',
          city: '',
          street: '',
          postal_code: '',
          payment_terms: 'immediate'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשמירת הלקוח');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{initialData ? 'עריכת פרטי לקוח' : 'הוספת לקוח חדש'}</h3>
        {/* Duplicate Cancel button removed as per request */}
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">שם הלקוח *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">מספר לקוח</label>
            <input
              type="text"
              name="client_number"
              value={formData.client_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">שם איש קשר *</label>
            <input
              type="text"
              name="poc_name"
              value={formData.poc_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">טלפון *</label>
            <input
              type="text"
              name="poc_phone"
              value={formData.poc_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">נייד (10 ספרות) או נייח (9 ספרות)</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">אימייל</label>
            <input
              type="email"
              name="poc_email"
              value={formData.poc_email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">עיר</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">רחוב</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">מיקוד</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">תנאי תשלום</label>
            <select
              name="payment_terms"
              value={formData.payment_terms}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_TERMS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'שומר...' : (initialData ? 'עדכן פרטים' : 'הוסף לקוח')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddClientForm;
