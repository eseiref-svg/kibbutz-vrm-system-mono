import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

function BankBalanceWidget() {
    const [balance, setBalance] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/bank-balance');
            setBalance(response.data.value);
            setLastUpdated(response.data.updated_at);
        } catch (error) {
            console.error('Error fetching bank balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '';
        // Use he-IL locale which uses comma as thousands separator
        return Number(num).toLocaleString('he-IL', { maximumFractionDigits: 2 });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        // Clean format for editing but keep decimals if any
        setEditValue(balance ? formatNumber(balance) : '');
    };

    const handleInputChange = (e) => {
        let val = e.target.value;

        // Auto-convert Hebrew char (which is on the '.' key) to dot
        val = val.replace(/ץ/g, '.');

        // Allow digits, one dot, and commas (keep commas for display)
        // Regex allows: empty string, digits, commas, and optionally one decimal point followed by up to 2 digits
        // But we need to be careful with commas.
        // Strategy: 
        // 1. Remove non-numeric chars (expect dot)
        // 2. Format with commas

        // Remove all non-numeric and non-dot characters
        const cleanVal = val.replace(/[^0-9.]/g, '');

        // Handle multiple dots (keep only first)
        const parts = cleanVal.split('.');
        if (parts.length > 2) {
            return; // Ignore invalid input with multiple dots
        }

        // Limit decimal places to 2
        let integerPart = parts[0];
        let decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

        // If user is typing dot, let them
        if (val.endsWith('.') && !decimalPart) {
            decimalPart = '.';
        }

        // Format integer part with commas
        const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        setEditValue(formattedInt + decimalPart);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            // Parse value: remove commas
            const numericValue = parseFloat(editValue.replace(/,/g, ''));

            if (isNaN(numericValue)) {
                alert('נא להזין מספר תקין');
                setSubmitting(false);
                return;
            }

            const response = await api.put('/dashboard/bank-balance', { value: numericValue });
            setBalance(response.data.value);
            setLastUpdated(response.data.updated_at);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating bank balance:', error);
            alert('שגיאה בעדכון יתרת הבנק');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-gray-500">טוען יתרה...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">יתרות בנקים (₪)</h3>
                {!isEditing && (
                    <button
                        onClick={handleEditClick}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="ערוך יתרה"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-grow flex flex-col items-center justify-center py-4">
                {isEditing ? (
                    <div className="w-full">
                        <input
                            type="text"
                            value={editValue}
                            onChange={handleInputChange}
                            className="w-full text-center text-3xl font-extrabold text-gray-800 border-b-2 border-blue-500 focus:outline-none mb-4 font-mono"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-center w-full">
                            <Button variant="success" size="sm" onClick={handleSave} disabled={submitting} fullWidth>
                                {submitting ? 'שומר...' : 'שמור'}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleCancel} disabled={submitting} fullWidth>
                                ביטול
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-4xl font-extrabold text-green-600 mb-2">
                            ₪{formatNumber(balance)}
                        </div>
                        {lastUpdated ? (
                            <p className="text-gray-500 text-xs mt-2">
                                עדכון אחרון: {new Date(lastUpdated).toLocaleString('he-IL')}
                            </p>
                        ) : (
                            <p className="text-gray-400 text-xs mt-2">
                                טרם עודכן
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default BankBalanceWidget;
