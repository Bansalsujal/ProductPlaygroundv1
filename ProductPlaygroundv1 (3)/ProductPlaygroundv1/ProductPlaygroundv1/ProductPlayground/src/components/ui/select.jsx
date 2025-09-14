import React, { useState } from 'react';

const Select = ({ children, onValueChange, defaultValue, value }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  return (
    <div className="select-root" data-value={currentValue}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { onValueChange: handleValueChange, value: currentValue })
      )}
    </div>
  );
};

const SelectTrigger = ({ children, className = '', ...props }) => (
  <button
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SelectContent = ({ children, className = '', ...props }) => (
  <div className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`} {...props}>
    {children}
  </div>
);

const SelectItem = ({ children, value, className = '', ...props }) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground ${className}`}
    data-value={value}
    {...props}
  >
    {children}
  </div>
);

const SelectValue = ({ placeholder, value }) => (
  <span>{value || placeholder}</span>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };