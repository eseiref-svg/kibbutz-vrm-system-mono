import React from 'react';

/**
 * Unified system Icon Button for tables and lists
 * @param {ReactNode} icon - The icon component (e.g., <LuPencil />)
 * @param {function} onClick - Click handler
 * @param {string} variant - primary (blue), danger (red), success (green), secondary (gray)
 * @param {string} title - Tooltip text
 * @param {string} className - Additional classes
 */
const IconButton = ({
    icon,
    onClick,
    variant = 'secondary',
    title = '',
    className = '',
    ...props
}) => {
    // Variant styles mapping
    const variantStyles = {
        primary: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
        danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
        success: 'text-green-500 hover:text-green-700 hover:bg-green-50',
        secondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    };

    const selectedVariant = variantStyles[variant] || variantStyles.secondary;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${selectedVariant} ${className}`}
            title={title}
            aria-label={title}
            {...props}
        >
            {icon}
        </button>
    );
};

export default IconButton;
