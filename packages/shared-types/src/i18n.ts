export type AppLocale = 'gu' | 'en';

export interface GujaratiNumberFormatOptions {
  useGujaratiDigits?: boolean;
}

export const GUJARATI_DIGITS: { [key: string]: string } = {
  '0': '૦',
  '1': '૧',
  '2': '૨',
  '3': '૩',
  '4': '૪',
  '5': '૫',
  '6': '૬',
  '7': '૭',
  '8': '૮',
  '9': '૯',
};

export function toGujaratiDigits(input: string | number): string {
  const str = input.toString();
  return str.replace(/[0-9]/g, (w) => GUJARATI_DIGITS[w] || w);
}

export function formatINR(amount: number, locale: AppLocale = 'en'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (locale === 'gu') {
    return formatted.replace('₹', '₹ ');
  }
  return formatted;
}

export function formatDate(dateStr: string | Date, locale: AppLocale = 'en'): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const formatted = `${day}/${month}/${year}`;
  if (locale === 'gu') {
    return toGujaratiDigits(formatted);
  }
  return formatted;
}
