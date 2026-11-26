import React, { useEffect, useState } from 'react';
import {
  Check,
  Minus,
  Plus,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { Book } from '../types/library';

interface ReaderModalProps {
  book: Book | null;
  highContrast: boolean;
  isSpeaking: boolean;
  isBorrowed: boolean;
  onClose: () => void;
  onSpeakText: (text: string) => void;
  onStopSpeech: () => void;
  onMarkFinished?: (bookId: string) => void;
}

type ReaderTheme = 'kertas' | 'sepia' | 'gelap' | 'kontras';

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  highContrast,
  isSpeaking,
  isBorrowed,
  onClose,
  onSpeakText,
  onStopSpeech,
  onMarkFinished,
}) => {
  const [theme, setTheme] = useState<ReaderTheme>(
    highContrast ? 'kontras' : 'kertas'
  );
  const [fontSizePx, setFontSizePx] = useState<number>(18);

  useEffect(() => {
    if (highContrast) setTheme('kontras');
  }, [highContrast]);

  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book, onClose]);

  if (!book) return null;

  const themeClasses: Record<ReaderTheme, string> = {
    kertas: 'bg-[#FFFFFF] text-[#111827] border-[#E5E7EB]',
    sepia: 'bg-[#F7F1E3] text-[#2C221E] border-[#E2D6BE]',
    gelap: 'bg-[#18181B] text-[#F4F4F5] border-[#3F3F46]',
    kontras: 'bg-[#000000] text-[#FFFFFF] border-[#FACC15]',
  };

  const fullChapterText = `${book.judul}, ${book.kutipanBab.judulBab}. ${book.kutipanBab.paragraf.join(' ')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-3xl max-h-[92vh] rounded-2xl border-2 flex flex-col overflow-hidden shadow-2xl ${themeClasses[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Reader Controls Toolbar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-current/15 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold opacity-75 truncate">
              {book.penulis} · Pembaca Digital
            </p>
            <h2
              id="reader-title"
              className="text-sm sm:text-base font-bold truncate"
            >
              {book.judul}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Voice Read Aloud */}
            {isSpeaking ? (
              <button
                type="button"
                onClick={onStopSpeech}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold bg-[#DC2626] text-white cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hentikan Suara</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSpeakText(fullChapterText)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold bg-[#2563EB] text-white cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bacakan Teks</span>
              </button>
            )}

            {/* Font size steppers */}
            <div className="inline-flex items-center rounded-lg border border-current/25">
              <button
                type="button"
                aria-label="Perkecil ukuran huruf pembaca"
                onClick={() => setFontSizePx((s) => Math.max(14, s - 2))}
                className="p-2 hover:bg-current/10 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="px-2 text-xs font-bold tabular-nums">
                {fontSizePx}px
              </span>
              <button
                type="button"
                aria-label="Perbesar ukuran huruf pembaca"
                onClick={() => setFontSizePx((s) => Math.min(28, s + 2))}
                className="p-2 hover:bg-current/10 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Theme Switcher */}
            <div
              role="group"
              aria-label="Tema warna pembaca"
              className="inline-flex items-center gap-1"
            >
              {(
                [
                  { id: 'kertas', label: 'Terang' },
                  { id: 'sepia', label: 'Sepia' },
                  { id: 'gelap', label: 'Gelap' },
                  { id: 'kontras', label: 'Kontras' },
                ] as { id: ReaderTheme; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={theme === t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border cursor-pointer ${
                    theme === t.id
                      ? 'border-current bg-current/15 font-bold'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pembaca buku digital"
              className="p-2 rounded-lg border border-current/25 hover:bg-current/10 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Reading Canvas (65ch optimal editorial column) */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8">
          <div className="max-w-[65ch] mx-auto font-serif-reading">
            <p className="text-xs font-sans font-bold uppercase tracking-widest opacity-70 mb-2">
              {book.kategori} · {book.tahunTerbit}
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              {book.kutipanBab.judulBab}
            </h3>

            <div className="space-y-5" style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}>
              {book.kutipanBab.paragraf.map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            {isBorrowed && onMarkFinished && (
              <div className="mt-10 pt-6 border-t border-current/20 flex items-center justify-between gap-4 font-sans">
                <p className="text-xs opacity-80">
                  Selesai membaca bab cuplikan ini? Perbarui progres Anda.
                </p>
                <button
                  type="button"
                  onClick={() => onMarkFinished(book.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg text-xs font-bold bg-[#059669] text-white cursor-pointer"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Tandai Progres 100%</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
