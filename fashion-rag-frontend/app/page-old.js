"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

const API_BASE = "http://localhost:8000";

export default function Home() {
  // theme: dark / light
  const [theme, setTheme] = useState("dark"); // "dark" | "light"
  const isDark = theme === "dark";

  // debug mode
  const [debugMode, setDebugMode] = useState(false);

  // state untuk text search
  const [textQuery, setTextQuery] = useState("");
  const [topK, setTopK] = useState(5);

  // state untuk image search
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // state untuk ai search
  const [aiPrompt, setAiPrompt] = useState("");

  // hasil
  const [results, setResults] = useState([]);
  const [ragText, setRagText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal detail
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // history pencarian (frontend only)
  // item: { id, type: 'text'|'image', label, query?, file?, preview?, topK }
  const [history, setHistory] = useState([]);

  // NEW FEATURES
  // Toast notifications
  const [toast, setToast] = useState(null);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Sort & Filter
  const [sortBy, setSortBy] = useState("score"); // "score" | "name"
  const [filterCategory, setFilterCategory] = useState("all");

  // Request cancellation
  const abortControllerRef = useRef(null);

  // tutup modal dengan Escape
  useEffect(() => {
    if (!showModal) return;
    function handleKey(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Helper function to show toast
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  // =========================
  // HELPER HISTORY
  // =========================
  function addHistory(entry) {
    setHistory((prev) => {
      const base = {
        id: Date.now() + Math.random(),
        ...entry,
      };

      // buang duplikat simpel
      const filtered = prev.filter((h) => {
        if (h.type !== entry.type) return true;
        if (entry.type === "text") {
          return !(h.query === entry.query && h.topK === entry.topK);
        }
        if (entry.type === "image") {
          return !(h.label === entry.label && h.topK === entry.topK);
        }
        if (entry.type === "ai") {
          return !(h.query === entry.query && h.topK === entry.topK);
        }
        return true;
      });

      return [base, ...filtered].slice(0, 8); // max 8 item
    });
  }

  function applyHistoryItem(item) {
    setTopK(String(item.topK));
    if (item.type === "text") {
      setTextQuery(item.query || item.label || "");
      // user tinggal klik "Search Text"
    } else if (item.type === "image") {
      // cuma isi kembali preview & file; user klik "Search Image"
      if (item.file) {
        setImageFile(item.file);
      }
      if (item.preview) {
        setImagePreview(item.preview);
      }
    } else if (item.type === "ai") {
      // isi ulang prompt; user klik "Search AI"
      setAiPrompt(item.query || item.label || "");
    }
  }

  // =========================
  // TEXT SEARCH
  // =========================
  async function handleTextSearch(e) {
    e.preventDefault();

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError("");
    setResults([]);
    setRagText("");
    setSelectedItem(null);
    setShowModal(false);
    setSelectedItems([]);

    const queryTrimmed = textQuery.trim();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/search/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryTrimmed,
          top_k: Number(topK),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setResults(data.results || []);
      setRagText(data.rag_text || "");

      // simpan ke history
      addHistory({
        type: "text",
        label: queryTrimmed,
        query: queryTrimmed,
        topK: Number(topK),
      });

      showToast(`Found ${data.results?.length || 0} results!`, "success");
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast("Search cancelled", "info");
        return;
      }
      console.error(err);
      setError("Gagal melakukan text search. Cek backend di port 8000.");
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // AI SEARCH
  // =========================
  async function handleAISearch(e) {
    e.preventDefault();

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError("");
    setResults([]);
    setRagText("");
    setSelectedItem(null);
    setShowModal(false);
    setSelectedItems([]);

    const promptTrimmed = aiPrompt.trim();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/search/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptTrimmed,
          top_k: Number(topK),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setResults(data.results || []);
      setRagText(data.rag_text || "");

      // simpan ke history
      addHistory({
        type: "ai",
        label: promptTrimmed,
        query: promptTrimmed,
        topK: Number(topK),
      });

      showToast(`Found ${data.results?.length || 0} results!`, "success");
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast("Search cancelled", "info");
        return;
      }
      console.error(err);
      setError("Gagal melakukan AI search. Cek backend di port 8000.");
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // IMAGE SEARCH
  // =========================
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
    setError("");
  }

  async function handleImageSearch(e) {
    e.preventDefault();
    if (!imageFile) {
      setError("Pilih gambar dulu sebelum melakukan image search.");
      showToast("Please select an image first", "error");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError("");
    setResults([]);
    setRagText("");
    setSelectedItem(null);
    setShowModal(false);
    setSelectedItems([]);

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("top_k", String(topK));

      const res = await fetch(`${API_BASE}/search/image?top_k=${topK}`, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setResults(data.results || []);
      setRagText(data.rag_text || "");

      // simpan ke history
      addHistory({
        type: "image",
        label: imageFile.name,
        file: imageFile,
        preview: imagePreview,
        topK: Number(topK),
      });

      showToast(`Found ${data.results?.length || 0} results!`, "success");
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast("Search cancelled", "info");
        return;
      }
      console.error(err);
      setError("Gagal melakukan image search. Cek backend di port 8000.");
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // buka / tutup modal
  function openModal(item) {
    setSelectedItem(item);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  // Export results to JSON
  function exportResults() {
    if (!results || results.length === 0) {
      showToast("No results to export", "error");
      return;
    }
    const dataStr = JSON.stringify({
      results,
      ragText,
      exportedAt: new Date().toISOString(),
      totalResults: results.length,
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fashion-search-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Results exported successfully!", "success");
  }

  // Toggle compare mode
  function toggleCompareMode() {
    setCompareMode(!compareMode);
    setSelectedItems([]);
    showToast(compareMode ? "Compare mode disabled" : "Compare mode enabled - select items to compare", "info");
  }

  // Handle item selection in compare mode
  function toggleItemSelection(item) {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.idx === item.idx);
      if (isSelected) {
        return prev.filter((i) => i.idx !== item.idx);
      } else {
        if (prev.length >= 3) {
          showToast("Maximum 3 items can be compared", "error");
          return prev;
        }
        return [...prev, item];
      }
    });
  }

  // Get unique categories from results
  const categories = useMemo(() => {
    if (!results || results.length === 0) return [];
    const cats = [...new Set(results.map(r => r.category).filter(Boolean))];
    return cats.sort();
  }, [results]);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];
    
    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === "name") {
        return (a.display_name || "").localeCompare(b.display_name || "");
      }
      return 0;
    });

    return filtered;
  }, [results, filterCategory, sortBy]);

  // util kelas card biar nggak ngulang
  const cardClasses =
    "rounded-2xl border p-5 shadow-lg backdrop-blur-sm transition-colors";
  const cardTone = isDark
    ? "border-slate-800/80 bg-slate-900/70 shadow-slate-950/70"
    : "border-slate-200 bg-white shadow-slate-200/70";

  const mainTone = isDark
    ? "bg-slate-950 bg-[radial-gradient(circle_at_top,_#1d2535_0,_#020617_55%)] text-slate-50"
    : "bg-slate-50 text-slate-900";

  const subtleText = isDark ? "text-slate-300" : "text-slate-600";
  const subtleText2 = isDark ? "text-slate-400" : "text-slate-500";

  const lastSearch = history[0];

  // hitung statistik score sederhana untuk debug
  let scoreStats = null;
  if (results && results.length > 0) {
    const scores = results
      .map((r) => r.score)
      .filter((s) => typeof s === "number" && !Number.isNaN(s));

    if (scores.length > 0) {
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      scoreStats = { min, max, avg, count: scores.length };
    }
  }

  return (
    <main className={`min-h-screen ${mainTone}`}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Top nav / header */}
        <nav className="mb-6 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold shadow-md shadow-indigo-500/40">
      FR
    </div>
    <span className={`text-sm font-medium tracking-tight sm:text-base ${subtleText}`}>
      Fashion RAG Demo
    </span>
  </div>

  {/* 🔥 BUTTONS RIGHT SIDE */}
  <div className="flex items-center gap-2">
    {/* About button */}
    <a
      href="/about"
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition
        ${
          isDark
            ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:bg-slate-800"
            : "border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50"
        }`}
    >
      📘 About
    </a>

    {/* Existing Debug Button */}
    <button
      type="button"
      onClick={() => setDebugMode((prev) => !prev)}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition ${
        debugMode
          ? "border-amber-400 bg-amber-500/20 text-amber-100"
          : isDark
          ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-400 hover:bg-slate-800"
          : "border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-slate-50"
      }`}
    >
      <span className="text-base">🐞</span>
      <span>{debugMode ? "Debug ON" : "Debug"}</span>
    </button>

    {/* Existing Theme Toggle */}
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition ${
        isDark
          ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:bg-slate-800"
          : "border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50"
      }`}
    >
      <span className="text-base">{isDark ? "🌙" : "☀️"}</span>
      <span>{isDark ? "Dark mode" : "Light mode"}</span>
    </button>
  </div>
</nav>


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
            {/* TEXT SEARCH */}
            <section className={`${cardClasses} ${cardTone}`}>
              <h2 className="text-base font-semibold sm:text-lg">Search by Text</h2>
              <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
                Contoh query:{" "}
                <span className="font-medium">
                  “green shirt”, “red dress”, “blue jeans for men”
                </span>
                .
              </p>

              <form onSubmit={handleTextSearch} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm">
                    Text query
                  </label>
                  <input
                    type="text"
                    placeholder="Tulis deskripsi produk atau gaya yang kamu cari..."
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition sm:text-base ${
                      isDark
                        ? "border-slate-800 bg-slate-950/80 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                        : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                    }`}
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <label className={subtleText}>
                    Top K
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={topK}
                      onChange={(e) => setTopK(e.target.value)}
                      className={`ml-2 w-20 rounded-md border px-2 py-1 text-right text-xs outline-none ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                          : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                      }`}
                    />
                  </label>
                  <span className={`text-[11px] ${subtleText2}`}>
                    Sistem akan mengembalikan {topK} produk paling mirip.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search Text"}
                </button>
              </form>
            </section>

            {/* IMAGE SEARCH */}
            <section className={`${cardClasses} ${cardTone}`}>
              <h2 className="text-base font-semibold sm:text-lg">Search by Image</h2>
              <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
                Upload foto produk, katalog, atau outfit. CLIP akan mengubahnya menjadi embedding
                visual lalu mencocokkan dengan katalog.
              </p>

              <form onSubmit={handleImageSearch} className="space-y-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="flex flex-col gap-1 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`inline-flex w-fit items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-400 hover:bg-slate-800"
                        : "border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-slate-50"
                    }`}
                  >
                    Pilih Gambar
                  </button>
                  <span className={`text-[11px] ${subtleText2}`}>
                    {imageFile ? `Selected: ${imageFile.name}` : "Belum ada file yang dipilih."}
                  </span>
                </div>

                {imagePreview && (
                  <div>
                    <p
                      className={`mb-1 text-[11px] font-medium uppercase tracking-wide ${
                        subtleText2
                      }`}
                    >
                      Preview
                    </p>
                    <div
                      className={`inline-block overflow-hidden rounded-xl border ${
                        isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-100"
                      }`}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 w-auto object-cover"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search Image"}
                </button>
              </form>
            </section>

            {/* AI SEARCH */}
            <section className={`${cardClasses} ${cardTone}`}>
              <h2 className="text-base font-semibold sm:text-lg">Search by AI</h2>
              <p className={`mb-4 mt-1 text-xs sm:text-sm ${subtleText2}`}>
                Tulis prompt kreatif atau deskripsi detail tentang produk yang ingin dicari. AI
                akan menginterpretasi dan menemukan produk yang paling relevan.
              </p>

              <form onSubmit={handleAISearch} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm">
                    AI Prompt
                  </label>
                  <textarea
                    placeholder="Contoh: 'Cari pakaian untuk musim panas yang nyaman dan stylish dengan warna cerah'..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition sm:text-base ${
                      isDark
                        ? "border-slate-800 bg-slate-950/80 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                        : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                    }`}
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <label className={subtleText}>
                    Top K
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={topK}
                      onChange={(e) => setTopK(e.target.value)}
                      className={`ml-2 w-20 rounded-md border px-2 py-1 text-right text-xs outline-none ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                          : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                      }`}
                    />
                  </label>
                  <span className={`text-[11px] ${subtleText2}`}>
                    Sistem akan mengembalikan {topK} produk paling relevan.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search AI"}
                </button>
              </form>
            </section>

            {/* ERROR */}
            {error && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                  isDark
                    ? "border-red-500/50 bg-red-900/40 text-red-50 shadow-red-900/50"
                    : "border-red-300 bg-red-50 text-red-800 shadow-red-200"
                }`}
              >
                {error}
              </div>
            )}

            {/* RAG TEXT + skeleton */}
            {loading && !ragText && (
              <section className={`${cardClasses} ${cardTone}`}>
                <div className="mb-2 h-4 w-40 animate-pulse rounded bg-slate-600/40" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-600/30" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-slate-600/30" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-slate-600/30" />
                </div>
              </section>
            )}

            {ragText && (
              <section className={`${cardClasses} ${cardTone}`}>
                <h2 className="mb-2 text-base font-semibold sm:text-lg">
                  Generated Recommendation
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {ragText}
                </p>
              </section>
            )}

            {/* HISTORY PENCARIAN */}
            {history.length > 0 && (
              <section className={`${cardClasses} ${cardTone}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold sm:text-base">Recent Searches</h2>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className={`text-[11px] underline-offset-2 hover:underline ${
                      subtleText2
                    }`}
                  >
                    Clear
                  </button>
                </div>
                <p className={`mb-2 text-[11px] ${subtleText2}`}>
                  Klik item untuk mengisi ulang form, lalu tekan tombol Search untuk menjalankan
                  kembali.
                </p>
                <ul className="space-y-2 text-sm">
                  {history.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => applyHistoryItem(item)}
                        className="flex flex-1 items-center gap-2 overflow-hidden text-left hover:opacity-90"
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            item.type === "text"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : item.type === "image"
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-violet-500/20 text-violet-300"
                          }`}
                        >
                          {item.type === "text" ? "T" : item.type === "image" ? "I" : "A"}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-xs font-medium sm:text-sm">
                            {item.label}
                          </p>
                          <p className={`truncate text-[11px] ${subtleText2}`}>
                            {item.type === "text" ? "Text query" : item.type === "image" ? "Image search" : "AI prompt"} · Top K{" "}
                            {item.topK}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* RIGHT – How it works / info */}
          <aside className="hidden flex-col gap-4 lg:flex">
            <section className={`${cardClasses} ${cardTone}`}>
              <h2 className="mb-2 text-base font-semibold sm:text-lg">
                How this demo works
              </h2>
              <ol className={`space-y-2 text-sm ${subtleText}`}>
                <li>
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
                    1
                  </span>
                  Dataset produk fashion di-embed dengan{" "}
                  <span className="font-semibold text-indigo-300">CLIP</span> dan di-index dengan{" "}
                  <span className="font-semibold text-indigo-300">FAISS</span>.
                </li>
                <li>
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
                    2
                  </span>
                  Query teks atau gambar dari user diubah menjadi embedding lalu dicocokkan dengan
                  index.
                </li>
                <li>
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
                     3
                  </span>
                  Beberapa produk terdekat dijadikan context dan dikirim ke model{" "}
                  <span className="font-semibold text-indigo-300">Flan-T5</span> untuk menghasilkan
                  deskripsi rekomendasi.
                </li>
              </ol>
            </section>

            <section className={`${cardClasses} ${cardTone} text-sm`}>
              <h3 className="mb-2 text-sm font-semibold">
                Tips pencarian yang bagus
              </h3>
              <ul className={`space-y-1 list-disc pl-5 ${subtleText2}`}>
                <li>Gunakan warna + tipe pakaian, misalnya “black cap”, “green t-shirt”.</li>
                <li>Untuk gambar, usahakan produk jelas dan tidak terlalu banyak objek lain.</li>
                <li>Top-K kecil (&lt; 10) untuk rekomendasi fokus, lebih besar untuk eksplorasi.</li>
              </ul>
            </section>
          </aside>
        </div>

        {/* RESULTS */}
        <section className="mt-8">
          {/* Loading skeleton grid */}
          {loading && results.length === 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col overflow-hidden rounded-2xl border shadow-md animate-pulse ${
                    isDark
                      ? "border-slate-800 bg-slate-900/80 shadow-slate-950/70"
                      : "border-slate-200 bg-white shadow-slate-200/70"
                  }`}
                >
                  <div
                    className={`aspect-[3/4] ${
                      isDark ? "bg-slate-800/80" : "bg-slate-200/70"
                    }`}
                  />
                  <div className="space-y-2 px-3 py-3">
                    <div className="h-3 w-4/5 rounded bg-slate-600/40" />
                    <div className="h-3 w-1/2 rounded bg-slate-600/30" />
                    <div className="h-3 w-2/3 rounded bg-slate-600/30" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real results */}
          {results.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold sm:text-lg">
                  Retrieved Products{" "}
                  <span className={`text-sm font-normal ${subtleText2}`}>
                    ({filteredAndSortedResults.length}/{results.length})
                  </span>
                </h2>
                
                {/* Action buttons and filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  {categories.length > 1 && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-200"
                          : "border-slate-300 bg-white text-slate-800"
                      }`}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-300 bg-white text-slate-800"
                    }`}
                  >
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                  </select>

                  {/* Compare Mode Toggle */}
                  <button
                    type="button"
                    onClick={toggleCompareMode}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      compareMode
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500"
                        : "border-slate-300 bg-white text-slate-800 hover:border-indigo-500"
                    }`}
                  >
                    {compareMode ? `Compare (${selectedItems.length})` : "Compare"}
                  </button>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={exportResults}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500"
                        : "border-slate-300 bg-white text-slate-800 hover:border-indigo-500"
                    }`}
                    title="Export results to JSON"
                  >
                    📥 Export
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {filteredAndSortedResults.map((item) => {
                  const isSelected = selectedItems.some((i) => i.idx === item.idx);
                  return (
                    <article
                      key={item.idx}
                      onClick={() => {
                        if (compareMode) {
                          toggleItemSelection(item);
                        } else {
                          openModal(item);
                        }
                      }}
                      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                        compareMode && isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/50"
                          : isDark
                          ? "border-slate-800 bg-slate-900/80 shadow-slate-950/70 hover:border-indigo-500/70 hover:shadow-indigo-900/50"
                          : "border-slate-200 bg-white shadow-slate-200/70 hover:border-indigo-500/70 hover:shadow-indigo-200/50"
                      }`}
                    >
                      {compareMode && isSelected && (
                        <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-lg">
                          ✓
                        </div>
                      )}
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                        <img
                          src={`${API_BASE}/image/${item.idx}`}
                          alt={item.display_name || "Product image"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 px-3 py-3">
                        <h3 className="line-clamp-2 text-sm font-semibold">
                          {item.display_name || "Untitled"}
                        </h3>
                        <p className={`text-xs ${subtleText2}`}>{item.category}</p>
                        <p className={`mt-1 text-[11px] ${subtleText2}`}>
                          Score:{" "}
                          <span className="font-mono">
                            {item.score.toFixed(4)}
                          </span>
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Comparison View */}
              {compareMode && selectedItems.length >= 2 && (
                <div className={`mt-6 ${cardClasses} ${cardTone}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold">Comparison</h3>
                    <button
                      onClick={() => setSelectedItems([])}
                      className="text-xs underline-offset-2 hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedItems.map((item) => (
                      <div key={item.idx} className="space-y-2">
                        <div className={`overflow-hidden rounded-lg border ${
                          isDark ? "border-slate-700" : "border-slate-300"
                        }`}>
                          <img
                            src={`${API_BASE}/image/${item.idx}`}
                            alt={item.display_name}
                            className="w-full object-cover aspect-[3/4]"
                          />
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold">{item.display_name}</p>
                          <p className={`text-xs ${subtleText2}`}>
                            Category: {item.category}
                          </p>
                          <p className={`text-xs ${subtleText2}`}>
                            Score: <span className="font-mono">{item.score.toFixed(4)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && results.length === 0 && !error && (
            <p className={`mt-6 text-sm ${subtleText2}`}>
              Belum ada hasil. Coba lakukan pencarian teks atau upload gambar untuk memulai.
            </p>
          )}

          {/* DEBUG PANEL */}
          {debugMode && (results.length > 0 || lastSearch || ragText) && (
            <section className={`mt-8 ${cardClasses} ${cardTone}`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold sm:text-base">
                  Debug Panel (Client-side View)
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                  Read-only · for analysis
                </span>
              </div>

              {/* Info pencarian terakhir */}
              {lastSearch && (
                <div className="mb-3 text-xs sm:text-sm">
                  <p className={`mb-1 font-semibold ${subtleText}`}>
                    Last search:
                  </p>
                  <p className={subtleText2}>
                    Type:{" "}
                    <span className="font-mono">
                      {lastSearch.type === "text" ? "text" : "image"}
                    </span>{" "}
                    · Label:{" "}
                    <span className="font-mono">
                      {lastSearch.label}
                    </span>{" "}
                    · Top K:{" "}
                    <span className="font-mono">
                      {lastSearch.topK}
                    </span>
                  </p>
                </div>
              )}

              {/* Statistik score */}
              {scoreStats && (
                <div className="mb-3 text-xs sm:text-sm">
                  <p className={`mb-1 font-semibold ${subtleText}`}>
                    Score statistics (from retrieval):
                  </p>
                  <p className={subtleText2}>
                    Count:{" "}
                    <span className="font-mono">{scoreStats.count}</span>{" "}
                    · Min:{" "}
                    <span className="font-mono">{scoreStats.min.toFixed(6)}</span>{" "}
                    · Max:{" "}
                    <span className="font-mono">{scoreStats.max.toFixed(6)}</span>{" "}
                    · Avg:{" "}
                    <span className="font-mono">{scoreStats.avg.toFixed(6)}</span>
                  </p>
                </div>
              )}

              {/* Ringkasan ragText */}
              {ragText && (
                <div className="mb-3 text-xs sm:text-sm">
                  <p className={`mb-1 font-semibold ${subtleText}`}>
                    RAG output length:
                  </p>
                  <p className={subtleText2}>
                    Characters:{" "}
                    <span className="font-mono">{ragText.length}</span>
                  </p>
                </div>
              )}

              {/* Tabel ringkas results */}
              {results.length > 0 && (
                <div className="mb-3">
                  <p className={`mb-1 text-xs font-semibold ${subtleText}`}>
                    Top results (idx · score · title):
                  </p>
                  <div className="max-h-40 overflow-auto rounded-lg border border-slate-700/60 text-xs">
                    <table className="min-w-full border-separate border-spacing-y-0.25">
                      <thead
                        className={isDark ? "bg-slate-900/80" : "bg-slate-100"}
                      >
                        <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                          <th className="px-2 py-1 font-medium">Idx</th>
                          <th className="px-2 py-1 font-medium">Score</th>
                          <th className="px-2 py-1 font-medium">Title</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => (
                          <tr
                            key={r.idx}
                            className={isDark ? "text-slate-200" : "text-slate-800"}
                          >
                            <td className="px-2 py-1 font-mono text-[11px] align-top">
                              {r.idx}
                            </td>
                            <td className="px-2 py-1 font-mono text-[11px] align-top">
                              {typeof r.score === "number"
                                ? r.score.toFixed(6)
                                : "-"}
                            </td>
                            <td className="px-2 py-1 text-[11px] align-top">
                              {r.display_name || "(no title)"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* JSON snippet */}
              {results.length > 0 && (
                <div className="text-xs">
                  <p className={`mb-1 font-semibold ${subtleText}`}>
                    Raw first item (JSON snippet):
                  </p>
                  <pre
                    className={`max-h-52 overflow-auto rounded-lg border px-3 py-2 text-[10px] leading-snug ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-200"
                        : "border-slate-300 bg-slate-100 text-slate-800"
                    }`}
                  >
                    {JSON.stringify(results[0], null, 2)}
                  </pre>
                </div>
              )}
            </section>
          )}
        </section>

        {/* Footer kecil */}
        <footer
          className={`mt-10 border-t pt-4 text-xs ${
            isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"
          }`}
        >
          Built for demo · Fashion Retrieval + RAG · Backend: FastAPI · Frontend: Next.js + Tailwind
        </footer>
      </div>

      {/* MODAL DETAIL PRODUK */}
      {showModal && selectedItem && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6 sm:px-6"
          onClick={closeModal}
        >
          <div
            className={`relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl ${
              isDark
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 px-4 py-3 sm:px-5">
              <div>
                <h3 className="text-base font-semibold sm:text-lg">
                  {selectedItem.display_name || "Product detail"}
                </h3>
                <p className={`text-xs sm:text-sm ${subtleText2}`}>
                  Category: {selectedItem.category || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-700/40 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 px-4 py-4 sm:grid-cols-[1.1fr_1.4fr] sm:px-5 sm:py-5">
              <div className="flex items-center justify-center">
                <div
                  className={`w-full overflow-hidden rounded-xl border ${
                    isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-100"
                  }`}
                >
                  <img
                    src={`${API_BASE}/image/${selectedItem.idx}`}
                    alt={selectedItem.display_name || "Product image"}
                    className="w-full object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>
                  <p className={`mt-1 text-sm ${subtleText}`}>
                    {selectedItem.description ||
                      "Tidak ada deskripsi panjang pada metadata produk ini."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-400">Index</p>
                    <p className="font-mono text-slate-200">{selectedItem.idx}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400">Score</p>
                    <p className="font-mono text-slate-200">
                      {selectedItem.score != null
                        ? selectedItem.score.toFixed(6)
                        : "-"}
                    </p>
                  </div>
                  {selectedItem.image_path && (
                    <div className="col-span-2">
                      <p className="font-semibold text-slate-400">Image path</p>
                      <p className={`mt-0.5 line-clamp-2 break-all text-[11px] ${subtleText2}`}>
                        {selectedItem.image_path}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-1 text-[11px] text-slate-500">
                  Hint: tekan <span className="font-mono">Esc</span> atau klik area gelap di luar
                  card untuk menutup.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? isDark
                  ? "border-emerald-500/50 bg-emerald-900/90 text-emerald-50"
                  : "border-emerald-500 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                ? isDark
                  ? "border-red-500/50 bg-red-900/90 text-red-50"
                  : "border-red-500 bg-red-50 text-red-900"
                : isDark
                ? "border-slate-700 bg-slate-900/90 text-slate-50"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            <span className="text-lg">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
            </span>
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
