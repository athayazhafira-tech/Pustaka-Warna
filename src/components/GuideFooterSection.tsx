import React from 'react';
import { BookCheck, Keyboard, SearchCheck } from 'lucide-react';

interface GuideFooterSectionProps {
  highContrast: boolean;
}

export const GuideFooterSection: React.FC<GuideFooterSectionProps> = ({
  highContrast,
}) => {
  const guideCards = [
    {
      num: '01',
      title: 'Pencarian Cerdas & Filter',
      desc: 'Ketik kata kunci umum atau sinonim (mis. "coding", "finansial", atau "nusantara"). Gunakan menu filter kategori, tahun terbit, dan penulis untuk mempersempit hasil secara instan.',
      accent: highContrast ? '#FACC15' : '#2563EB',
      icon: SearchCheck,
    },
    {
      num: '02',
      title: 'Peminjaman Digital Fleksibel',
      desc: 'Pinjam hingga beberapa judul sekaligus dengan pilihan durasi 7, 14, atau 21 hari. Anda dapat memperpanjang masa pinjam, melacak progres baca, dan mengembalikan kapan saja.',
      accent: highContrast ? '#38BDF8' : '#059669',
      icon: BookCheck,
    },
    {
      num: '03',
      title: 'Pintasan Keyboard & Disabilitas',
      desc: 'Tekan "/" untuk langsung ke pencarian, "Alt + K" untuk mengaktifkan mode kontras tinggi, dan "Alt + P" untuk mengaktifkan pembaca layar suara.',
      accent: highContrast ? '#FFFFFF' : '#E11D48',
      icon: Keyboard,
    },
  ];

  return (
    <>
      <section
        id="tentang"
        aria-labelledby="panduan-heading"
        className="py-12 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2
              id="panduan-heading"
              className="text-2xl font-extrabold text-[var(--text-primary)]"
            >
              Panduan Layanan &amp; Standar Inklusivitas
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Dirancang agar nyaman digunakan oleh pembaca umum maupun penyandang disabilitas visual dan motorik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guideCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.num}
                  className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-6 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono-tabular text-sm font-bold"
                      style={{ color: card.accent }}
                    >
                      {card.num}.
                    </span>
                    <Icon
                      className="w-5 h-5"
                      style={{ color: card.accent }}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            Pustaka Warna · Perpustakaan Digital Terbuka &amp; Inklusif
          </p>
          <p>
            Mendukung standar aksesibilitas WCAG AAA, navigasi keyboard penuh, dan narasi audio bahasa Indonesia.
          </p>
        </div>
      </footer>
    </>
  );
};
