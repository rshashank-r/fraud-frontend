/**
 * Custom React Hooks Library
 * Reusable hooks for common patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { APIResponse, UseAPIResult, APIError } from '../types/api.types';

// ========== useAPI Hook ==========
/**
 * Generic hook for API calls with loading and error states
 */
export function useAPI<T>(
    fetcher: () => Promise<APIResponse<T>>,
    deps: any[] = []
): UseAPIResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<APIError | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetcher();
            if (response.error) {
                setError({
                    error: response.error,
                    message: response.message || 'An error occurred',
                    status_code: response.status_code || 500,
                    details: response.details,
                });
            } else {
                setData(response.data || null);
            }
        } catch (err: any) {
            setError({
                error: 'NetworkError',
                message: err.message || 'Network request failed',
                status_code: err.response?.status || 500,
            });
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// ========== useDebounce Hook ==========
/**
 * Debounce a value with configurable delay
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ========== useLocalStorage Hook ==========
/**
 * Persistent state with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

// ========== useForm Hook ==========
/**
 * Form state management with validation
 */
export function useForm<T extends Record<string, any>>(
    initialValues: T,
    validate?: (values: T) => Partial<Record<keyof T, string>>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((field: keyof T) => (value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const handleBlur = useCallback((field: keyof T) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Validate on blur if validator provided
        if (validate) {
            const validationErrors = validate(values);
            if (validationErrors[field]) {
                setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
            }
        }
    }, [values, validate]);

    const handleSubmit = useCallback(
        (onSubmit: (values: T) => void | Promise<void>) =>
            async (e: React.FormEvent) => {
                e.preventDefault();

                // Mark all fields as touched
                const allTouched = Object.keys(values).reduce((acc, key) => ({
                    ...acc,
                    [key]: true,
                }), {} as Partial<Record<keyof T, boolean>>);
                setTouched(allTouched);

                // Validate
                if (validate) {
                    const validationErrors = validate(values);
                    setErrors(validationErrors);

                    if (Object.keys(validationErrors).length > 0) {
                        return;
                    }
                }

                // Submit
                setIsSubmitting(true);
                try {
                    await onSubmit(values);
                } finally {
                    setIsSubmitting(false);
                }
            },
        [values, validate]
    );

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const isValid = Object.keys(errors).length === 0;

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        resetForm,
        isValid,
        isSubmitting,
    };
}

// ========== useOnClickOutside Hook ==========
/**
 * Detect clicks outside of an element
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// ========== useMediaQuery Hook ==========
/**
 * Responsive design hook
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

// ========== usePrevious Hook ==========
/**
 * Get previous value of a state or prop
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
