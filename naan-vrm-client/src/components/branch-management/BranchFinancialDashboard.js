import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FiTrendingUp, FiPieChart, FiActivity, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const formatFinancial = (amount) => {
    const val = parseFloat(amount || 0);
    const absVal = Math.abs(val).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // If negative, wrap in ( ) with ₪ on the left
    if (val < 0) {
        return `₪(${absVal})`;
    }
    return `₪${absVal}`;
};

const getTransactionTypeLabel = (type) => {
    return type === 'expense' ? 'תשלום לספק' : 'גביה מלקוח';
};

const getSeverityBadge = (daysOverdue, daysUntilDue, status) => {
    if (status === 'paid') {
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">שולם</span>;
    }

    if (daysOverdue > 0) {
        // Overdue (Red)
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">איחור {daysOverdue} ימים</span>;
    } else if (daysUntilDue === 0) {
        // Today (Blue)
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">היום</span>;
    } else if (daysUntilDue <= 7) {
        // Upcoming (Orange)
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">בעוד {daysUntilDue} ימים</span>;
    } else {
        // Future (Green)
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">עתידי</span>;
    }
};

function BranchFinancialDashboard({ branchId, isBusiness, readOnly = false }) {
    const [financials, setFinancials] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State - Card 1 (Budget/Opening)
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes, transactionsRes] = await Promise.all([
                    api.get(`/branches/${branchId}/balance`),
                    api.get(`/branches/${branchId}/transactions?limit=10`) // Increased limit for better table view
                ]);
                setFinancials(balanceRes.data);
                setTransactions(transactionsRes.data.slice(0, 10));
            } catch (error) {
                console.error("Error fetching branch financials:", error);
            } finally {
                setLoading(false);
            }
        };

        if (branchId) {
            fetchData();
        }
    }, [branchId]);

    const handleEditClick = () => {
        if (readOnly) return;
        const currentBudget = financials?.budget || 0;
        setEditValue(currentBudget.toString());
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            const numValue = parseFloat(editValue);

            // Allow 0, check against NaN specifically or explicit null
            if (isNaN(numValue)) {
                alert('נא להזין מספר תקין');
                setSubmitting(false);
                return;
            }

            // Update Backend
            await api.put(`/branches/${branchId}/budget`, { budget: numValue });

            // Update Local State
            setFinancials(prev => ({
                ...prev,
                budget: numValue,
                // If community, credit was referencing budget. Updates needed.
                credit: isBusiness ? prev.credit : numValue
            }));

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating budget:', error);
            alert('שגיאה בעדכון התקציב');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">טוען נתונים פיננסיים...</div>;
    if (!financials) return <div className="p-6 text-center text-gray-500">לא נמצאו נתונים</div>;

    // --- LOGIC CALCULATIONS ---
    const openingBalance = parseFloat(financials.budget || 0);

    let realIncome = 0;
    if (isBusiness) {
        realIncome = parseFloat(financials.credit || 0);
    }
    const realExpenses = parseFloat(financials.debit || 0);

    const netPerformance = realIncome - realExpenses;

    const finalBalance = openingBalance + netPerformance;

    // --- BURN RATE (Utilization) ---
    const utilization = openingBalance > 0 ? (realExpenses / openingBalance) * 100 : 0;
    const utilizationColor = utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                {isBusiness ? <FiTrendingUp className="text-blue-600" /> : <FiPieChart className="text-blue-600" />}
                ביצועים עסקיים
            </h3>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Card 1: Budget / Opening Balance */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col justify-between group relative h-32">
                    <span className="text-sm text-blue-600 font-medium block mb-1">
                        תקציב שנתי / יתרת פתיחה
                    </span>

                    {isEditing ? (
                        <div className="mt-1 flex items-center gap-2">
                            <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-1 border rounded text-lg font-bold bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ltr"
                                autoFocus
                            />
                            <button onClick={handleSave} disabled={submitting} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 h-8 w-8 flex items-center justify-center">
                                <FiCheck size={16} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 h-8 w-8 flex items-center justify-center">
                                <FiX size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-blue-700" dir="ltr">{formatFinancial(openingBalance)}</span>

                            {!readOnly && (
                                <button
                                    onClick={handleEditClick}
                                    className="text-blue-400 hover:text-blue-700 p-1"
                                    title="ערוך תקציב"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Card 2: Net Performance */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-32 flex flex-col justify-between">
                    <span className="text-sm text-gray-600 font-medium block mb-1">
                        ביצוע בפועל (נטו)
                    </span>
                    <span className={`text-2xl font-bold ${netPerformance >= 0 ? 'text-green-700' : 'text-red-700'}`} dir="ltr">
                        {formatFinancial(netPerformance)}
                    </span>
                </div>

                {/* Card 3: Profit / Total Remaining */}
                <div className={`rounded-lg p-4 border flex flex-col justify-between h-32 ${finalBalance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <span className={`text-sm font-medium block mb-1 ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        רווח / הפסד (יתרה)
                    </span>
                    <span className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-green-700' : 'text-red-700'}`} dir="ltr">
                        {formatFinancial(finalBalance)}
                    </span>
                </div>
            </div>

            {/* Progress Bar - Burn Rate */}
            {/* Progress Bar - Profitability (Business) OR Burn Rate (Community) */}
            {isBusiness ? (
                /* --- Profitability Meter (Bidirectional) --- */
                <div className="mb-0">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>רווח</span>
                        <span className="font-bold text-gray-800">מדד רווחיות</span>
                        <span>הפסד</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden flex items-center">
                        {/* Center Marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10"></div>

                        {/* The Bar */}
                        {(() => {
                            // Scale: Use budget or current balance (whichever is larger) + 20% buffer as the "100%" edge
                            // This ensures the bar never hits the edge and scales dynamically
                            const maxScale = Math.max(Math.abs(openingBalance), Math.abs(finalBalance), 1000) * 1.2;
                            const percentage = (finalBalance / maxScale) * 50; // Max 50% width (from center to edge)

                            const isProfit = finalBalance >= 0;
                            const width = Math.min(Math.abs(percentage), 50); // Cap at 50%
                            const leftPos = isProfit ? 50 : 50 - width;

                            return (
                                <div
                                    className={`absolute h-full transition-all duration-500 ${isProfit ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{
                                        left: `${leftPos}%`,
                                        width: `${width}%`
                                    }}
                                ></div>
                            );
                        })()}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{finalBalance < 0 ? formatFinancial(finalBalance) : ''}</span>
                        <span>{finalBalance >= 0 ? formatFinancial(finalBalance) : ''}</span>
                    </div>
                </div>
            ) : (
                /* --- Burn Rate (Original Logic for Community) --- */
                openingBalance > 0 && (
                    <div className="mb-0">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>ניצול תקציב (Burn Rate)</span>
                            <span>{utilization.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${utilizationColor}`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default BranchFinancialDashboard;
