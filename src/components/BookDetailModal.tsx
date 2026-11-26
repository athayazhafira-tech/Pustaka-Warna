import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Volume2,
  X,
} from 'lucide-react';
import { CATEGORY_COLOR_MAP } from '../data/books';
import { Book, LoanRecord } from '../types/library';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: Book | null;
  loan: LoanRecord | undefined;
  isBookmarked: boolean;
  isWaitlisted: boolean;
  highContrast: boolean;
  onClose: () => void;
  onBorrow: (book: Book, durationDays: number, note?: string) => void;
  onReturn: (bookId: string) => void;
  onToggleBookmark: (bookId: string) => void;
  onToggleWaitlist: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onSpeakText: (text: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  loan,
  isBookmarked,
  isWaitlisted,
  highContrast,
  onClose,
  onBorrow,
  onReturn,
  onToggleBookmark,
  onToggleWaitlist,
  onOpenReader,
  onSpeakText,
}) => {
  const [durationDays, setDurationDays] = useState<number>(14);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (!book) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, onClose]);

  if (!book) return null;

  const catColor = CATEGORY_COLOR_MAP[book.kategori];
  const isAvailable = book.tersedia > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-book-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colorful category ribbon */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: highContrast ? '#FACC15' : catColor.hex }}
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <span
              style={{ color: highContrast ? '#FDE047' : catColor.textHex }}
              className="font-bold"
            >
              {book.kategori}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{book.kodePanggil}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onSpeakText(
                  `${book.judul}, ${book.subjudul}. Ditulis oleh ${book.penulis}, terbit tahun ${book.tahunTerbit}. Sinopsis: ${book.sinopsis}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bacakan Info</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(book.id)}
              aria-pressed={isBookmarked}
              aria-label={
                isBookmarked ? 'Hapus dari daftar simpan' : 'Simpan buku'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border cursor-pointer ${
                isBookmarked
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela detail buku"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[82vh] overflow-y-auto">
          {/* Cover Column */}
          <div className="md:col-span-4 space-y-4">
            <BookCover book={book} highContrast={highContrast} compact />

            <button
              type="button"
              onClick={() => onOpenReader(book)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold border border-[var(--border-strong)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Baca Cuplikan Bab 1</span>
            </button>
          </div>

          {/* Information & Borrowing Column */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h2
                id="detail-book-title"
                className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-tight"
              >
                {book.judul}
              </h2>
              <p className="mt-1 text-base text-[var(--text-secondary)]">
                {book.subjudul}
              </p>
              <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                Penulis: {book.penulis}
              </p>
            </div>

            {/* Sinopsis */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Sinopsis
              </h3>
              <p className="font-serif-reading text-base text-[var(--text-primary)] leading-relaxed">
                {book.sinopsis}
              </p>
            </div>

            {/* Bibliographic Metadata Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-[var(--border-hairline)] text-xs">
              <div>
                <dt className="text-[var(--text-secondary)]">Tahun Terbit</dt>
                <dd className="mt-0.5 font-bold tabular-nums text-[var(--text-primary)]">
                  {book.tahunTerbit}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Penerbit</dt>
                <dd className="mt-0.5 font-bold text-[var(--text-primary)]">
                  {book.penerbit}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Halaman</dt>
                <dd className="mt-0.5 font-bold tabular-nums text-[var(--text-primary)]">
                  {book.halaman} halaman
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Format</dt>
                <dd className="mt-0.5 font-bold text-[var(--text-primary)]">
                  {book.format}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Bahasa</dt>
                <dd className="mt-0.5 font-bold text-[var(--text-primary)]">
                  {book.bahasa}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">ISBN</dt>
                <dd className="mt-0.5 font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {book.isbn}
                </dd>
              </div>
            </dl>

            {/* Contiguous Borrowing Module */}
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-4">
              {loan ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Sedang Dipinjam</span>
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                      Jatuh tempo:{' '}
                      {new Date(loan.dueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenReader(book)}
                      className="flex-1 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] cursor-pointer"
                    >
                      Buka Pembaca Digital
                    </button>
                    <button
                      type="button"
                      onClick={() => onReturn(book.id)}
                      className="px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      Kembalikan Buku
                    </button>
                  </div>
                </div>
              ) : isAvailable ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span className="tabular-nums">
                        Tersedia {book.tersedia} dari {book.totalEksemplar}{' '}
                        eksemplar
                      </span>
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-2">
                      Pilih Durasi Peminjaman:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 14, 21].map((days) => (
                        <button
                          key={days}
                          type="button"
                          aria-pressed={durationDays === days}
                          onClick={() => setDurationDays(days)}
                          className={`py-2 min-h-[40px] rounded-lg text-xs font-bold border transition-colors tabular-nums cursor-pointer ${
                            durationDays === days
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] border-[var(--accent-primary)]'
                              : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                          }`}
                        >
                          {days} Hari
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="borrow-note-input"
                      className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
                    >
                      Catatan baca pribadi (opsional)
                    </label>
                    <input
                      id="borrow-note-input"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Mis. Bahan referensi tugas atau bacaan akhir pekan"
                      className="w-full px-3 py-2 min-h-[40px] rounded-lg text-xs border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onBorrow(book, durationDays, note.trim() || undefined);
                      setNote('');
                    }}
                    className="w-full py-3 min-h-[46px] rounded-xl text-sm font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
                  >
                    Pinjam Buku Sekarang ({durationDays} Hari)
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#D97706]">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>Semua eksemplar sedang dipinjam</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Masuk ke daftar antrean agar Anda otomatis mendapat prioritas saat buku dikembalikan.
                  </p>
                  <button
                    type="button"
                    onClick={() => onToggleWaitlist(book)}
                    className="w-full py-2.5 min-h-[44px] rounded-xl text-sm font-bold bg-[#D97706] text-white hover:opacity-90 cursor-pointer"
                  >
                    {isWaitlisted
                      ? 'Keluar dari Antrean'
                      : 'Masuk Daftar Antrean'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
