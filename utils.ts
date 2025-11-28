
export const parsePrice = (price: string | undefined): number => {
  if (!price) return -Infinity;
  // Remove non-numeric characters except dot and minus, handle $
  const clean = price.replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
};

export const parsePercentage = (percent: string | undefined): number => {
  if (!percent) return -Infinity;
  const clean = percent.replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
};

export const parseVolume = (vol: string | undefined): number => {
  if (!vol) return -Infinity;
  const cleanStr = vol.toLowerCase().replace(/,/g, '').trim();
  
  // Handle relative volume like "5x"
  if (cleanStr.endsWith('x')) {
    return parseFloat(cleanStr.replace('x', '')) * 100; // Scale arbitrary for sorting
  }

  // Handle percentages like "300%"
  if (cleanStr.endsWith('%')) {
    return parseFloat(cleanStr.replace('%', ''));
  }

  // Handle K, M, B suffixes
  let multiplier = 1;
  let numStr = cleanStr;
  
  if (cleanStr.endsWith('k')) {
    multiplier = 1000;
    numStr = cleanStr.replace('k', '');
  } else if (cleanStr.endsWith('m')) {
    multiplier = 1000000;
    numStr = cleanStr.replace('m', '');
  } else if (cleanStr.endsWith('b')) {
    multiplier = 1000000000;
    numStr = cleanStr.replace('b', '');
  }

  // Remove any remaining non-numeric chars (like " shares")
  numStr = numStr.replace(/[^0-9.-]/g, '');
  
  return (parseFloat(numStr) || 0) * multiplier;
};

// New: Generic Currency Parser (handles "$2.5M", "$400k")
export const parseCurrency = (val: string | undefined): number => {
  if (!val) return 0;
  return parseVolume(val); // Reuse volume logic as it handles K/M/B suffixes identical to currency
};

// New: Sentiment Parser (handles "Bullish", "Bearish", "High")
export const parseSentiment = (val: string | number | undefined): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const v = val.toLowerCase();
  
  if (v.includes('very bullish') || v.includes('extreme')) return 10;
  if (v.includes('bullish') || v.includes('high')) return 8;
  if (v.includes('positive')) return 7;
  if (v.includes('neutral') || v.includes('medium')) return 5;
  if (v.includes('mixed')) return 4;
  if (v.includes('bearish') || v.includes('low')) return 2;
  if (v.includes('very bearish')) return 0;
  return 5;
};
