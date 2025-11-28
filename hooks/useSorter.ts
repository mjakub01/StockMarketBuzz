
import { useState, useMemo } from 'react';
import { parsePrice, parsePercentage, parseVolume, parseCurrency, parseSentiment } from '../utils';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: string;
  label: string;
  // Function to extract the value for sorting from the item
  getValue?: (item: T) => string | number;
  // Pre-defined parser type to use built-in utils
  type?: 'number' | 'string' | 'date' | 'price' | 'percentage' | 'volume' | 'currency' | 'sentiment';
}

interface UseSorterProps<T> {
  data: T[];
  config: SortConfig<T>[];
  defaultKey?: string;
}

export function useSorter<T>({ data, config, defaultKey }: UseSorterProps<T>) {
  const [activeKey, setActiveKey] = useState<string>(defaultKey || config[0]?.key || '');
  const [direction, setDirection] = useState<SortDirection>('desc');

  const handleSort = (key: string) => {
    if (activeKey === key) {
      // Toggle direction if clicking same key
      setDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      // New key, default to descending (highest first usually best for trading)
      setActiveKey(key);
      setDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    if (!activeKey) return data;

    const sortOption = config.find(c => c.key === activeKey);
    if (!sortOption) return data;

    return [...data].sort((a, b) => {
      let valA: any = sortOption.getValue ? sortOption.getValue(a) : (a as any)[activeKey];
      let valB: any = sortOption.getValue ? sortOption.getValue(b) : (b as any)[activeKey];

      // Parser Logic
      switch (sortOption.type) {
        case 'price':
          valA = parsePrice(String(valA));
          valB = parsePrice(String(valB));
          break;
        case 'percentage':
          valA = parsePercentage(String(valA));
          valB = parsePercentage(String(valB));
          break;
        case 'volume':
          valA = parseVolume(String(valA));
          valB = parseVolume(String(valB));
          break;
        case 'currency':
          valA = parseCurrency(String(valA));
          valB = parseCurrency(String(valB));
          break;
        case 'sentiment':
          valA = parseSentiment(valA);
          valB = parseSentiment(valB);
          break;
        case 'number':
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
          break;
        case 'string':
        default:
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
          return direction === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
      }

      // Numeric comparison for parsed values
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, activeKey, direction, config]);

  return {
    sortedData,
    activeKey,
    direction,
    handleSort,
    sortOptions: config
  };
}
