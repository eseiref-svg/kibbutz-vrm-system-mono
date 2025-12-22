import React from 'react';

/**
 * Unified system multi-line text input
 */
const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  fullWidth = true,
  className = '',
  rows = 4,
  ...props
}) => {
  const textareaClasses = `
    w-full px-4 py-2.5 text-base border rounded-lg 
    transition-all duration-200 resize-y
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {(error || helperText) && (
        <p className={`text-sm mt-1 text-right ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;

