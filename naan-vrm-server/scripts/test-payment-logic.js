const { calculateDueDate } = require('../utils/paymentCalculations');

const terms = ['current_15', 'current_35', 'current_50', 'immediate'];
const baseDate = new Date('2024-01-01'); // Fixed date

console.log('--- Testing Payment Logic ---');
terms.forEach(t => {
    const due = calculateDueDate(baseDate, t);
    console.log(`Term: ${t} | Base: 2024-01-01 | Due: ${due.toISOString().split('T')[0]}`);
});
