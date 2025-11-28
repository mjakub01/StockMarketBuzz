
import { useState, useEffect, useCallback } from 'react';

export function useDraggableLayout<T extends string>(key: string, defaultLayout: T[]) {
  const [layout, setLayout] = useState<T[]>(defaultLayout);
  const [isDragging, setIsDragging] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation: ensure all default items exist in saved layout
        const hasAllKeys = defaultLayout.every(k => parsed.includes(k));
        if (hasAllKeys && parsed.length === defaultLayout.length) {
          setLayout(parsed);
        }
      } catch (e) {
        console.error("Failed to load layout", e);
      }
    }
  }, [key]);

  // Save to local storage on change
  useEffect(() => {
    if (layout.length > 0) {
      localStorage.setItem(key, JSON.stringify(layout));
    }
  }, [layout, key]);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setLayout((prevLayout) => {
      const newLayout = [...prevLayout];
      const [removed] = newLayout.splice(dragIndex, 1);
      newLayout.splice(hoverIndex, 0, removed);
      return newLayout;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(defaultLayout);
    localStorage.removeItem(key);
  }, [defaultLayout, key]);

  return {
    layout,
    moveItem,
    resetLayout,
    isDragging,
    setIsDragging
  };
}
