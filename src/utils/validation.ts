/**
 * Utilitaires de validation pour les formulaires
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Valide un ensemble de champs
 */
export function validateFields(
  fields: Record<string, FieldValidation>
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.entries(fields).forEach(([fieldName, { value, rules }]) => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors[fieldName] = rule.message;
        break; // Arrêter à la première erreur
      }
    }
  });

  return errors;
}

/**
 * Règles de validation prédéfinies
 */

export const required = (message = 'Ce champ est requis'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },
  message,
});

export const email = (
  message = 'Adresse email invalide'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true; // Skip if empty (use required separately)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  message,
});

export const minLength = (
  min: number,
  message?: string
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return value.toString().length >= min;
  },
  message: message || `Minimum ${min} caractères requis`,
});

export const maxLength = (
  max: number,
  message?: string
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return value.toString().length <= max;
  },
  message: message || `Maximum ${max} caractères autorisés`,
});

export const phone = (
  message = 'Numéro de téléphone invalide'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    // Format français : 01 23 45 67 89 ou 0123456789 ou +33123456789
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },
  message,
});

export const postalCode = (
  message = 'Code postal invalide'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    // Format français : 5 chiffres
    const postalCodeRegex = /^[0-9]{5}$/;
    return postalCodeRegex.test(value);
  },
  message,
});

export const number = (
  message = 'Doit être un nombre valide'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return !isNaN(Number(value));
  },
  message,
});

export const min = (
  minValue: number,
  message?: string
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return Number(value) >= minValue;
  },
  message: message || `La valeur doit être au moins ${minValue}`,
});

export const max = (
  maxValue: number,
  message?: string
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return Number(value) <= maxValue;
  },
  message: message || `La valeur ne doit pas dépasser ${maxValue}`,
});

export const pattern = (
  regex: RegExp,
  message = 'Format invalide'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return regex.test(value);
  },
  message,
});

export const match = (
  otherValue: any,
  message = 'Les valeurs ne correspondent pas'
): ValidationRule => ({
  validate: (value) => value === otherValue,
  message,
});

export const url = (message = 'URL invalide'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message,
});

export const date = (message = 'Date invalide'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },
  message,
});

export const futureDate = (
  message = 'La date doit être dans le futur'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date > new Date();
  },
  message,
});

export const pastDate = (
  message = 'La date doit être dans le passé'
): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date < new Date();
  },
  message,
});

/**
 * Hook personnalisé pour la validation de formulaires (à utiliser avec React)
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule[]>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = (name: keyof T, value: any) => {
    const rules = validationSchema[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return '';
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let isValid = true;

    Object.keys(validationSchema).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationSchema).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      )
    );

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
}

// Import React pour le hook
import React from 'react';
