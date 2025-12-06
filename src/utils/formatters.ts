// src/utils/formatters.ts

/**
 * Format number as Indian currency with proper lakhs/crores notation
 * Example: 1000000 => ₹10,00,000.00
 */
export const formatIndianCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format amount without currency symbol
 */
export const formatAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '0.00';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
