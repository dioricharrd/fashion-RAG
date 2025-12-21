import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fashion-rag-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('fashion-rag-theme', newTheme);
  };

  // Theme utility classes
  const mainTone = isDark
    ? 'bg-slate-950 bg-[radial-gradient(circle_at_top,_#1d2535_0,_#020617_55%)] text-slate-50'
    : 'bg-slate-50 text-slate-900';

  const cardClasses = 'rounded-2xl border p-5 shadow-lg backdrop-blur-sm transition-colors';
  
  const cardTone = isDark
    ? 'border-slate-800/80 bg-slate-900/70 shadow-slate-950/70'
    : 'border-slate-200 bg-white shadow-slate-200/70';

  const subtleText = isDark ? 'text-slate-300' : 'text-slate-600';
  const subtleText2 = isDark ? 'text-slate-400' : 'text-slate-500';

  return {
    theme,
    isDark,
    toggleTheme,
    mainTone,
    cardClasses,
    cardTone,
    subtleText,
    subtleText2,
  };
}
