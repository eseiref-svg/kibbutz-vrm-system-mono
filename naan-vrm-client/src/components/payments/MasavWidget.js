import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

// Utility to format date for display (DD/MM/YYYY)
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
};

// Utility to format amount (ILS)
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

function MasavWidget({ initialDate, initialAmount, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Initialize edit values when entering edit mode or props change
    useEffect(() => {
        if (initialDate) {
            // Format for input type="date" (YYYY-MM-DD)
            const d = new Date(initialDate);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            setEditDate(`${yyyy}-${mm}-${dd}`);
        }
        if (initialAmount) {
            setEditAmount(initialAmount);
        }
    }, [initialDate, initialAmount]);

    const handleSave = async () => {
        try {
            setSubmitting(true);

            const numericAmount = parseFloat(String(editAmount).replace(/,/g, ''));

            await api.put('/payments/masav', {
                date: editDate,
                amount: isNaN(numericAmount) ? 0 : numericAmount
            });

            onUpdate(); // Refresh parent data
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating Masav details:', error);
            alert('שגיאה בעדכון פרטי מס"ב');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAmountChange = (e) => {
        // Basic numeric input handling
        const val = e.target.value;
        setEditAmount(val);
    };

    if (isEditing) {
        return (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm p-6 flex flex-col h-full">
                <h3 className="text-sm font-medium text-gray-600 mb-4">מס"ב הקרוב</h3>

                <div className="space-y-3 mb-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">תאריך:</label>
                        <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">סכום משוער:</label>
                        <input
                            type="number"
                            value={editAmount}
                            onChange={handleAmountChange}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="₪"
                        />
                    </div>
                </div>

                <div className="mt-auto flex gap-2 justify-center w-full">
                    <Button variant="success" size="xs" onClick={handleSave} disabled={submitting} fullWidth>
                        שמור
                    </Button>
                    <Button variant="secondary" size="xs" onClick={() => setIsEditing(false)} disabled={submitting} fullWidth>
                        ביטול
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm p-6 flex flex-col h-full relative group transition-transform hover:scale-105">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 left-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                title="ערוך"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>

            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600">מס"ב הקרוב</h3>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                {initialDate ? (
                    <div className="text-xl font-bold text-blue-800 mb-1">
                        {formatDate(initialDate)}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic mb-1">לא הוגדר תאריך</div>
                )}

                {initialAmount ? (
                    <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(initialAmount)}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic">לא הוגדר סכום</div>
                )}
            </div>
        </div>
    );
}

export default MasavWidget;
