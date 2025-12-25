import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import api from '../../api/axiosConfig';

function LowRatedSuppliersWidget() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowRatedSuppliers = async () => {
            try {
                // Fetch all suppliers and filter client-side for now, or add a dedicated endpoint
                // Using existing search endpoint: /api/suppliers/search?criteria=... 
                // Or better, fetch all and filter.
                const response = await api.get('/suppliers/search');
                // Filter suppliers with rating > 0 and < 3
                const lowRated = response.data.filter(s => {
                    const rating = parseFloat(s.average_rating);
                    return rating > 0 && rating < 3.0;
                });
                setSuppliers(lowRated);
            } catch (err) {
                console.error("Error fetching low rated suppliers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLowRatedSuppliers();
    }, []);

    if (loading) return null;
    if (suppliers.length === 0) return null; // Don't show if empty

    return (
        <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-xl font-bold text-red-800">ספקים בסיכון (דירוג נמוך)</h3>
            </div>
            <p className="text-sm text-red-600 mb-4">
                הספקים הבאים קיבלו דירוג איכות נמוך (מתחת ל-3.0) ונדרשים לבחינה מחדש:
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden border border-red-100">
                    <thead className="bg-red-100">
                        <tr>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-red-800">שם הספק</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-red-800">דירוג נוכחי</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-red-800">ביקורות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                        {suppliers.map(supplier => (
                            <tr key={supplier.supplier_id} className="hover:bg-red-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{supplier.name}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-red-600">{parseFloat(supplier.average_rating).toFixed(1)}</span>
                                        <Rating value={parseFloat(supplier.average_rating)} readOnly size="small" max={1} />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{supplier.total_reviews}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LowRatedSuppliersWidget;
