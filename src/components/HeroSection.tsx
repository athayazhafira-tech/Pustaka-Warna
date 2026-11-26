import React, { useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_COLOR_MAP } from '../data/books';
import { BookCategory } from '../types/library';

interface HeroSectionProps {
  totalBooks: number;
  totalAvailableCopies: number;
  onQuickSearch: (query: string) => void;
  onSelectCategory: (category: BookCategory) => void;
  highContrast: boolean;
  onSpeakFocus?: (text: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalBooks,
  totalAvailableCopies,
  onQuickSearch,
  onSelectCategory,
  highContrast,
  onSpeakFocus,
}) => {
  const [heroQuery, setHeroQuery] = useState('');
  const [heroImgError, setHeroImgError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(heroQuery);
  };

  return (
    <section
      id="beranda"
      aria-labelledby="hero-heading"
      className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* 2-column balanced split hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left column */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div>
              {/* Colorful minimalist spectrum bar */}
              <div className="flex items-center gap-1.5 mb-5" aria-hidden="true">
                <span className="h-1.5 w-10 rounded-sm bg-[#EA580C]" />
                <span className="h-1.5 w-10 rounded-sm bg-[#2563EB]" />
                <span className="h-1.5 w-10 rounded-sm bg-[#D97706]" />
                <span className="h-1.5 w-10 rounded-sm bg-[#E11D48]" />
                <span className="h-1.5 w-10 rounded-sm bg-[#059669]" />
                <span className="h-1.5 w-10 rounded-sm bg-[#4F46E5]" />
              </div>

              <p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] mb-2">
                Perpustakaan Digital Modern &amp; Ramah Aksesibilitas
              </p>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15] text-balance"
              >
                Jelajahi Pengetahuan Penuh Warna untuk Semua Pembaca.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Temukan buku digital pilihan dengan pencarian cerdas, filter kategori, tahun terbit, serta penulis. Pinjam seketika dan baca dengan dukungan pembaca layar serta mode kontras tinggi.
              </p>
            </div>

            {/* Hero Smart Search Bar */}
            <div>
              <form
                onSubmit={handleSubmit}
                role="search"
                aria-label="Pencarian cepat koleksi buku"
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="relative flex-1">
                  <Search
                    className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <label htmlFor="hero-search-input" className="sr-only">
                    Cari judul buku, penulis, tahun terbit, atau topik
                  </label>
                  <input
                    id="hero-search-input"
                    type="search"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onFocus={() =>
                      onSpeakFocus?.(
                        'Kolom pencarian cerdas. Ketik judul, nama penulis, tahun terbit, atau topik seperti AI atau sastra.'
                      )
                    }
                    placeholder="Cari judul, penulis, tahun, atau topik (mis. AI, batik, novel)..."
                    className="w-full pl-11 pr-4 py-3 min-h-[48px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl text-sm font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Cari di Katalog</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* Colorful Quick Category Buttons */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  Telusuri Bidang Warna:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((category) => {
                    const color = CATEGORY_COLOR_MAP[category];
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => onSelectCategory(category)}
                        onFocus={() =>
                          onSpeakFocus?.(`Filter cepat kategori ${category}`)
                        }
                        className={`inline-flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold border transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer ${
                          highContrast
                            ? 'bg-black text-white border-white hover:border-[#FACC15]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{
                            backgroundColor: highContrast ? '#FACC15' : color.hex,
                          }}
                          aria-hidden="true"
                        />
                        <span>{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Architectural Library Visual */}
          <div className="lg:col-span-5 flex">
            <div className="w-full rounded-2xl overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col">
              {!heroImgError ? (
                <img
                  src="/src/assets/images/hero_library_editorial_1795676354176.jpg"
                  alt="Ruang baca perpustakaan modern bercahaya alami dengan rak buku berwarna cerah yang tertata rapi"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full aspect-[4/3] lg:h-full object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] lg:h-full flex flex-col items-center justify-center p-8 bg-[var(--bg-subtle)] text-center">
                  <BookOpen
                    className="w-12 h-12 text-[var(--accent-primary)] mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-base font-bold text-[var(--text-primary)]">
                    Ruang Baca Digital Pustaka Warna
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Koleksi buku digital penuh warna yang dapat diakses kapan saja.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width 4-column summary strip below hero */}
        <div className="mt-8 pt-6 border-t border-[var(--border-hairline)] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              {totalBooks} Judul
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Koleksi digital terkurasi lintas disiplin
            </p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              {totalAvailableCopies} Eksemplar
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Siap dipinjam langsung tanpa antre
            </p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              6 Bidang Warna
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Filter cerdas kategori, tahun, dan penulis
            </p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-primary)]">
              WCAG AAA &amp; Suara
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Kontras tinggi dan pembaca layar terintegrasi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
