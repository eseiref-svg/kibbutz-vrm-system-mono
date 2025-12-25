import React from 'react';

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
    const calculateDueDate = (dateStr, terms) => {
        if (!dateStr && showDate) return null; // If showing date picker and it's empty
        // If date is hidden (ClientRequest), we might rely on "today" or just not show? 
        // Actually ClientRequest implies "Assuming approved today context" or similar.
        // But for safe logic:
        const baseDate = dateStr ? new Date(dateStr) : new Date();

        if (!terms || terms === 'immediate') return baseDate;

        // "Shotef" logic (End of Month)
        const eom = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

        let daysToAdd = 0;
        if (terms === 'plus_30') daysToAdd = 30;
        if (terms === 'plus_45') daysToAdd = 45;
        if (terms === 'plus_60') daysToAdd = 60;
        if (terms === 'plus_90') daysToAdd = 90;

        eom.setDate(eom.getDate() + daysToAdd);
        return eom;
    };

    const dueDate = calculateDueDate(date, paymentTerms);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange(name, value);
    };

    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Right Column (Visual First in RTL) */}
                <div className="order-2 md:order-1">
                    {showDate && (
                        <>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
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

                {/* Left Column */}
                <div className="order-1 md:order-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Calculated Total */}
                <div className="order-2 md:order-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        סכום לתשלום (כולל מע"מ)
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 font-medium text-left dir-ltr">
                        {amountInclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                        מחושב אוטומטית: {(1 + VAT_RATE).toFixed(2)} x
                    </p>
                </div>

                {/* Expected Payment / Custom Slot */}
                <div className="order-1 md:order-2">
                    {/* Render Calculated Date Box automatically */}
                    <div className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-800 text-sm mb-2">
                        {dueDate
                            ? `צפי תשלום: ${dueDate.toLocaleDateString('he-IL')} (${paymentTerms === 'immediate' ? 'מיידי' : paymentTerms ? `שוטף + ${paymentTerms.replace('plus_', '')}` : 'ללא תנאי תשלום'})`
                            : 'נא לבחור תאריך עסקה'
                        }
                    </div>
                    {/* Render extra children (like Payment Terms dropdown) below or above? 
                        The user put dropdown INSTEAD of info in ClientRequest. 
                        But logically, if I select terms, I want to see the result.
                        So I render both.
                    */}
                    {children}
                </div>
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
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
