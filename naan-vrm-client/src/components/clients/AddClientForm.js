import React, { useState } from 'react';
import api from '../../api/axiosConfig';

function AddClientForm({ onClientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    city: '',
    street: '',
    postal_code: ''
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

    if (!formData.name || !formData.poc_name || !formData.poc_phone) {
      setError('שם הלקוח, שם איש הקשר וטלפון הם שדות חובה');
      setLoading(false);
      return;
    }

    try {
      await api.post('/clients', formData);
      alert('הלקוח נוסף בהצלחה!');
      onClientAdded();
      setFormData({
        name: '',
        poc_name: '',
        poc_phone: '',
        poc_email: '',
        city: '',
        street: '',
        postal_code: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהוספת הלקוח');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">הוספת לקוח חדש</h3>
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
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'שומר...' : 'הוסף לקוח'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddClientForm;



