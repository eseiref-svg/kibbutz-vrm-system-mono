import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import TransactionForm from '../shared/TransactionForm';

function CreatePaymentRequestForm({ open, onClose, supplier, branchId, onSuccess, autoApprove = false }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async (formData) => {
        setError('');
        setLoading(true);

        try {
            if (!branchId) {
                throw new Error('שגיאה: זיהוי ענף חסר.');
            }

            const amountExcl = parseFloat(formData.amount);
            const amountIncl = amountExcl * 1.18;

            await api.post('/payment-requests', {
                supplier_id: supplier.supplier_id,
                branch_id: branchId,
                amount: amountIncl, // Sending the total amount including VAT
                transaction_date: formData.date,
                description: formData.description,
                payment_terms: formData.payment_terms,
                invoice_number: '',
                auto_approve: !!autoApprove // Flag for server
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create request:', err);
            setError(err.message || 'שגיאה ביצירת הבקשה.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl px-4">
                <TransactionForm
                    title={`יצירת דרישת תשלום עבור ${supplier?.name}`}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isSubmitting={loading}
                    paymentTerms={supplier?.payment_terms}
                />
                {error && (
                    <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-lg text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreatePaymentRequestForm;
