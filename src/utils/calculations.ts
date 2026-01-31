export const calculatePricePerGram = (price: number, weight: number): number => {
  if (weight <= 0) return 0;
  return price / weight;
};

export const calculateSavingsPercent = (pricePerGramX: number, pricePerGramY: number): number => {
  const higher = Math.max(pricePerGramX, pricePerGramY);
  const lower = Math.min(pricePerGramX, pricePerGramY);
  if (higher === 0) return 0;
  return ((higher - lower) / higher) * 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getMonthYear = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });
};
