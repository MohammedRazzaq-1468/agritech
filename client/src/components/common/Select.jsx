import React from 'react';

export function Select({
  label,
  id,
  options = [],
  error,
  helperText,
  className = '',
  required = false,
  placeholder = 'Select option...',
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.id || opt.value : opt;
          const label = typeof opt === 'object' ? opt.name || opt.label : opt;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

