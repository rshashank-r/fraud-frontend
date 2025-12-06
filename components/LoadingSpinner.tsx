import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-cyan-400`} />
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
};

// Payment Processing Animation
export const PaymentProcessing: React.FC<{ stage: string }> = ({ stage }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Circle */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Stage Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">{stage}</h3>
            <p className="text-gray-400 text-sm">Please wait, do not close this window</p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader for Cards
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        <div className="h-8 bg-slate-700 rounded w-2/3"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};

// Table Row Skeleton
export const SkeletonRow: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-16"></div></td>
    </tr>
  );
};
