import { cn } from '@/utils';
import * as React from 'react';

import CurrencyInput from 'react-currency-input-field';

interface CurrencyInputProps {
  className?: string;
  disabled?: boolean;
  value: string | number | undefined;
  setValue?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  postfix?: React.ReactNode;
  preFix?: React.ReactNode;
  autoFocus?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  error?: boolean;
  materialTitle?: string;
  variant?: 'standard' | 'material';
  requireField?: boolean;
  step?: string | number;
  name?: string;
  id?: string;
}

const MoneyInput = ({
  className,
  disabled,
  value,
  setValue,
  onChange,
  maxLength,
  postfix,
  preFix,
  autoFocus,
  ref,
  placeholder = 'Enter',
  error,
  materialTitle,
  variant = 'standard',
  requireField = false,
  step,
  name,
  id,
}: CurrencyInputProps) => {
  const isMaterial = variant === 'material';
  const strValue = value === undefined || value === null ? '' : String(value);

  return (
    <div className="relative flex items-center w-full">
      <CurrencyInput
        ref={ref}
        id={id}
        name={name}
        className={cn(
          disabled ? 'bg-gray-100 cursor-not-allowed border-none' : ' ',
          error ? 'border-error' : 'border-border',
          'peer flex h-12 w-full rounded-2xl border px-3 py-1 text-sm md:text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-gray-400 placeholder:text-sm focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          isMaterial && 'placeholder:opacity-0 focus:placeholder:opacity-100',
          preFix && 'pl-[40px]',
          (postfix || maxLength) && 'pr-[70px]',
          className,
        )}
        min={0}
        maxLength={maxLength}
        disabled={disabled}
        decimalsLimit={2}
        value={strValue}
        autoFocus={autoFocus}
        placeholder={placeholder}
        allowDecimals
        allowNegativeValue={false}
        onValueChange={(val) => {
          const newVal = val ?? '';
          if (setValue) {
            setValue(newVal);
          }
          if (onChange) {
            const syntheticEvent = {
              target: { value: newVal, name: name || '' },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        }}
      />

      {isMaterial && (materialTitle || placeholder) && (
        <label
          className={cn(
            'absolute left-3 bg-white px-1 text-gray-500 transition-all pointer-events-none',
            'top-1/2 -translate-y-1/2 text-sm',
            'peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary',
            'peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
            preFix && 'left-[40px] peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3',
          )}
        >
          {materialTitle || placeholder} {requireField && <span className="text-red-500">*</span>}
        </label>
      )}

      {preFix && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{preFix}</div>}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-default-secondary text-xs">
        {maxLength ? (
          <span>
            {strValue.length} / {maxLength}
          </span>
        ) : (
          postfix && postfix
        )}
      </div>
    </div>
  );
};
MoneyInput.displayName = 'MoneyInput';

export { MoneyInput };
