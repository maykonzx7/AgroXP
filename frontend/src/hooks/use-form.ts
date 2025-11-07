import { useState, useCallback, useEffect } from 'react';

// Interface para as configurações do formulário
export interface FormConfig<T> {
  initialValues: T;
  validationSchema?: {
    [K in keyof T]?: (value: T[K]) => string | undefined;
  };
  onSubmit?: (values: T) => Promise<void> | void;
  onSuccess?: (values: T) => void;
  onError?: (error: any) => void;
}

// Hook para gerenciamento de formulários
export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema = {},
  onSubmit,
  onSuccess,
  onError,
}: FormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validar campo individual
  const validateField = useCallback((name: keyof T, value: T[keyof T]): string | undefined => {
    const validator = validationSchema[name];
    if (validator) {
      return validator(value);
    }
    return undefined;
  }, [validationSchema]);

  // Validar todo o formulário
  const validateForm = useCallback((): Partial<Record<keyof T, string>> => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    for (const key in validationSchema) {
      if (validationSchema.hasOwnProperty(key)) {
        const error = validateField(key, values[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  }, [values, validateField]);

  // Validar quando os valores mudarem
  useEffect(() => {
    const formErrors = validateForm();
    setIsValid(Object.keys(formErrors).length === 0);
  }, [values, validateForm]);

  // Manipular mudança de campo
  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar campo se já foi tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Manipular toque em campo (blur)
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo quando perder o foco
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Manipular submissão
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Tocar todos os campos para mostrar erros
    setTouched(Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>));
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setIsValid(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(values);
        onSuccess?.(values);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, onSuccess, onError]);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(true);
  }, [initialValues]);

  // Atualizar valor de campo
  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Definir erro de campo
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
  };
};

export default useForm;