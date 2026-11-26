import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  History,
  Trash2,
  X,
} from 'lucide-react';
import {
  Book,
  LoanHistoryRecord,
  LoanRecord,
} from '../types/library';
import { BookCover } from './BookCover';

interface LoanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  loans: LoanRecord[];
  waitlistIds: string[];
  bookmarkIds: string[];
  history: LoanHistoryRecord[];
  highContrast: boolean;
  onReturnBook: (bookId: string) => void;
  onRenewLoan: (bookId: string) => void;
  onUpdateProgress: (bookId: string, progress: number) => void;
  onOpenReader: (book: Book) => void;
  onOpenDetail: (book: Book) => void;
  onRemoveBookmark: (bookId: string) => void;
  onRemoveWaitlist: (book: Book) => void;
}

export const LoanDrawer: React.FC<LoanDrawerProps> = ({
  isOpen,
  onClose,
  books,
  loans,
  waitlistIds,
  bookmarkIds,
  history,
  highContrast,
  onReturnBook,
  onRenewLoan,
  onUpdateProgress,
  onOpenReader,
  onOpenDetail,
  onRemoveBookmark,
  onRemoveWaitlist,
}) => {
  const [activeTab, setActiveTab] = useState<'aktif' | 'simpan' | 'riwayat'>(
    'aktif'
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const findBook = (id: string) => books.find((b) => b.id === id);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Rak Pinjaman dan Riwayat Baca"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-[var(--bg-surface)] text-[var(--text-primary)] border-l border-[var(--border-hairline)] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[var(--border-hairline)] flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
              Rak Pinjaman Saya
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Kelola buku yang sedang dipinjam, antrean, dan riwayat baca.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Rak Pinjaman"
            className="w-10 h-10 rounded-lg border border-[var(--border-hairline)] flex items-center justify-center hover:bg-[var(--bg-subtle)] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Kategori rak peminjaman"
          className="px-6 py-3 border-b border-[var(--border-hairline)] grid grid-cols-3 gap-2 bg-[var(--bg-canvas)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'aktif'}
            onClick={() => setActiveTab('aktif')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'aktif'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            Aktif ({loans.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simpan'}
            onClick={() => setActiveTab('simpan')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'simpan'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            Simpan ({bookmarkIds.length + waitlistIds.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'riwayat'}
            onClick={() => setActiveTab('riwayat')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            Riwayat ({history.length})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'aktif' && (
            <>
              {loans.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen
                    className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Belum ada buku yang sedang dipinjam
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Pilih buku dari katalog dan klik &ldquo;Pinjam Buku&rdquo; untuk langsung membacanya di sini.
                  </p>
                </div>
              ) : (
                loans.map((loan) => {
                  const book = findBook(loan.bookId);
                  if (!book) return null;
                  const daysLeft = Math.max(
                    0,
                    Math.ceil(
                      (new Date(loan.dueDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  );

                  return (
                    <div
                      key={loan.loanId}
                      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-3"
                    >
                      <div className="flex gap-3.5">
                        <div className="w-16 shrink-0">
                          <BookCover
                            book={book}
                            highContrast={highContrast}
                            compact
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                            {book.judul}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            {book.penulis}
                          </p>
                          <p className="text-xs font-semibold text-[var(--accent-primary)] mt-1 tabular-nums">
                            Sisa {daysLeft} hari · Jatuh tempo{' '}
                            {new Date(loan.dueDate).toLocaleDateString(
                              'id-ID',
                              { day: 'numeric', month: 'short' }
                            )}
                          </p>
                          {loan.note && (
                            <p className="mt-1 text-[11px] italic text-[var(--text-secondary)]">
                              Catatan: {loan.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reading Progress */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          <span>Progres Baca</span>
                          <span className="tabular-nums">
                            {loan.progressPercent}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          value={loan.progressPercent}
                          aria-label={`Atur progres baca untuk ${book.judul}`}
                          onChange={(e) =>
                            onUpdateProgress(book.id, Number(e.target.value))
                          }
                          className="w-full accent-[var(--accent-primary)] cursor-pointer"
                        />
                      </div>

                      {/* Loan Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenReader(book)}
                          className="flex-1 px-3 py-2 min-h-[38px] rounded-lg text-xs font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] whitespace-nowrap cursor-pointer"
                        >
                          Baca Sekarang
                        </button>
                        {loan.renewedCount < 1 && (
                          <button
                            type="button"
                            onClick={() => onRenewLoan(book.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] whitespace-nowrap cursor-pointer"
                          >
                            <CalendarPlus
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            <span>+7 Hari</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onReturnBook(book.id)}
                          className="px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] whitespace-nowrap cursor-pointer"
                        >
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'simpan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Antrean Reservasi ({waitlistIds.length})
                </h3>
                {waitlistIds.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    Belum ada buku dalam daftar antrean.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {waitlistIds.map((id) => {
                      const book = findBook(id);
                      if (!book) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {book.judul}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {book.penulis}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveWaitlist(book)}
                            aria-label={`Batalkan antrean ${book.judul}`}
                            className="p-2 rounded-lg border border-[var(--border-hairline)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Daftar Baca Tersimpan ({bookmarkIds.length})
                </h3>
                {bookmarkIds.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    Belum ada buku yang disimpan.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {bookmarkIds.map((id) => {
                      const book = findBook(id);
                      if (!book) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenDetail(book)}
                            className="text-left min-w-0 flex-1 cursor-pointer"
                          >
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate hover:underline">
                              {book.judul}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {book.penulis} · {book.tahunTerbit}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveBookmark(id)}
                            aria-label={`Hapus ${book.judul} dari daftar simpan`}
                            className="p-2 rounded-lg border border-[var(--border-hairline)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <>
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <History
                    className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Belum ada riwayat pengembalian
                  </p>
                </div>
              ) : (
                history.map((item) => {
                  const book = findBook(item.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={item.loanId}
                      className="p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
                          <CheckCircle2
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                          <span>Dikembalikan</span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 truncate">
                          {book.judul}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                          {new Date(item.returnedAt).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(book)}
                        className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] shrink-0 cursor-pointer"
                      >
                        Pinjam Lagi
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
