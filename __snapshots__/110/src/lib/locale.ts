export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};

// Alias común usado en varios componentes
export const formatCurrency = formatCLP;

export const formatNumber = (n: number): string => {
  return new Intl.NumberFormat('es-CL').format(n);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// IVA Chile = 19%
export const IVA_RATE = 0.19;

/**
 * Calcula el IVA sobre un monto neto.
 */
export const calcTax = (netAmount: number, rate: number = IVA_RATE): number => {
  return Math.round(netAmount * rate);
};

/**
 * Calcula el monto neto a partir de un total con IVA incluido.
 */
export const calcNetFromGross = (grossAmount: number, rate: number = IVA_RATE): number => {
  return Math.round(grossAmount / (1 + rate));
};

/**
 * Calcula el IVA a partir de un total con IVA incluido.
 */
export const calcTaxFromGross = (grossAmount: number, rate: number = IVA_RATE): number => {
  const net = calcNetFromGross(grossAmount, rate);
  return grossAmount - net;
};

/**
 * Calcula el total (neto + IVA).
 */
export const calcGross = (netAmount: number, rate: number = IVA_RATE): number => {
  return netAmount + calcTax(netAmount, rate);
};

// ============================================================
// Constantes demo del restaurante
// ============================================================
export const DEMO_RESTAURANT_NAME = 'Restaurante La Terraza';
export const DEMO_RESTAURANT_TAGLINE = 'Cocina chilena de autor';
export const DEMO_RESTAURANT_ADDRESS = 'Av. Providencia 1234, Santiago, Chile';
export const DEMO_RESTAURANT_PHONE = '+56 2 2345 6789';
export const DEMO_RESTAURANT_EMAIL = 'contacto@laterraza.cl';
export const DEMO_RESTAURANT_RUT = '76.123.456-7';
export const DEMO_CURRENCY_CODE = 'CLP';
export const DEMO_LOCALE = 'es-CL';
export const DEMO_TIMEZONE = 'America/Santiago';

export default {
  formatCLP,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatTime,
  formatPercent,
  calcTax,
  calcNetFromGross,
  calcTaxFromGross,
  calcGross,
  IVA_RATE,
  DEMO_RESTAURANT_NAME,
  DEMO_RESTAURANT_TAGLINE,
  DEMO_RESTAURANT_ADDRESS,
  DEMO_RESTAURANT_PHONE,
  DEMO_RESTAURANT_EMAIL,
  DEMO_RESTAURANT_RUT,
  DEMO_CURRENCY_CODE,
  DEMO_LOCALE,
  DEMO_TIMEZONE,
};
