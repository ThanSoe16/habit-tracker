import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  postFix?: React.ReactNode;
  preFix?: React.ReactNode;
  inputClassName?: string;
  isError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, postFix, preFix, type, inputClassName, maxLength, isError, ...props }, ref) => {
    const [isPasswordVisible, setPasswordVisible] = React.useState(false);

    const [inputLength, setInputLength] = React.useState<number>(
      typeof props?.value === 'string' ? props?.value?.length : 0,
    );

    const togglePasswordVisibility = () => {
      if (!props.disabled) {
        setPasswordVisible(!isPasswordVisible);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = e.target.value.replace(/[<>:{}]/g, '');

      const limited = typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized;

      if (props.onChange) {
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: limited,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        setInputLength(limited.length);
        props.onChange(newEvent);
      }
    };

    return (
      <div className={cn('relative flex h-12 items-center bg-transparent ', className)}>
        <input
          type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:ring-ring text-base flex h-full w-full rounded-lg border bg-gray-50 px-3 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-[1px]',
            postFix ? 'pr-10' : '',
            preFix ? 'pl-10' : '',
            maxLength && 'pr-[70px]',
            inputClassName,
            isError ? 'border-red-600' : 'focus-visible:ring-primary focus-visible:ring-1',
          )}
          ref={ref}
          {...props}
          onChange={handleChange}
        />
        {preFix && (
          <div
            className="absolute left-2 top-1/2 -translate-y-1/2 text-primary pt-[1px]"
            style={{
              transform: 'translateY(-50%)',
            }}
          >
            {preFix}
          </div>
        )}
        {type === 'password' && (
          <button
            type="button"
            className={cn('absolute right-3 top-1/2 transform -translate-y-1/2', {
              'cursor-not-allowed opacity-50': props.disabled,
            })}
            onClick={togglePasswordVisibility}
            disabled={props.disabled}
          >
            {isPasswordVisible ? <Eye className="w-5 h-5 " /> : <EyeOff className="w-5 h-5 " />}
          </button>
        )}
        {postFix && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary pt-[1px]"
            style={{
              transform: 'translateY(-50%)',
            }}
          >
            {postFix}
          </div>
        )}
        {maxLength && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-xs md:text-sm pt-[1px]"
            style={{
              transform: 'translateY(-50%)',
            }}
          >
            {inputLength} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
