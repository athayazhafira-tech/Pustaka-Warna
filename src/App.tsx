import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { BOOKS_CATALOG } from './data/books';
import {
  AccessibilitySettings,
  Book,
  BookCategory,
  LoanHistoryRecord,
  LoanRecord,
  SearchFilters,
} from './types/library';
import { runSmartSearch } from './utils/smartSearch';
import { useScreenReader } from './hooks/useScreenReader';
import { Header } from './components/Header';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { BookDetailModal } from './components/BookDetailModal';
import { LoanDrawer } from './components/LoanDrawer';
import { ReaderModal } from './components/ReaderModal';
import { GuideFooterSection } from './components/GuideFooterSection';

const STORAGE_KEYS = {
  loans: 'pustaka_warna_loans_v1',
  history: 'pustaka_warna_history_v1',
  bookmarks: 'pustaka_warna_bookmarks_v1',
  waitlist: 'pustaka_warna_waitlist_v1',
  a11y: 'pustaka_warna_a11y_v1',
};

const DEFAULT_A11Y: AccessibilitySettings = {
  highContrast: false,
  screenReaderMode: false,
  speechRate: 1,
  textScale: 'normal',
  dyslexiaFriendly: false,
  reduceMotion: false,
};

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  kategori: 'Semua',
  penulis: 'Semua',
  rentangTahun: 'semua',
  tahunSpesifik: 'Semua',
  hanyaTersedia: false,
  urutan: 'relevansi',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [a11y, setA11y] = useState<AccessibilitySettings>(() =>
    readStorage(STORAGE_KEYS.a11y, DEFAULT_A11Y)
  );
  const [loans, setLoans] = useState<LoanRecord[]>(() =>
    readStorage(STORAGE_KEYS.loans, [
      {
        loanId: 'loan-seed-1',
        bookId: 'bk-01',
        borrowedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 12 * 86400000).toISOString(),
        durationDays: 14,
        renewedCount: 0,
        progressPercent: 30,
        note: 'Bacaan akhir pekan',
      },
    ])
  );
  const [history, setHistory] = useState<LoanHistoryRecord[]>(() =>
    readStorage(STORAGE_KEYS.history, [])
  );
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.bookmarks, ['bk-04'])
  );
  const [waitlistIds, setWaitlistIds] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.waitlist, [])
  );

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [readerBookId, setReaderBookId] = useState<string | null>(null);
  const [loanDrawerOpen, setLoanDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { announcement, isSpeaking, speak, announce, stopSpeech } =
    useScreenReader(a11y.screenReaderMode, a11y.speechRate);

  // Sync accessibility classes onto <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', a11y.highContrast);
    root.classList.toggle('text-scale-lg', a11y.textScale === 'lg');
    root.classList.toggle('text-scale-xl', a11y.textScale === 'xl');
    root.classList.toggle('dyslexia-friendly', a11y.dyslexiaFriendly);
    root.classList.toggle('reduce-motion', a11y.reduceMotion);

    try {
      localStorage.setItem(STORAGE_KEYS.a11y, JSON.stringify(a11y));
    } catch {
      // ignore quota error
    }
  }, [a11y]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.loans, JSON.stringify(loans));
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarkIds));
      localStorage.setItem(STORAGE_KEYS.waitlist, JSON.stringify(waitlistIds));
    } catch {
      // ignore quota error
    }
  }, [loans, history, bookmarkIds, waitlistIds]);

  const showToast = useCallback(
    (msg: string) => {
      setToastMessage(msg);
      announce(msg);
    },
    [announce]
  );

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Compute live book availability adjusted by active loans
  const liveBooks: Book[] = useMemo(() => {
    const loanedCounts: Record<string, number> = {};
    for (const loan of loans) {
      loanedCounts[loan.bookId] = (loanedCounts[loan.bookId] || 0) + 1;
    }
    return BOOKS_CATALOG.map((b) => {
      const activeByUser = loanedCounts[b.id] || 0;
      return {
        ...b,
        tersedia: Math.max(0, b.tersedia - activeByUser),
      };
    });
  }, [loans]);

  const totalAvailableCopies = useMemo(
    () => liveBooks.reduce((sum, b) => sum + b.tersedia, 0),
    [liveBooks]
  );

  const searchOutput = useMemo(
    () => runSmartSearch(liveBooks, filters),
    [liveBooks, filters]
  );

  // Keyboard shortcuts: "/" focuses search, "Alt+K" toggles high contrast, "Alt+P" toggles screen reader
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        const searchEl = document.getElementById('catalog-smart-search');
        searchEl?.focus();
        searchEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        announce('Fokus dipindahkan ke kolom pencarian katalog.');
      } else if (e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setA11y((prev) => {
          const next = !prev.highContrast;
          announce(
            next
              ? 'Mode kontras tinggi diaktifkan.'
              : 'Mode kontras tinggi dimatikan.'
          );
          return { ...prev, highContrast: next };
        });
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setA11y((prev) => {
          const next = !prev.screenReaderMode;
          if (next) {
            speak('Mode pembaca layar suara diaktifkan.', { force: true });
          }
          return { ...prev, screenReaderMode: next };
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [announce, speak]);

  const updateA11y = useCallback(
    (patch: Partial<AccessibilitySettings>) => {
      setA11y((prev) => {
        const next = { ...prev, ...patch };
        if (patch.highContrast !== undefined) {
          announce(
            patch.highContrast
              ? 'Mode kontras tinggi diaktifkan.'
              : 'Mode kontras tinggi dinonaktifkan.'
          );
        }
        if (patch.screenReaderMode !== undefined) {
          if (patch.screenReaderMode) {
            speak(
              'Mode pembaca layar aktif. Arahkan fokus ke tombol atau kartu buku untuk mendengar narasi suara.',
              { force: true }
            );
          } else {
            stopSpeech();
          }
        }
        if (patch.textScale !== undefined) {
          announce(`Ukuran teks diubah ke ${patch.textScale}.`);
        }
        if (patch.dyslexiaFriendly !== undefined) {
          announce(
            patch.dyslexiaFriendly
              ? 'Spasi baca ramah disleksia diaktifkan.'
              : 'Spasi baca ramah disleksia dimatikan.'
          );
        }
        return next;
      });
    },
    [announce, speak, stopSpeech]
  );

  const resetA11y = useCallback(() => {
    setA11y(DEFAULT_A11Y);
    stopSpeech();
    setToastMessage('Pengaturan aksesibilitas dikembalikan ke standar.');
  }, [stopSpeech]);

  const updateFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    announce('Semua filter pencarian telah direset.');
  }, [announce]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleHeroSearch = useCallback(
    (query: string) => {
      setFilters((prev) => ({ ...prev, query }));
      scrollToSection('katalog');
      announce(
        query.trim()
          ? `Mencari buku untuk kata kunci ${query}`
          : 'Menampilkan seluruh katalog buku'
      );
    },
    [announce, scrollToSection]
  );

  const handleHeroCategory = useCallback(
    (category: BookCategory) => {
      setFilters((prev) => ({ ...prev, kategori: category }));
      scrollToSection('katalog');
      announce(`Menampilkan kategori ${category}`);
    },
    [announce, scrollToSection]
  );

  const handleBorrowBook = useCallback(
    (book: Book, durationDays = 14, note?: string) => {
      if (loans.some((l) => l.bookId === book.id)) {
        showToast(`Buku "${book.judul}" sudah ada di Rak Pinjaman Anda.`);
        return;
      }
      if (book.tersedia <= 0) {
        showToast(`Stok "${book.judul}" sedang habis.`);
        return;
      }
      const now = new Date();
      const due = new Date(now.getTime() + durationDays * 86400000);
      const newLoan: LoanRecord = {
        loanId: `loan-${Date.now()}`,
        bookId: book.id,
        borrowedAt: now.toISOString(),
        dueDate: due.toISOString(),
        durationDays,
        renewedCount: 0,
        progressPercent: 0,
        note,
      };
      setLoans((prev) => [newLoan, ...prev]);
      setWaitlistIds((prev) => prev.filter((id) => id !== book.id));
      showToast(
        `Berhasil meminjam "${book.judul}" selama ${durationDays} hari.`
      );
    },
    [loans, showToast]
  );

  const handleReturnBook = useCallback(
    (bookId: string) => {
      const targetBook = liveBooks.find((b) => b.id === bookId);
      const activeLoan = loans.find((l) => l.bookId === bookId);
      if (!activeLoan) return;

      setLoans((prev) => prev.filter((l) => l.bookId !== bookId));
      setHistory((prev) => [
        {
          loanId: activeLoan.loanId,
          bookId,
          borrowedAt: activeLoan.borrowedAt,
          returnedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(
        `Buku "${targetBook?.judul || ''}" berhasil dikembalikan. Terima kasih.`
      );
    },
    [liveBooks, loans, showToast]
  );

  const handleRenewLoan = useCallback(
    (bookId: string) => {
      const targetBook = liveBooks.find((b) => b.id === bookId);
      setLoans((prev) =>
        prev.map((l) => {
          if (l.bookId !== bookId || l.renewedCount >= 1) return l;
          const nextDue = new Date(
            new Date(l.dueDate).getTime() + 7 * 86400000
          );
          return {
            ...l,
            dueDate: nextDue.toISOString(),
            durationDays: l.durationDays + 7,
            renewedCount: l.renewedCount + 1,
          };
        })
      );
      showToast(
        `Masa pinjam "${targetBook?.judul || ''}" diperpanjang 7 hari.`
      );
    },
    [liveBooks, showToast]
  );

  const handleUpdateProgress = useCallback(
    (bookId: string, progress: number) => {
      setLoans((prev) =>
        prev.map((l) =>
          l.bookId === bookId ? { ...l, progressPercent: progress } : l
        )
      );
    },
    []
  );

  const handleToggleWaitlist = useCallback(
    (book: Book) => {
      setWaitlistIds((prev) => {
        const exists = prev.includes(book.id);
        const next = exists
          ? prev.filter((id) => id !== book.id)
          : [...prev, book.id];
        showToast(
          exists
            ? `Dikeluarkan dari antrean "${book.judul}".`
            : `Berhasil masuk daftar antrean "${book.judul}".`
        );
        return next;
      });
    },
    [showToast]
  );

  const handleToggleBookmark = useCallback(
    (bookId: string) => {
      const book = liveBooks.find((b) => b.id === bookId);
      setBookmarkIds((prev) => {
        const exists = prev.includes(bookId);
        const next = exists
          ? prev.filter((id) => id !== bookId)
          : [...prev, bookId];
        showToast(
          exists
            ? `Dihapus dari daftar simpan: "${book?.judul || ''}".`
            : `Disimpan ke daftar baca: "${book?.judul || ''}".`
        );
        return next;
      });
    },
    [liveBooks, showToast]
  );

  const selectedBook = useMemo(
    () => liveBooks.find((b) => b.id === selectedBookId) || null,
    [liveBooks, selectedBookId]
  );

  const readerBook = useMemo(
    () => liveBooks.find((b) => b.id === readerBookId) || null,
    [liveBooks, readerBookId]
  );

  const borrowedBookIds = useMemo(() => loans.map((l) => l.bookId), [loans]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Skip to main content link for keyboard and screen reader users */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-[var(--accent-primary)] focus:text-[var(--accent-primary-ink)] focus:font-bold"
      >
        Lewati ke konten utama
      </a>

      {/* ARIA Live Region for assistive screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      <Header
        activeLoanCount={loans.length}
        onOpenLoanDrawer={() => setLoanDrawerOpen(true)}
        onNavigate={scrollToSection}
        onSpeakFocus={(txt) => a11y.screenReaderMode && speak(txt)}
      />

      <AccessibilityToolbar
        settings={a11y}
        onUpdate={updateA11y}
        onReset={resetA11y}
        announcement={announcement}
        isSpeaking={isSpeaking}
        onStopSpeech={stopSpeech}
        onReadSummary={() =>
          speak(
            `Anda berada di perpustakaan digital Pustaka Warna. Tersedia ${liveBooks.length} judul buku dalam 6 kategori warna, dengan ${totalAvailableCopies} eksemplar siap dipinjam. Saat ini Anda sedang meminjam ${loans.length} buku, dan hasil pencarian menampilkan ${searchOutput.results.length} buku.`,
            { force: true }
          )
        }
      />

      <main id="konten-utama" className="flex-1">
        <HeroSection
          totalBooks={liveBooks.length}
          totalAvailableCopies={totalAvailableCopies}
          onQuickSearch={handleHeroSearch}
          onSelectCategory={handleHeroCategory}
          highContrast={a11y.highContrast}
          onSpeakFocus={(txt) => a11y.screenReaderMode && speak(txt)}
        />

        <CatalogSection
          allBooks={liveBooks}
          searchOutput={searchOutput}
          filters={filters}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
          borrowedBookIds={borrowedBookIds}
          waitlistBookIds={waitlistIds}
          highContrast={a11y.highContrast}
          screenReaderMode={a11y.screenReaderMode}
          onOpenDetail={(book) => setSelectedBookId(book.id)}
          onQuickBorrow={(book) => handleBorrowBook(book, 14)}
          onToggleWaitlist={handleToggleWaitlist}
          onSpeakText={(txt) => speak(txt, { force: true })}
        />

        <GuideFooterSection highContrast={a11y.highContrast} />
      </main>

      {/* Modals & Drawers */}
      <BookDetailModal
        book={selectedBook}
        loan={loans.find((l) => l.bookId === selectedBook?.id)}
        isBookmarked={
          selectedBook ? bookmarkIds.includes(selectedBook.id) : false
        }
        isWaitlisted={
          selectedBook ? waitlistIds.includes(selectedBook.id) : false
        }
        highContrast={a11y.highContrast}
        onClose={() => setSelectedBookId(null)}
        onBorrow={handleBorrowBook}
        onReturn={handleReturnBook}
        onToggleBookmark={handleToggleBookmark}
        onToggleWaitlist={handleToggleWaitlist}
        onOpenReader={(b) => {
          setSelectedBookId(null);
          setReaderBookId(b.id);
        }}
        onSpeakText={(txt) => speak(txt, { force: true })}
      />

      <LoanDrawer
        isOpen={loanDrawerOpen}
        onClose={() => setLoanDrawerOpen(false)}
        books={liveBooks}
        loans={loans}
        waitlistIds={waitlistIds}
        bookmarkIds={bookmarkIds}
        history={history}
        highContrast={a11y.highContrast}
        onReturnBook={handleReturnBook}
        onRenewLoan={handleRenewLoan}
        onUpdateProgress={handleUpdateProgress}
        onOpenReader={(b) => {
          setLoanDrawerOpen(false);
          setReaderBookId(b.id);
        }}
        onOpenDetail={(b) => {
          setLoanDrawerOpen(false);
          setSelectedBookId(b.id);
        }}
        onRemoveBookmark={handleToggleBookmark}
        onRemoveWaitlist={handleToggleWaitlist}
      />

      <ReaderModal
        book={readerBook}
        highContrast={a11y.highContrast}
        isSpeaking={isSpeaking}
        isBorrowed={
          readerBook ? borrowedBookIds.includes(readerBook.id) : false
        }
        onClose={() => {
          stopSpeech();
          setReaderBookId(null);
        }}
        onSpeakText={(txt) => speak(txt, { force: true })}
        onStopSpeech={stopSpeech}
        onMarkFinished={(id) => {
          handleUpdateProgress(id, 100);
          showToast('Progres baca diperbarui menjadi 100%.');
        }}
      />

      {/* Non-intrusive Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xl px-4 py-3 flex items-center gap-3"
        >
          <CheckCircle2
            className="w-5 h-5 text-[#059669] shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm font-semibold flex-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
            className="p-1 rounded hover:bg-[var(--bg-subtle)] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
