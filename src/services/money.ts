const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

export const toEnglishDigits = (value: string) => value
  .replace(/[۰-۹]/g, digit => String(persianDigits.indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)));

export const parseMoney = (value: string): number => {
  const digits = toEnglishDigits(value).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
};

export const formatMoney = (value: number): string => Number(value || 0).toLocaleString('fa-IR');
