import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateDueDate, formatPaymentTerms } from '../../utils/paymentTerms';

const VAT_RATE = 0.18;

function TransactionInputSection({
    amount,
    date,
    description,
    onChange,
    amountLabel = 'סכום העסקה (ללא מע"מ)',
    dateLabel = 'תאריך עסקה',
    descriptionLabel = 'תיאור / הערות',
    showDate = true,
    className = '',
    paymentTerms, // New prop to handle logic internally
    children
}) {

    // Calculate Amount Including VAT
    const amountExclVat = parseFloat(amount) || 0;
    const amountInclVat = amountExclVat * (1 + VAT_RATE);

    // Calculate Due Date Logic (Internal)
    // Removed internal logic to use centralized utility
    const dueDate = calculateDueDate(date, paymentTerms);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange(name, value);
    };

    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Right Column (Amount) */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 text-right">
                        {amountLabel} *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-left dir-ltr"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                {/* Left Column (Date) */}
                <div>
                    {showDate && (
                        <>
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-right">
                                {dateLabel} *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                required
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Right Column (Total) */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 text-right">
                        סכום לתשלום (כולל מע"מ)
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 font-medium text-left dir-ltr">
                        {formatCurrency(amountInclVat)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2 text-right">
                        מחושב אוטומטית: {(1 + VAT_RATE).toFixed(2)} x
                    </p>
                </div>

                {/* Left Column (Prediction/Terms) */}
                <div>
                    {/* Render Calculated Date Box automatically */}
                    <div className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-800 text-sm mb-2 text-right">
                        {dueDate
                            ? `צפי תשלום: ${dueDate.toLocaleDateString('he-IL')} (${formatPaymentTerms(paymentTerms)})`
                            : 'נא לבחור תאריך עסקה'
                        }
                    </div>
                    {children}
                </div>
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 text-right">
                    {descriptionLabel}
                </label>
                <textarea
                    name="description"
                    value={description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white resize-none"
                    placeholder="פרטים נוספים..."
                ></textarea>
            </div>
        </div>
    );
}

export default TransactionInputSection;
