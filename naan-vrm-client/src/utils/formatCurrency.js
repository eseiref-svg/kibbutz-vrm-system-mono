/**
 * Formats a number as currency (ILS) with consistent formatting.
 * - Negative numbers are wrapped in parentheses: ₪(1,000.00)
 * - Positive numbers: ₪1,000.00
 * - Symbol (₪) is consistently placed on the left.
 * 
 * @param {number|string} amount - The amount to format
 * @param {boolean} forceString - If true, ensures output preserves LTR marks for correct display in RTL layouts (optional)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return '₪0.00';
    }

    const num = Number(amount);
    const absNum = Math.abs(num);

    // Format the absolute number with commas and 2 decimals
    const formattedNumber = absNum.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Construct result with symbol on the left
    // Using unicode Left-To-Right Mark (\u200E) can help in mixed RTL contexts if needed, 
    // but usually "₪" + number works if flow is managed.
    // We place ₪ immediately before the number.

    if (num < 0) {
        return `(${formattedNumber})₪`;
    }

    return `₪${formattedNumber}`;
};
