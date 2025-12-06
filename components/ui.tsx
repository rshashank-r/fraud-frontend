import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'outline' | 'ghost', isLoading?: boolean, size?: 'sm' | 'md' }> = ({ 
  children, variant = 'primary', className = '', isLoading, disabled, size = 'md', ...props 
}) => {
  const baseStyle = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  
  const variants = {
    primary: "bg-cyber-cyan text-cyber-900 hover:bg-cyber-neon shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    danger: "bg-cyber-danger text-white hover:bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    outline: "border border-cyber-700 text-cyber-cyan hover:bg-cyber-800",
    ghost: "text-gray-400 hover:text-white hover:bg-cyber-800"
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode; containerClassName?: string }> = ({ label, icon, className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, { size: 18 } as any)}
        </div>
      )}
      <input 
        className={`w-full bg-cyber-800 border border-cyber-700 text-white rounded-lg py-2 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-colors ${icon ? 'pl-10 pr-4' : 'px-4'} ${className}`}
        {...props}
      />
    </div>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-cyber-800/50 border border-cyber-700 backdrop-blur-sm rounded-xl p-4 md:p-6 ${className}`}>
    {title && <h3 className="text-lg font-bold text-white mb-4 border-b border-cyber-700 pb-2">{title}</h3>}
    {children}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; type?: 'default' | 'danger' }> = ({ 
  isOpen, onClose, title, children, type = 'default' 
}) => {
  if (!isOpen) return null;

  const borderColor = type === 'danger' ? 'border-cyber-danger' : 'border-cyber-cyan';
  const glowColor = type === 'danger' ? 'shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_50px_rgba(6,182,212,0.2)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-cyber-900 border ${borderColor} ${glowColor} rounded-xl w-[95vw] max-w-md p-6 relative animate-in fade-in zoom-in duration-200 my-auto`}>
        <h2 className={`text-xl font-bold mb-4 ${type === 'danger' ? 'text-cyber-danger' : 'text-cyber-cyan'}`}>{title}</h2>
        <div className="text-gray-300">
          {children}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">✕</button>
      </div>
    </div>
  );
};