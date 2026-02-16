/**
 * Module de validation LOCAGAME
 *
 * Re-exports depuis les sous-modules pour compatibilité ascendante.
 * - validationRules.ts : types, validateFields et règles prédéfinies
 * - useFormValidation.ts : hook React de validation de formulaire
 */

// === Re-exports : types, validation et règles ===
export {
  validateFields,
  required,
  email,
  minLength,
  maxLength,
  phone,
  postalCode,
  number,
  min,
  max,
  pattern,
  match,
  url,
  date,
  futureDate,
  pastDate,
  type ValidationRule,
  type FieldValidation,
  type ValidationErrors,
} from './validationRules';

// === Re-exports : hook React ===
export { useFormValidation } from './useFormValidation';
