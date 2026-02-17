import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';
import TransactionDetailsModal from '../payments/TransactionDetailsModal';

const SupplierPaymentHistory = ({ supplier }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        if (!supplier) return;
        setLoading(true);
        try {
            const response = await api.get(`/suppliers/${supplier.supplier_id}/transactions`);
            // Enrich data for display/modal
            const enriched = response.data.map(t => {
                const dueDate = new Date(t.due_date);
                const today = new Date();
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    ...t,
                    entity_name: supplier.name, // Context is this supplier
                    transaction_type: 'payment', // It's always payment here
                    days_overdue: t.status !== 'paid' && diffDays < 0 ? Math.abs(diffDays) : 0,
                    days_until_due: diffDays > 0 ? diffDays : 0,
                    branch_name: t.branch_name || 'לא זמין'
                };
            });
            setPayments(enriched);
        } catch (error) {
            console.error("Error fetching supplier payments:", error);
        } finally {
            setLoading(false);
        }
    }, [supplier]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleRowClick = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const getStatusBadge = (payment) => {
        if (payment.status === 'paid') {
            return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">שולם</span>;
        }
        if (payment.days_overdue > 0) {
            return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">באיחור ({payment.days_overdue})</span>;
        }
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">פתוח</span>;
    };

    if (loading) {
        return <div className="text-center p-4 text-gray-500">טוען היסטוריית תשלומים...</div>;
    }

    if (payments.length === 0) {
        return <div className="text-center p-4 text-gray-500">לא נמצאו תשלומים לספק זה.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                        <tr
                            key={payment.transaction_id}
                            onClick={() => handleRowClick(payment)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {new Date(payment.due_date).toLocaleDateString('he-IL')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                {formatCurrency(Math.abs(payment.value))}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(payment)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {payment.description || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <TransactionDetailsModal
                transaction={selectedTransaction}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default SupplierPaymentHistory;
