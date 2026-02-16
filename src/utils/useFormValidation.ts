/**
 * Hook personnalisé pour la validation de formulaires React
 */

import React from 'react';
import type { ValidationRule } from './validationRules';

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
