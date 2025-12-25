import React, { useState } from 'react';
import Button from '../shared/Button';
import TransactionInputSection from './TransactionInputSection';

function TransactionForm({
    initialData = {},
    onSubmit,
    onCancel,
    title = 'יצירת דרישת תשלום חדשה',
    isSubmitting = false,
    submitLabel = 'שלח לאישור',
    paymentTerms
}) {
    const [formData, setFormData] = useState({
        amount: '', // Amount excluding VAT
        date: new Date().toISOString().split('T')[0],
        description: '',
        ...initialData
    });

    const handleSectionChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Calculate amountInclVat here if needed, but we pass raw data usually.
        // Assuming backend handles logic or parent handles logic.
        // Parent CreatePaymentRequestForm currently handles 'amount' * 1.18 logic in 'handleSubmit'.
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>

            <TransactionInputSection
                amount={formData.amount}
                date={formData.date}
                description={formData.description}
                onChange={handleSectionChange}
                paymentTerms={paymentTerms}
            />

            <div className="flex gap-4 pt-6 mt-2 border-t border-gray-100">
                <Button type="submit" variant="success" className="px-8" disabled={isSubmitting}>
                    {isSubmitting ? 'שולח...' : submitLabel}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} className="bg-gray-400 text-white hover:bg-gray-500 border-none">
                    ביטול
                </Button>
            </div>
        </form>
    );
}

export default TransactionForm;
