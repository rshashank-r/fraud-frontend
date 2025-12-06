export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  role?: string;
  balance?: number;
  trust_score?: number;
  is_locked?: boolean;
  account_number?: string;
  phone_number?: string;
}

export interface AuthResponse {
  access_token: string;
  role: string;
  is_breached?: boolean;
  message?: string;
}

export interface Transaction {
  transaction_id?: string;
  id?: string;
  amount: number;
  receiver_account?: string;
  user?: string; // email
  status: 'SUCCESS' | 'FAILED' | 'PENDING_OTP' | 'BLOCKED' | 'REFUNDED';
  action?: 'ALLOW' | 'BLOCK' | 'VERIFY' | 'REFUND';
  risk_score?: number;
  message?: string;
  timestamp?: string;
}

export interface PayPayload {
  receiver_account: string;
  amount: number;
  transaction_type: string;
  lat: number;
  lon: number;
}

export interface AdminStats {
  total_users: number;
  fraud_rate: number;
  blocked_transactions: number;
}

export interface Notification {
  title: string;
  type: 'DANGER' | 'INFO' | 'WARNING';
  message: string;
}

export interface Device {
  id: number;
  name: string;
  last_used: string;
}

export interface LoginHistory {
  time: string;
  ip: string;
  status: string;
}

export interface CardData {
    id: string;
    card_number: string; // Masked usually
    expiry: string;
    is_locked: boolean;
    type: string;
}

export interface Beneficiary {
    id?: number;
    name: string;
    account_number: string;
}

export interface Dispute {
    id?: number;
    transaction_id: string;
    reason: string;
    status: string;
    amount?: number;
    created_at?: string;
}

export interface FraudRule {
    id?: number;
    field: string;
    operator: string;
    value: string;
    action: string;
}

export interface MerchantRisk {
    account: string;
    fraud_received: number;
    suggestion: string;
}

export interface UnlockRequest {
    request_id: number;
    user_email: string;
    reason: string;
    status?: string;
    created_at?: string;
}