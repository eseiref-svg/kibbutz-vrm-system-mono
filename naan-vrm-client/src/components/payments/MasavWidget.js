import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';

function MasavWidget() {
    const [balance, setBalance] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);

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
            console.error('Error fetching bank balance for Masav widget:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm p-6 flex flex-col h-full justify-center items-center">
                <p className="text-gray-500 text-sm">טוען נתונים...</p>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm p-6 flex flex-col h-full relative group transition-transform hover:scale-105">
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600">מס"ב הקרוב</h3>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(balance)}
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
            </div>
        </div>
    );
}

export default MasavWidget;
