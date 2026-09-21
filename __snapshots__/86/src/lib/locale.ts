/** Demo locale — Chile */
export const DEMO_LOCALE = 'es-CL'
export const DEMO_CURRENCY = 'CLP'
export const DEMO_TIMEZONE = 'America/Santiago'
export const DEMO_COUNTRY_CODE = '+56'
export const DEMO_RESTAURANT_NAME = 'Trattoria Bellavista'
export const DEMO_TAX_RATE = 0.19

export function calcTax(subtotal: number): number {
  return Math.round(subtotal * DEMO_TAX_RATE)
}

export function calcOrderTotal(subtotal: number, tip = 0): number {
  return subtotal + calcTax(subtotal) + tip
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(DEMO_LOCALE)}`
}

export function formatTime(date: Date, withSeconds = false): string {
  return date.toLocaleTimeString(DEMO_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  })
}

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' },
): string {
  return date.toLocaleDateString(DEMO_LOCALE, options)
}
