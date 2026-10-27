import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label, control and error message wired together for screen readers. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="ml-1 text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="ml-1 text-[12.5px] text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="ml-1 text-[12.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
