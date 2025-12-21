import { useState, useEffect, useCallback } from 'react';
import { TOAST_DURATION } from '@/lib/config';

export function useToast() {
  const [toast, setToast] = useState(null);

  // Auto-hide toast after duration
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
