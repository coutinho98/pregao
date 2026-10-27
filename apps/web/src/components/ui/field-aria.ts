/** aria-* props that link a form control to its FormField hint or error. */
export function fieldAria(id: string, error?: string) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : `${id}-hint`,
  };
}
