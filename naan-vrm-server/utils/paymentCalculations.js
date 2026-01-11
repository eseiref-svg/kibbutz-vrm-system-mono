/**
 * Payment Calculation Utilities
 * Payment date calculation logic (Current + X, payment on 5th or 20th)
 */

/**
 * Interprets payment terms string to credit days
 * @param {string} paymentTerms - e.g., 'current_30', 'immediate', 'current_60'
 * @returns {number} days - number of credit days
 */
function getCreditDays(paymentTerms) {
    if (!paymentTerms || paymentTerms === 'immediate') return 0;

    // Format: current_X (e.g., current_30)
    const match = paymentTerms.match(/current_(\d+)/);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }

    // Default fallback
    return 0;
}

/**
 * Calculates the final payment date
 * @param {Date|string} transactionDate - Transaction date
 * @param {string|number} terms - Payment terms (e.g., 'current_30' or days)
 * @returns {Date} Calculated payment date (always 5th or 20th)
 */
function calculateDueDate(transactionDate, terms) {
    const date = new Date(transactionDate);
    let creditDays = 0;

    if (typeof terms === 'string') {
        // Handle new Enum values
        if (terms === 'immediate') creditDays = 0;
        else if (terms === 'plus_15') creditDays = 15;
        else if (terms === 'plus_30') creditDays = 30; // Legacy support
        else if (terms === 'plus_35') creditDays = 35;
        else if (terms === 'plus_50') creditDays = 50;
        else filters = getCreditDays(terms); // Fallback to regex
    } else if (typeof terms === 'number') {
        creditDays = terms;
    }

    // 1. Calculate Base Due Date (Transaction Date + Credit Days)
    const baseDueDate = new Date(date);
    baseDueDate.setDate(baseDueDate.getDate() + creditDays);
    baseDueDate.setHours(0, 0, 0, 0);

    // If terms are immediate, return the base date (no 5th/20th rule usually?)
    // User said: "Current + 35 payment... will be executed on the 5th or 20th"
    // Does 'immediate' also follow 5th/20th? Usually Immediate means Immediate. 
    if (terms === 'immediate' || creditDays === 0) {
        return baseDueDate;
    }

    // 2. Find next valid payment date (5th or 20th)
    // The date must be >= baseDueDate
    const year = baseDueDate.getFullYear();
    const month = baseDueDate.getMonth(); // 0-11

    // Candidates in current month
    const candidate1 = new Date(year, month, 5);
    const candidate2 = new Date(year, month, 20);

    // Candidates in next month
    const candidate3 = new Date(year, month + 1, 5);
    const candidate4 = new Date(year, month + 1, 20);

    // Candidates in month + 2 (just in case)
    const candidate5 = new Date(year, month + 2, 5);

    // Check candidates
    if (candidate1 >= baseDueDate) return candidate1;
    if (candidate2 >= baseDueDate) return candidate2;
    if (candidate3 >= baseDueDate) return candidate3;
    if (candidate4 >= baseDueDate) return candidate4;
    return candidate5;
}

module.exports = {
    getCreditDays,
    calculateDueDate
};
