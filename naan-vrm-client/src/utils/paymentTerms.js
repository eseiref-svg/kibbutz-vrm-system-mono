/**
 * Payment Terms Utilities
 * Helper functions for calculating and displaying payment terms
 */

export const PAYMENT_TERMS_OPTIONS = [
    { value: 'immediate', label: 'מיידי' },
    { value: 'current_15', label: 'שוטף + 15' },
    { value: 'current_30', label: 'שוטף + 30' },
    { value: 'current_35', label: 'שוטף + 35' },
    { value: 'current_45', label: 'שוטף + 45' },
    { value: 'current_50', label: 'שוטף + 50' },
    { value: 'current_60', label: 'שוטף + 60' },
    { value: 'current_90', label: 'שוטף + 90' },
];

export function formatPaymentTerms(terms) {
    const option = PAYMENT_TERMS_OPTIONS.find(opt => opt.value === terms);
    return option ? option.label : 'לא צוין';
}

export function getCreditDays(paymentTerms) {
    if (!paymentTerms || paymentTerms === 'immediate') return 0;

    const match = paymentTerms.match(/current_(\d+)/);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return 0;
}

export function calculateDueDate(transactionDate, terms) {
    if (!transactionDate) return null;

    const date = new Date(transactionDate);
    let creditDays = 0;

    if (typeof terms === 'string') {
        creditDays = getCreditDays(terms);
    } else if (typeof terms === 'number') {
        creditDays = terms;
    }

    // 1. Calculate Base Due Date
    const baseDueDate = new Date(date);
    baseDueDate.setDate(baseDueDate.getDate() + creditDays);
    baseDueDate.setHours(0, 0, 0, 0);

    // 2. Find next valid payment date (5th or 20th)
    const year = baseDueDate.getFullYear();
    const month = baseDueDate.getMonth();

    const candidate1 = new Date(year, month, 5);
    const candidate2 = new Date(year, month, 20);
    const candidate3 = new Date(year, month + 1, 5);
    const candidate4 = new Date(year, month + 1, 20);

    if (candidate1 >= baseDueDate) return candidate1;
    if (candidate2 >= baseDueDate) return candidate2;
    if (candidate3 >= baseDueDate) return candidate3;
    return candidate4;
}
