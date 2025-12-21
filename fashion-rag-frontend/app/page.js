"use client";

import { useState, useRef } from 'react';
import { DEFAULT_TOP_K, MAX_COMPARE_ITEMS, MAX_HISTORY_ITEMS } from '@/lib/config';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useSearch } from '@/hooks/useSearch';

// Layout components
import { Header } from '@/components/Layout/Header';
import { SearchHistory } from '@/components/Layout/SearchHistory';
import { InfoSidebar } from '@/components/Layout/InfoSidebar';
import { Footer } from '@/components/Layout/Footer';
import { RAGOutput } from '@/components/Layout/RAGOutput';

// Search form components
import { TextSearch } from '@/components/SearchForms/TextSearch';
import { ImageSearch } from '@/components/SearchForms/ImageSearch';
import { AISearch } from '@/components/SearchForms/AISearch';

// Results components
import { ResultsGrid } from '@/components/Results/ResultsGrid';

// UI components
import { Modal } from '@/components/UI/Modal';
import { Toast } from '@/components/UI/Toast';
import { DebugPanel } from '@/components/UI/DebugPanel';

export default function Home() {
  // Custom hooks
  const { theme, isDark, toggleTheme, mainTone, cardClasses, cardTone, subtleText, subtleText2 } = useTheme();
  const { toast, showToast, hideToast } = useToast();
  const {
    results,
    ragText,
    loading,
    error,
    handleTextSearch,
    handleAISearch,
    handleImageSearch,
  } = useSearch();

  // Debug mode
  const [debugMode, setDebugMode] = useState(false);

  // Text search state
  const [textQuery, setTextQuery] = useState('');
  const [topK, setTopK] = useState(DEFAULT_TOP_K);

  // Image search state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // AI search state
  const [aiPrompt, setAiPrompt] = useState('');

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // History state
  const [history, setHistory] = useState([]);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Sort & Filter state
  const [sortBy, setSortBy] = useState('score');
  const [filterCategory, setFilterCategory] = useState('all');

  // =========================
  // HISTORY FUNCTIONS
  // =========================
  function addHistory(entry) {
    setHistory((prev) => {
      const base = {
        id: Date.now() + Math.random(),
        ...entry,
      };

      // Remove duplicates
      const filtered = prev.filter((h) => {
        if (h.type !== entry.type) return true;
        if (entry.type === 'text') {
          return !(h.query === entry.query && h.topK === entry.topK);
        }
        if (entry.type === 'image') {
          return !(h.label === entry.label && h.topK === entry.topK);
        }
        if (entry.type === 'ai') {
          return !(h.query === entry.query && h.topK === entry.topK);
        }
        return true;
      });

      return [base, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }

  function applyHistoryItem(item) {
    setTopK(String(item.topK));
    if (item.type === 'text') {
      setTextQuery(item.query || item.label || '');
    } else if (item.type === 'image') {
      if (item.file) setImageFile(item.file);
      if (item.preview) setImagePreview(item.preview);
    } else if (item.type === 'ai') {
      setAiPrompt(item.query || item.label || '');
    }
  }

  // =========================
  // SEARCH HANDLERS
  // =========================
  async function onTextSearch(e) {
    e.preventDefault();
    const queryTrimmed = textQuery.trim();
    
    const result = await handleTextSearch(queryTrimmed, Number(topK));
    
    if (result.success) {
      addHistory({
        type: 'text',
        label: queryTrimmed,
        query: queryTrimmed,
        topK: Number(topK),
      });
      showToast(`Found ${result.count} results!`, 'success');
    } else if (result.cancelled) {
      showToast('Search cancelled', 'info');
    } else {
      showToast('Search failed', 'error');
    }
  }

  async function onAISearch(e) {
    e.preventDefault();
    const promptTrimmed = aiPrompt.trim();
    
    const result = await handleAISearch(promptTrimmed, Number(topK));
    
    if (result.success) {
      addHistory({
        type: 'ai',
        label: promptTrimmed,
        query: promptTrimmed,
        topK: Number(topK),
      });
      showToast(`Found ${result.count} results!`, 'success');
    } else if (result.cancelled) {
      showToast('Search cancelled', 'info');
    } else {
      showToast('Search failed', 'error');
    }
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
  }

  async function onImageSearch(e) {
    e.preventDefault();
    if (!imageFile) {
      showToast('Please select an image first', 'error');
      return;
    }
    
    const result = await handleImageSearch(imageFile, Number(topK));
    
    if (result.success) {
      addHistory({
        type: 'image',
        label: imageFile.name,
        file: imageFile,
        preview: imagePreview,
        topK: Number(topK),
      });
      showToast(`Found ${result.count} results!`, 'success');
    } else if (result.cancelled) {
      showToast('Search cancelled', 'info');
    } else {
      showToast('Search failed', 'error');
    }
  }

  // =========================
  // MODAL FUNCTIONS
  // =========================
  function openModal(item) {
    setSelectedItem(item);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  // =========================
  // COMPARE MODE FUNCTIONS
  // =========================
  function toggleCompareMode() {
    setCompareMode(!compareMode);
    setSelectedItems([]);
    showToast(
      compareMode ? 'Compare mode disabled' : 'Compare mode enabled - select items to compare',
      'info'
    );
  }

  function toggleItemSelection(item) {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.idx === item.idx);
      if (isSelected) {
        return prev.filter((i) => i.idx !== item.idx);
      } else {
        if (prev.length >= MAX_COMPARE_ITEMS) {
          showToast(`Maximum ${MAX_COMPARE_ITEMS} items can be compared`, 'error');
          return prev;
        }
        return [...prev, item];
      }
    });
  }

  // =========================
  // EXPORT FUNCTION
  // =========================
  function exportResults() {
    if (!results || results.length === 0) {
      showToast('No results to export', 'error');
      return;
    }
    const dataStr = JSON.stringify(
      {
        results,
        ragText,
        exportedAt: new Date().toISOString(),
        totalResults: results.length,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fashion-search-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Results exported successfully!', 'success');
  }

  const lastSearch = history[0];

  return (
    <main className={`min-h-screen ${mainTone}`}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <Header
          theme={theme}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          debugMode={debugMode}
          onToggleDebug={() => setDebugMode((prev) => !prev)}
          subtleText={subtleText}
        />

        {/* Hero */}
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Fashion RAG Search
          </h1>
          <p className={`max-w-2xl text-sm sm:text-base ${subtleText}`}>
            Cari produk fashion dengan teks atau gambar. Sistem akan melakukan image retrieval
            dengan CLIP + FAISS dan menghasilkan deskripsi rekomendasi menggunakan model generatif.
          </p>
        </header>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
          {/* LEFT – Forms + history */}
          <div className="space-y-6">
            <TextSearch
              textQuery={textQuery}
              setTextQuery={setTextQuery}
              topK={topK}
              setTopK={setTopK}
              onSearch={onTextSearch}
              loading={loading}
              isDark={isDark}
              cardClasses={cardClasses}
              cardTone={cardTone}
              subtleText={subtleText}
              subtleText2={subtleText2}
            />

            <ImageSearch
              imageFile={imageFile}
              imagePreview={imagePreview}
              fileInputRef={fileInputRef}
              onImageChange={onImageChange}
              onSearch={onImageSearch}
              topK={topK}
              setTopK={setTopK}
              loading={loading}
              isDark={isDark}
              cardClasses={cardClasses}
              cardTone={cardTone}
              subtleText={subtleText}
              subtleText2={subtleText2}
            />

            <AISearch
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              topK={topK}
              setTopK={setTopK}
              onSearch={onAISearch}
              loading={loading}
              isDark={isDark}
              cardClasses={cardClasses}
              cardTone={cardTone}
              subtleText={subtleText}
              subtleText2={subtleText2}
            />

            {/* Error */}
            {error && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                  isDark
                    ? 'border-red-500/50 bg-red-900/40 text-red-50 shadow-red-900/50'
                    : 'border-red-300 bg-red-50 text-red-800 shadow-red-200'
                }`}
              >
                {error}
              </div>
            )}

            <RAGOutput
              ragText={ragText}
              loading={loading}
              isDark={isDark}
              cardClasses={cardClasses}
              cardTone={cardTone}
            />

            <SearchHistory
              history={history}
              onApplyItem={applyHistoryItem}
              onClear={() => setHistory([])}
              isDark={isDark}
              subtleText2={subtleText2}
              cardClasses={cardClasses}
              cardTone={cardTone}
            />
          </div>

          {/* RIGHT – Sidebar */}
          <InfoSidebar
            isDark={isDark}
            subtleText={subtleText}
            cardClasses={cardClasses}
            cardTone={cardTone}
          />
        </div>

        {/* RESULTS */}
        <section className="mt-8">
          <ResultsGrid
            results={results}
            loading={loading}
            error={error}
            compareMode={compareMode}
            selectedItems={selectedItems}
            onItemClick={openModal}
            onToggleItemSelection={toggleItemSelection}
            onToggleCompareMode={toggleCompareMode}
            onExport={exportResults}
            onClearSelection={() => setSelectedItems([])}
            isDark={isDark}
            subtleText2={subtleText2}
          />

          {/* Debug Panel */}
          {debugMode && (
            <DebugPanel
              results={results}
              lastSearch={lastSearch}
              ragText={ragText}
              isDark={isDark}
              subtleText={subtleText}
              subtleText2={subtleText2}
              cardClasses={cardClasses}
              cardTone={cardTone}
            />
          )}
        </section>

        {/* Footer */}
        <Footer isDark={isDark} />
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <Modal
          item={selectedItem}
          onClose={closeModal}
          isDark={isDark}
          subtleText={subtleText}
          subtleText2={subtleText2}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} onClose={hideToast} isDark={isDark} />
    </main>
  );
}
