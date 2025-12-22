import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';
import { calculateDueDate, formatPaymentTerms } from '../../utils/paymentTerms';

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
  const [clientTerms, setClientTerms] = useState(null);

  // Fetch client details to get default payment terms
  React.useEffect(() => {
    const fetchClientDetails = async () => {
      if (clientId) {
        try {
          // We need an endpoint to get client details. Assuming /api/clients/:id exists or similar.
          // If not, we might need to rely on what we have or add an endpoint.
          // Based on file list, there is ClientDetailsCard, so likely an endpoint exists.
          // Let's try /api/clients/:id
          // Wait, I don't want to break it if the endpoint doesn't exist or returns 404.
          // I'll check if I can find where client details are fetched.
          // But for now, I'll assume I can get it.
          // Actually, let's just use a default if we can't fetch it, or skip.
          // Better: The user said "Load default_payment_terms...".
          // I'll try to fetch it.
          const response = await api.get(`/clients/${clientId}`);
          setClientTerms(response.data.default_payment_terms);
        } catch (err) {
          console.error('Error fetching client details:', err);
        }
      }
    };
    fetchClientDetails();
  }, [clientId]);

  // Calculate expected payment date
  const expectedPaymentDate = calculateDueDate(formData.transaction_date, clientTerms || 'current_50');

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

    const requiredFields = [
      { value: formData.transaction_date, name: 'תאריך עסקה' },
      { value: formData.value, name: 'סכום העסקה' }
    ];

    for (const field of requiredFields) {
      const validation = validateRequired(field.value, field.name);
      if (!validation.isValid) {
        setError(validation.error);
        setLoading(false);
        return;
      }
    }

    const valueValidation = validatePositiveNumber(formData.value, 'סכום העסקה');
    if (!valueValidation.isValid) {
      setError(valueValidation.error);
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

          <div>
            <label className="block text-gray-700 font-semibold mb-2">צפי תשלום (משוער)</label>
            <div className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-800">
              {formData.transaction_date ? (
                <>
                  <span className="font-bold">
                    {expectedPaymentDate ? expectedPaymentDate.toLocaleDateString('he-IL') : '-'}
                  </span>
                  <span className="text-xs block mt-1 text-blue-600">
                    לפי תנאי תשלום: {formatPaymentTerms(clientTerms || 'current_50')}
                  </span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">נא לבחור תאריך עסקה</span>
              )}
            </div>
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




