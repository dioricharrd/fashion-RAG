import { useState, useRef, useCallback } from 'react';
import { searchByText, searchByAI, searchByImage } from '@/lib/api';

export function useSearch() {
  const [results, setResults] = useState([]);
  const [ragText, setRagText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);

  // Cancel any ongoing request
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Reset search state
  const resetSearch = useCallback(() => {
    setResults([]);
    setRagText('');
    setError('');
  }, []);

  // Generic search handler
  const performSearch = useCallback(async (searchFn, ...args) => {
    cancelSearch();
    setLoading(true);
    setError('');
    resetSearch();

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const data = await searchFn(...args, signal);
      setResults(data.results || []);
      setRagText(data.rag_text || '');
      return { success: true, count: data.results?.length || 0 };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [cancelSearch, resetSearch]);

  // Text search
  const handleTextSearch = useCallback((query, topK) => {
    return performSearch(searchByText, query, topK);
  }, [performSearch]);

  // AI search
  const handleAISearch = useCallback((prompt, topK) => {
    return performSearch(searchByAI, prompt, topK);
  }, [performSearch]);

  // Image search
  const handleImageSearch = useCallback((file, topK) => {
    return performSearch(searchByImage, file, topK);
  }, [performSearch]);

  return {
    results,
    ragText,
    loading,
    error,
    setResults,
    setRagText,
    setError,
    handleTextSearch,
    handleAISearch,
    handleImageSearch,
    cancelSearch,
    resetSearch,
  };
}
