/**
 * Validates a phone number according to Israeli standards.
 * 
 * Rules:
 * - Mobile: Starts with '05', 10 digits total.
 * - Landline: Starts with '0' (but not '05'), 9 digits total.
 * - Hyphens are allowed and ignored.
 * 
 * @param {string} phone - The phone number to validate.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePhoneNumber = (phone) => {
    if (!phone) {
        return { isValid: false, error: 'מספר טלפון הוא שדה חובה' };
    }

    // Remove hyphens and whitespace
    const cleanPhone = phone.replace(/[-\s]/g, '');

    // Check if contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
        return { isValid: false, error: 'מספר טלפון חייב להכיל ספרות בלבד' };
    }

    // Check for mobile (starts with 05, 10 digits)
    if (cleanPhone.startsWith('05')) {
        if (cleanPhone.length !== 10) {
            return { isValid: false, error: 'מספר נייד חייב להכיל 10 ספרות' };
        }
        return { isValid: true, error: null };
    }

    // Check for landline (starts with 0, 9 digits)
    if (cleanPhone.startsWith('0')) {
        if (cleanPhone.length !== 9) {
            return { isValid: false, error: 'מספר טלפון נייח חייב להכיל 9 ספרות' };
        }
        return { isValid: true, error: null };
    }

    return { isValid: false, error: 'מספר טלפון לא תקין (חייב להתחיל ב-0)' };
};

/**
 * Validates an email address.
 * 
 * @param {string} email - The email to validate.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: true, error: null }; // Email might be optional, check required separately if needed
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'כתובת אימייל לא תקינה' };
    }
    return { isValid: true, error: null };
};

/**
 * Validates a required field.
 * 
 * @param {any} value - The value to check.
 * @param {string} fieldName - The name of the field for the error message.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateRequired = (value, fieldName = 'שדה זה') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return { isValid: false, error: `${fieldName} הוא שדה חובה` };
    }
    return { isValid: true, error: null };
};

/**
 * Validates a positive number.
 * 
 * @param {number|string} value - The value to check.
 * @param {string} fieldName - The name of the field.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePositiveNumber = (value, fieldName = 'שדה זה') => {
    if (value === '' || value === null || value === undefined) {
        return { isValid: true, error: null }; // Optional, check required separately
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
        return { isValid: false, error: `${fieldName} חייב להיות מספר חיובי` };
    }
    return { isValid: true, error: null };
};

/**
 * Validates password strength.
 * 
 * @param {string} password - The password to check.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'סיסמה היא שדה חובה' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
    }
    return { isValid: true, error: null };
};
