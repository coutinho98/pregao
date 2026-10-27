import { ErrorCode } from '@pregao/shared';
import type { ValidationError } from 'class-validator';
import { DomainError } from './domain-error.js';

function collectFieldErrors(
  errors: ValidationError[],
  parentPath = '',
  fields: Record<string, string[]> = {},
): Record<string, string[]> {
  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) fields[path] = Object.values(error.constraints);
    if (error.children?.length) collectFieldErrors(error.children, path, fields);
  }
  return fields;
}

export function validationErrorFactory(errors: ValidationError[]): DomainError {
  return new DomainError(ErrorCode.VALIDATION_FAILED, 'Dados inválidos.', {
    details: { fields: collectFieldErrors(errors) },
  });
}
