/**
 * Reusable UI Components Library
 * Professional, accessible, and consistent components
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

// ========== BUTTON COMPONENT ==========

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600',
        success: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-emerald-500/50',
        danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-red-500/50',
        ghost: 'bg-transparent hover:bg-slate-800 text-gray-300 hover:text-white border border-transparent hover:border-slate-700',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};

// ========== CARD COMPONENT ==========

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    hover = true,
    className = '',
    ...props
}) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';

    const variantStyles = {
        default: 'bg-slate-800 border border-slate-700 shadow-xl',
        elevated: 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl',
    };

    const hoverStyles = hover ? 'hover:shadow-2xl hover:border-slate-600' : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// ========== INPUT COMPONENT ==========

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}) => {
    const inputStyles = error
        ? 'bg-slate-900 border-2 border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : 'bg-slate-900 border-2 border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20';

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    className={`
            w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200
            placeholder:text-gray-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${inputStyles}
            ${className}
          `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-400 mt-1">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-sm text-gray-500 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
};

// ========== BADGE COMPONENT ==========

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

    const variantStyles = {
        success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        error: 'bg-red-500/10 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        default: 'bg-slate-700 text-gray-300 border border-slate-600',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

// ========== LOADING SPINNER ==========

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <Loader2 className={`${sizeStyles[size]} animate-spin text-cyan-400 ${className}`} />
    );
};

// ========== SKELETON LOADER ==========

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const variantStyles = {
        text: 'h-4 w-full',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`
        bg-slate-700 animate-pulse
        ${variantStyles[variant]}
        ${className}
      `}
        />
    );
};

export default { Button, Card, Input, Badge, Spinner, Skeleton };
