import React, { useState } from 'react';
import { BookMarked, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeLoanCount: number;
  onOpenLoanDrawer: () => void;
  onNavigate: (sectionId: string) => void;
  onSpeakFocus?: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeLoanCount,
  onOpenLoanDrawer,
  onNavigate,
  onSpeakFocus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'katalog', label: 'Katalog' },
    { id: 'aksesibilitas', label: 'Aksesibilitas' },
    { id: 'tentang', label: 'Panduan' },
  ];

  const handleLinkClick = (id: string, label: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
    onSpeakFocus?.(`Menuju bagian ${label}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-sm">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4 single-line links) - Zone 3 (1 Primary CTA) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('beranda', 'Beranda');
          }}
          onFocus={() => onSpeakFocus?.('Pustaka Warna, Beranda Perpustakaan Digital')}
          className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          Pustaka Warna
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--text-secondary)]"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id, item.label);
              }}
              onFocus={() => onSpeakFocus?.(`Tautan navigasi ${item.label}`)}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenLoanDrawer}
            onFocus={() =>
              onSpeakFocus?.(
                `Buka Rak Pinjaman Saya. Saat ini ada ${activeLoanCount} buku sedang dipinjam.`
              )
            }
            aria-label={`Buka Rak Pinjaman (${activeLoanCount} buku aktif)`}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookMarked className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Rak Pinjaman</span>
            <span className="tabular-nums font-bold">({activeLoanCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id, item.label);
              }}
              className="px-3 py-3 rounded-lg text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
