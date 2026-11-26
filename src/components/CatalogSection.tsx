import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User,
  Volume2,
  X,
} from 'lucide-react';
import {
  ALL_AUTHORS,
  ALL_CATEGORIES,
  ALL_YEARS,
  CATEGORY_COLOR_MAP,
} from '../data/books';
import {
  Book,
  SearchFilters,
  SmartSearchOutput,
  SortOption,
  YearRangeFilter,
} from '../types/library';
import { BookCover } from './BookCover';

interface CatalogSectionProps {
  allBooks: Book[];
  searchOutput: SmartSearchOutput;
  filters: SearchFilters;
  onUpdateFilters: (patch: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  borrowedBookIds: string[];
  waitlistBookIds: string[];
  highContrast: boolean;
  screenReaderMode: boolean;
  onOpenDetail: (book: Book) => void;
  onQuickBorrow: (book: Book) => void;
  onToggleWaitlist: (book: Book) => void;
  onSpeakText: (text: string) => void;
}

const YEAR_RANGES: { value: YearRangeFilter; label: string }[] = [
  { value: 'semua', label: 'Semua Tahun' },
  { value: '2024-2026', label: '2024 – 2026' },
  { value: '2020-2023', label: '2020 – 2023' },
  { value: '2015-2019', label: '2015 – 2019' },
  { value: 'sebelum-2015', label: 'Sebelum 2015' },
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  allBooks,
  searchOutput,
  filters,
  onUpdateFilters,
  onResetFilters,
  borrowedBookIds,
  waitlistBookIds,
  highContrast,
  screenReaderMode,
  onOpenDetail,
  onQuickBorrow,
  onToggleWaitlist,
  onSpeakText,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: allBooks.length };
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = allBooks.filter((b) => b.kategori === cat).length;
    }
    return counts;
  }, [allBooks]);

  const authorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of allBooks) {
      map[b.penulis] = (map[b.penulis] || 0) + 1;
    }
    return map;
  }, [allBooks]);

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.kategori !== 'Semua' ||
    filters.penulis !== 'Semua' ||
    filters.rentangTahun !== 'semua' ||
    filters.tahunSpesifik !== 'Semua' ||
    filters.hanyaTersedia;

  const { results, didYouMean, suggestions } = searchOutput;

  return (
    <section
      id="katalog"
      aria-labelledby="katalog-heading"
      className="py-10 lg:py-14 bg-[var(--bg-canvas)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Smart Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--border-hairline)]">
          <div>
            <h2
              id="katalog-heading"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]"
            >
              Katalog &amp; Pencarian Cerdas
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[var(--text-secondary)]">
              Cari berdasarkan judul, topik, sinonim kata, atau saring lewat menu kategori, tahun terbit, dan penulis.
            </p>
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              aria-expanded={mobileFilterOpen}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Filter Katalog</span>
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"
              >
                Urutkan:
              </label>
              <select
                id="sort-select"
                value={filters.urutan}
                onChange={(e) =>
                  onUpdateFilters({ urutan: e.target.value as SortOption })
                }
                className="px-3 py-2 min-h-[42px] rounded-lg text-sm font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              >
                <option value="relevansi">Relevansi Cerdas</option>
                <option value="terbaru">Tahun Terbit Terbaru</option>
                <option value="judul-az">Judul (A – Z)</option>
                <option value="tersedia">Stok Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main 2-Column Workspace: Filter Menu Left + Results Right */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Search & Multi-Facet Filter Menu */}
          <aside
            aria-label="Menu pencarian dan filter buku"
            className={`lg:col-span-4 xl:col-span-3 space-y-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 ${
              mobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <Filter
                  className="w-4 h-4 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Menu Filter Pencarian
                </h3>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Smart Search Box inside Filter Menu */}
            <div ref={searchContainerRef} className="relative">
              <label
                htmlFor="catalog-smart-search"
                className="block text-xs font-bold text-[var(--text-primary)] mb-1.5"
              >
                Kata Kunci Cerdas
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  id="catalog-smart-search"
                  type="text"
                  value={filters.query}
                  onChange={(e) => {
                    onUpdateFilters({ query: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setShowSuggestions(true);
                    onSpeakText(
                      'Input kata kunci cerdas. Ketik judul, penulis, topik, atau tahun terbit.'
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSuggestions(false);
                  }}
                  placeholder="Judul, penulis, topik..."
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions && suggestions.length > 0}
                  className="w-full pl-9 pr-9 py-2.5 min-h-[42px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                {filters.query && (
                  <button
                    type="button"
                    aria-label="Hapus kata kunci pencarian"
                    onClick={() => {
                      onUpdateFilters({ query: '' });
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Saran pencarian cerdas"
                  className="absolute z-20 mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg py-1.5"
                >
                  {suggestions.map((sug, idx) => (
                    <li key={`${sug.type}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateFilters({ query: sug.value });
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-subtle)] flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="font-semibold text-[var(--text-primary)] truncate">
                          {sug.label}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] shrink-0 capitalize">
                          {sug.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 1. Filter Kategori */}
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] mb-2">
                Kategori Buku
              </p>
              <div className="space-y-1.5" role="group" aria-label="Filter kategori buku">
                <button
                  type="button"
                  aria-pressed={filters.kategori === 'Semua'}
                  onClick={() => onUpdateFilters({ kategori: 'Semua' })}
                  className={`w-full flex items-center justify-between px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filters.kategori === 'Semua'
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span className="tabular-nums opacity-85">
                    {categoryCounts['Semua']}
                  </span>
                </button>

                {ALL_CATEGORIES.map((category) => {
                  const color = CATEGORY_COLOR_MAP[category];
                  const isActive = filters.kategori === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => onUpdateFilters({ kategori: category })}
                      className={`w-full flex items-center justify-between px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isActive
                          ? highContrast
                            ? 'bg-[#FACC15] text-black border-[#FACC15]'
                            : 'text-white border-transparent'
                          : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-subtle)]'
                      }`}
                      style={
                        isActive && !highContrast
                          ? { backgroundColor: color.hex }
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{
                            backgroundColor: isActive
                              ? highContrast
                                ? '#000000'
                                : '#FFFFFF'
                              : highContrast
                              ? '#FACC15'
                              : color.hex,
                          }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{category}</span>
                      </span>
                      <span className="tabular-nums shrink-0 opacity-90">
                        {categoryCounts[category]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Filter Tahun Terbit */}
            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
              <div className="flex items-center gap-1.5">
                <Calendar
                  className="w-3.5 h-3.5 text-[var(--text-secondary)]"
                  aria-hidden="true"
                />
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Tahun Terbit
                </p>
              </div>

              {/* Rentang Tahun */}
              <div
                className="grid grid-cols-2 gap-1.5"
                role="group"
                aria-label="Filter rentang tahun terbit"
              >
                {YEAR_RANGES.map((range) => {
                  const active = filters.rentangTahun === range.value;
                  return (
                    <button
                      key={range.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        onUpdateFilters({
                          rentangTahun: range.value,
                          tahunSpesifik: 'Semua',
                        })
                      }
                      className={`px-2.5 py-2 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors text-left cursor-pointer ${
                        active
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] border-[var(--accent-primary)]'
                          : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-subtle)]'
                      } ${range.value === 'semua' ? 'col-span-2' : ''}`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>

              {/* Tahun Spesifik */}
              <div>
                <label
                  htmlFor="specific-year-select"
                  className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1"
                >
                  Atau pilih tahun spesifik:
                </label>
                <select
                  id="specific-year-select"
                  value={filters.tahunSpesifik}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateFilters({
                      tahunSpesifik: val === 'Semua' ? 'Semua' : Number(val),
                      rentangTahun: 'semua',
                    });
                  }}
                  className="w-full px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] tabular-nums"
                >
                  <option value="Semua">Semua Tahun Terbit</option>
                  {ALL_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Filter Penulis */}
            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2.5">
              <div className="flex items-center gap-1.5">
                <User
                  className="w-3.5 h-3.5 text-[var(--text-secondary)]"
                  aria-hidden="true"
                />
                <label
                  htmlFor="author-filter-select"
                  className="text-xs font-bold text-[var(--text-primary)]"
                >
                  Filter Penulis
                </label>
              </div>

              <select
                id="author-filter-select"
                value={filters.penulis}
                onChange={(e) => onUpdateFilters({ penulis: e.target.value })}
                className="w-full px-3 py-2 min-h-[42px] rounded-lg text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)]"
              >
                <option value="Semua">
                  Semua Penulis ({ALL_AUTHORS.length})
                </option>
                {ALL_AUTHORS.map((author) => (
                  <option key={author} value={author}>
                    {author} ({authorCounts[author]})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Availability Filter */}
            <div className="pt-4 border-t border-[var(--border-hairline)]">
              <label className="flex items-center gap-3 cursor-pointer min-h-[40px]">
                <input
                  type="checkbox"
                  checked={filters.hanyaTersedia}
                  onChange={(e) =>
                    onUpdateFilters({ hanyaTersedia: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--accent-primary)]"
                />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Hanya tampilkan yang tersedia untuk dipinjam
                </span>
              </label>
            </div>
          </aside>

          {/* RIGHT: Results Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Live Results Status & Active Filters Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                Menampilkan{' '}
                <span className="tabular-nums font-extrabold">
                  {results.length}
                </span>{' '}
                dari{' '}
                <span className="tabular-nums">{allBooks.length}</span> buku
                {filters.query.trim() ? ` untuk "${filters.query.trim()}"` : ''}
              </p>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {filters.kategori !== 'Semua' && (
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ kategori: 'Semua' })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <span>Kategori: {filters.kategori}</span>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {filters.penulis !== 'Semua' && (
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ penulis: 'Semua' })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <span>Penulis: {filters.penulis}</span>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {(filters.rentangTahun !== 'semua' ||
                    filters.tahunSpesifik !== 'Semua') && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFilters({
                          rentangTahun: 'semua',
                          tahunSpesifik: 'Semua',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <span>
                        Tahun:{' '}
                        {filters.tahunSpesifik !== 'Semua'
                          ? filters.tahunSpesifik
                          : filters.rentangTahun}
                      </span>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Smart Search Did You Mean Suggestion */}
            {didYouMean && (
              <div className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  Tidak ada hasil persis untuk &ldquo;{filters.query}&rdquo;.
                  Apakah maksud Anda{' '}
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ query: didYouMean })}
                    className="font-bold text-[var(--accent-primary)] underline cursor-pointer"
                  >
                    {didYouMean}
                  </button>
                  ?
                </p>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-10 text-center">
                <BookOpen
                  className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Buku tidak ditemukan dengan filter saat ini
                </h3>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                  Coba gunakan kata kunci yang lebih umum atau atur ulang filter kategori, tahun terbit, dan penulis.
                </p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            ) : (
              /* 3-Column Book Catalog Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map(({ book, matchReasons }) => {
                  const catColor = CATEGORY_COLOR_MAP[book.kategori];
                  const isBorrowed = borrowedBookIds.includes(book.id);
                  const isWaitlisted = waitlistBookIds.includes(book.id);
                  const isAvailable = book.tersedia > 0;

                  const srCardSummary = `${book.judul}, oleh ${book.penulis}, kategori ${book.kategori}, terbit tahun ${book.tahunTerbit}. ${
                    isBorrowed
                      ? 'Sedang Anda pinjam.'
                      : isAvailable
                      ? `Tersedia ${book.tersedia} dari ${book.totalEksemplar} eksemplar.`
                      : 'Stok habis, tersedia antrean.'
                  }`;

                  return (
                    <article
                      key={book.id}
                      className="flex flex-col rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      {/* Top Color Accent Hairline Strip */}
                      <div
                        className="h-1 w-full rounded-full mb-3.5"
                        style={{
                          backgroundColor: highContrast
                            ? '#FACC15'
                            : catColor.hex,
                        }}
                        aria-hidden="true"
                      />

                      {/* Clickable Cover */}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(book)}
                        onFocus={() => onSpeakText(srCardSummary)}
                        aria-label={`Lihat detail buku ${book.judul}`}
                        className="block w-full text-left cursor-pointer rounded-lg"
                      >
                        <BookCover book={book} highContrast={highContrast} />
                      </button>

                      {/* Clean Unboxed Metadata (Zero-Pill Rule) */}
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] flex-wrap">
                        <span
                          className="font-bold"
                          style={{
                            color: highContrast ? '#FDE047' : catColor.textHex,
                          }}
                        >
                          {book.kategori}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{book.tahunTerbit}</span>
                        <span aria-hidden="true">·</span>
                        <span>{book.format}</span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-1.5 text-base font-bold text-[var(--text-primary)] leading-snug">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(book)}
                          className="text-left hover:underline cursor-pointer"
                        >
                          {book.judul}
                        </button>
                      </h3>

                      {/* Clickable Author Filter Link */}
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFilters({ penulis: book.penulis })
                          }
                          title={`Saring buku karya ${book.penulis}`}
                          className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:underline cursor-pointer"
                        >
                          {book.penulis}
                        </button>
                      </div>

                      {/* Smart Search Match Reason */}
                      {matchReasons.length > 0 && (
                        <p className="mt-2 text-[11px] font-medium text-[var(--accent-primary)]">
                          Cocok pada: {matchReasons.join(' · ')}
                        </p>
                      )}

                      {/* Availability Status (Icon + Text, never color alone) */}
                      <div className="mt-auto pt-4">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)] text-xs font-semibold">
                          {isBorrowed ? (
                            <span className="inline-flex items-center gap-1.5 text-[#059669]">
                              <CheckCircle2
                                className="w-4 h-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span>Sedang Anda Pinjam</span>
                            </span>
                          ) : isAvailable ? (
                            <span
                              className={`inline-flex items-center gap-1.5 ${
                                highContrast
                                  ? 'text-[#38BDF8]'
                                  : 'text-[#059669]'
                              }`}
                            >
                              <CheckCircle2
                                className="w-4 h-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="tabular-nums">
                                Tersedia ({book.tersedia}/{book.totalEksemplar})
                              </span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 ${
                                highContrast
                                  ? 'text-[#FACC15]'
                                  : 'text-[#B45309]'
                              }`}
                            >
                              <Clock
                                className="w-4 h-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span>Semua Dipinjam (Antre)</span>
                            </span>
                          )}

                          <span className="font-mono-tabular text-[11px] text-[var(--text-muted)]">
                            {book.halaman} hlm
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(book)}
                            className="flex-1 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Detail
                          </button>

                          {isBorrowed ? (
                            <button
                              type="button"
                              onClick={() => onOpenDetail(book)}
                              className="flex-1 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold bg-[#059669] text-white hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                            >
                              Baca Buku
                            </button>
                          ) : isAvailable ? (
                            <button
                              type="button"
                              onClick={() => onQuickBorrow(book)}
                              className="flex-1 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Pinjam Buku
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleWaitlist(book)}
                              className={`flex-1 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                                isWaitlisted
                                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-strong)]'
                                  : 'bg-[#D97706] text-white border-[#D97706]'
                              }`}
                            >
                              {isWaitlisted ? 'Dalam Antrean' : 'Ikut Antrean'}
                            </button>
                          )}

                          {screenReaderMode && (
                            <button
                              type="button"
                              onClick={() =>
                                onSpeakText(
                                  `${srCardSummary} Sinopsis: ${book.sinopsis}`
                                )
                              }
                              aria-label={`Bacakan ringkasan buku ${book.judul}`}
                              title="Bacakan ringkasan buku"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] shrink-0 cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
