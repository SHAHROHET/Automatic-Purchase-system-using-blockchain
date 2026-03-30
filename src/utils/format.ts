export const formatAUD = (value: number): string =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-AU');

export const formatPercentage = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;
