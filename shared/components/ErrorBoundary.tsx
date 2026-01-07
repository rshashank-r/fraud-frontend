/**
 * Error Boundary Component
 * Catches React errors and provides a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-gray-400 mb-6">
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <div className="bg-slate-900 rounded p-4 text-xs text-red-400 font-mono overflow-auto max-h-40">
                                    <p className="mb-2">{this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <pre className="text-gray-500">{this.state.errorInfo.componentStack}</pre>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Go Home
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-gray-500">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
