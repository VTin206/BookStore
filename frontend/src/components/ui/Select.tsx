import React, { useEffect, useRef, useState } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isMultiple = Boolean(props.multiple);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedValues = Array.isArray(props.value) ? props.value.map(String) : [];
  const selectedLabels = options.filter((option) => selectedValues.includes(String(option.value))).map((option) => option.label);

  useEffect(() => {
    if (!isMultiple) return;
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMultiple]);

  const toggleOption = (value: string) => {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    const selectedOptions = options
      .filter((option) => nextValues.includes(String(option.value)))
      .map((option) => ({ value: String(option.value), label: option.label }));
    props.onChange?.({ target: { selectedOptions } } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className="form-group" ref={wrapperRef}>
      {label && <label htmlFor={selectId} className="form-label">{label}</label>}
      {isMultiple ? (
        <div className={`multi-select ${isOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            id={selectId}
            className={`form-select multi-select-trigger ${className}`}
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
          >
            {selectedLabels.length ? selectedLabels.join(', ') : (placeholder || 'Chọn mục')}
            <span className="multi-select-chevron">⌄</span>
          </button>
          {isOpen && (
            <div className="multi-select-menu">
              {options.map((option) => {
                const optionValue = String(option.value);
                return (
                  <label className="multi-select-option" key={optionValue}>
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(optionValue)}
                      onChange={() => toggleOption(optionValue)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <select
          id={selectId}
          className={`form-select ${className}`}
          style={{ borderColor: error ? 'var(--error)' : undefined }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};
