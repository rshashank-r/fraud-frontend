/**
 * Comprehensive TypeScript interfaces for API communication.
 * Ensures type safety across the application.
 */

// ========== GENERIC API TYPES ==========

export interface APIResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
    status_code?: number;
    details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    pages: number;
}

// ========== AUTHENTICATION TYPES ==========

export interface LoginRequest {
    email: string;
    password: string;
    captcha_challenge_id: string;
    captcha_answer: number;
    lat?: number;
    lon?: number;
}

export interface LoginResponse {
    access_token?: string;
    role?: 'USER' | 'ADMIN';
    verification_required?: 'totp' | 'email_otp' | 'otp_device';
    message?: string;
    risk_score?: number;
    risk_factors?: string[];
}

export interface RegisterRequest {
    email: string;
    password: string;
    phone_number?: string;
    captcha_challenge_id: string;
    captcha_answer: number;
}

export interface OTPVerificationRequest {
    email: string;
    otp: string;
}

export interface CaptchaChallenge {
    challenge_id: string;
    question: string;
    correct_answer?: number; // Only for debugging/hints
}

// ========== USER TYPES ==========

export interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    is_2fa_enabled: boolean;
    is_locked: boolean;
    trust_score: number;
    created_at: string;
    phone_number?: string;
}

export interface UserProfile extends User {
    total_transactions: number;
    failed_transactions: number;
    last_login: string;
}

// ========== TRANSACTION TYPES ==========

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    receiver_account: string;
    transaction_type: 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL';
    status: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED';
    risk_score: number;
    timestamp: string;
    location?: string;
    risk_factors?: Record<string, any>;
    fraud_score?: number;
}

export interface TransactionRequest {
    amount: number;
    receiver_account: string;
    transaction_type: 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL';
    nonce: string;
    lat?: number;
    lon?: number;
}

export interface TransactionResponse {
    transaction_id?: string;
    status: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED';
    risk_score: number;
    message: string;
    otp_required?: boolean;
}

// ========== ADMIN TYPES ==========

export interface AdminStats {
    total_users: number;
    total_transactions: number;
    flagged_transactions: number;
    blocked_transactions: number;
    avg_risk_score: number;
    total_fraud_amount: number;
}

export interface RiskDistribution {
    low: number;
    medium: number;
    high: number;
    critical: number;
}

export interface Alert {
    id: string;
    user_id: string;
    transaction_id: string;
    alert_type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: string;
    resolved: boolean;
}

// ========== ANALYTICS TYPES ==========

export interface TimeSeriesData {
    timestamp: string;
    value: number;
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

export interface GeoData {
    country: string;
    city: string;
    count: number;
    risk_score: number;
}

// ========== ERROR TYPES ==========

export interface APIError {
    error: string;
    message: string;
    details?: Record<string, any>;
    status_code: number;
}

export class FraudGuardError extends Error {
    statusCode: number;
    details?: Record<string, any>;

    constructor(message: string, statusCode: number = 500, details?: Record<string, any>) {
        super(message);
        this.name = 'FraudGuardError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

// ========== FORM TYPES ==========

export interface FormField<T = any> {
    value: T;
    error?: string;
    touched: boolean;
    dirty: boolean;
}

export interface FormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// ========== HOOK TYPES ==========

export interface UseAPIResult<T> {
    data: T | null;
    loading: boolean;
    error: APIError | null;
    refetch: () => Promise<void>;
}

export interface UseFormResult<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    handleChange: (field: keyof T) => (value: any) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => void;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    resetForm: () => void;
    isValid: boolean;
    isSubmitting: boolean;
}
