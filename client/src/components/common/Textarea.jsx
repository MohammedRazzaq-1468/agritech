import React from 'react';

export function Textarea({
  label,
  id,
  rows = 3,
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

