import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';
import { ComparisonView } from './ComparisonView';
import { FilterBar } from './FilterBar';
import { LoadingSkeleton } from '../UI/LoadingSkeleton';

export function ResultsGrid({
  results,
  loading,
  error,
  compareMode,
  selectedItems,
  onItemClick,
  onToggleItemSelection,
  onToggleCompareMode,
  onExport,
  onClearSelection,
  isDark,
  subtleText2,
}) {
  // Get unique categories
  const categories = useMemo(() => {
    if (!results || results.length === 0) return [];
    const cats = [...new Set(results.map((r) => r.category).filter(Boolean))];
    return cats.sort();
  }, [results]);

  // Filter and sort state
  const [sortBy, setSortBy] = useState('score');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === 'name') {
        return (a.display_name || '').localeCompare(b.display_name || '');
      }
      return 0;
    });

    return filtered;
  }, [results, filterCategory, sortBy]);

  // Loading skeleton
  if (loading && results.length === 0) {
    return <LoadingSkeleton isDark={isDark} count={5} />;
  }

  // No results
  if (!loading && results.length === 0 && !error) {
    return (
      <p className={`mt-6 text-sm ${subtleText2}`}>
        Belum ada hasil. Coba lakukan pencarian teks atau upload gambar untuk memulai.
      </p>
    );
  }

  // Results found
  if (results.length > 0) {
    return (
      <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold sm:text-lg">
            Retrieved Products{' '}
            <span className={`text-sm font-normal ${subtleText2}`}>
              ({filteredAndSortedResults.length}/{results.length})
            </span>
          </h2>

          <FilterBar
            categories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            compareMode={compareMode}
            toggleCompareMode={onToggleCompareMode}
            selectedItemsCount={selectedItems.length}
            onExport={onExport}
            isDark={isDark}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredAndSortedResults.map((item) => {
            const isSelected = selectedItems.some((i) => i.idx === item.idx);
            return (
              <ProductCard
                key={item.idx}
                item={item}
                onClick={compareMode ? onToggleItemSelection : onItemClick}
                isSelected={isSelected}
                compareMode={compareMode}
                isDark={isDark}
                subtleText2={subtleText2}
              />
            );
          })}
        </div>

        <ComparisonView
          selectedItems={selectedItems}
          onClear={onClearSelection}
          isDark={isDark}
          subtleText2={subtleText2}
        />
      </>
    );
  }

  return null;
}
