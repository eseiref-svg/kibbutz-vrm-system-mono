
import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';
import TransactionInputSection from '../shared/TransactionInputSection';
import Button from '../shared/Button';

function CreateSaleForm({ clientId, clientName, defaultBranchId, onSaleCreated, onCancel }) {
  const [formData, setFormData] = useState({
    client_id: clientId,
    branch_id: defaultBranchId,
    value: '',
    transaction_date: new Date().toISOString().split('T')[0], // Default to today
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
          const response = await api.get(`/clients/${clientId}`);
          // Support both direct property and nested data
          const data = response.data.data || response.data;
          setClientTerms(data.payment_terms || data.default_payment_terms);

          // If we don't have a defaultBranchId, try to guess or fetch? 
          // For now, we rely on the parent passing it.
        } catch (err) {
          console.error('Error fetching client details:', err);
        }
      }
    };
    fetchClientDetails();
  }, [clientId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Branch ID
    const effectiveBranchId = formData.branch_id || defaultBranchId;
    if (!effectiveBranchId) {
      setError('שגיאה: חסר מזהה ענף. לא ניתן ליצור דרישת תשלום ללא שיוך לענף.');
      return;
    }

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
      const payload = {
        client_id: formData.client_id,
        branch_id: effectiveBranchId,
        value: formData.value,
        due_date: formData.transaction_date, // Map to server expected field
        description: formData.description,
        payment_terms: clientTerms
      };

      await api.post('/sales', payload); // Correct endpoint
      onSaleCreated();
    } catch (err) {
      console.error('Sale creation error:', err);
      setError(err.response?.data?.message || 'שגיאה בשליחת דרישת התשלום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">יצירת דרישת תשלום חדשה - {clientName}</h3>
        {/* Debug info if needed, or hidden */}
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <TransactionInputSection
          amount={formData.value || ''}
          date={formData.transaction_date || ''}
          description={formData.description || ''}
          onChange={(name, value) => {
            const map = { amount: 'value', date: 'transaction_date', description: 'description' };
            handleChange({ target: { name: map[name] || name, value } });
          }}
          amountLabel="סכום העסקה (ללא מע״מ)"
          dateLabel="תאריך עסקה"
          descriptionLabel="תיאור/הערות"
          paymentTerms={clientTerms}
        />

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={loading}
          >
            {loading ? 'שולח...' : 'שלח לאישור'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateSaleForm;




