import React from 'react';

/**
 * Unified system select menu
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  fullWidth = true,
  placeholder = 'בחר אפשרות',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || name;
  const selectClasses = `
    w-full px-4 py-2.5 text-base border rounded-lg 
    transition-all duration-200 bg-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {placeholder && !value && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`text-sm mt-1 text-right ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;


