import React, { useState } from 'react';
import api from '../../api/axiosConfig';

function CreateSaleForm({ clientId, clientName, defaultBranchId, onSaleCreated, onCancel }) {
  const [formData, setFormData] = useState({
    client_id: clientId,
    branch_id: defaultBranchId,
    value: '',
    transaction_date: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Calculate VAT (18%) and total amount
  const valueWithoutVat = parseFloat(formData.value) || 0;
  const totalWithVat = valueWithoutVat * 1.18;

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

    if (!formData.value || !formData.transaction_date) {
      setError('סכום עסקה ותאריך עסקה הם שדות חובה');
      setLoading(false);
      return;
    }

    try {
      await api.post('/sales/request', formData);
      onSaleCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשליחת דרישת התשלום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">יצירת דרישת תשלום חדשה - {clientName}</h3>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">תאריך עסקה *</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">סכום העסקה (ללא מע״מ) *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">סכום לתשלום (כולל מע״מ)</label>
            <input
              type="text"
              value={totalWithVat.toFixed(2)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-bold"
              readOnly
              disabled
            />
            <p className="text-xs text-gray-600 mt-1">מחושב אוטומטית: סכום העסקה × 1.18</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">תיאור/הערות</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="פרטים נוספים על העסקה..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white hover:bg-gray-500 font-bold py-2 px-6 rounded-lg"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'שולח...' : 'שלח לאישור'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSaleForm;



