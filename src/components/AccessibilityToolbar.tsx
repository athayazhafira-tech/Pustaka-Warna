import React from 'react';
import {
  Contrast,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Sparkles,
  RotateCcw,
  Square,
  Play,
} from 'lucide-react';
import { AccessibilitySettings, TextScale } from '../types/library';

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onUpdate: (patch: Partial<AccessibilitySettings>) => void;
  onReset: () => void;
  announcement: string;
  isSpeaking: boolean;
  onReadSummary: () => void;
  onStopSpeech: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  settings,
  onUpdate,
  onReset,
  announcement,
  isSpeaking,
  onReadSummary,
  onStopSpeech,
}) => {
  const textScales: { value: TextScale; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'lg', label: 'Besar' },
    { value: 'xl', label: 'Ekstra' },
  ];

  return (
    <section
      id="aksesibilitas"
      aria-labelledby="judul-aksesibilitas"
      className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title & quick description */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--accent-primary)]"
              aria-hidden="true"
            >
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="judul-aksesibilitas"
                className="text-sm font-bold text-[var(--text-primary)]"
              >
                Pusat Aksesibilitas Inklusif
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Sesuaikan tampilan kontras tinggi, narasi pembaca layar suara, ukuran huruf, dan spasi baca.
              </p>
            </div>
          </div>

          {/* Interactive Accessibility Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* High Contrast Toggle */}
            <button
              type="button"
              aria-pressed={settings.highContrast}
              onClick={() => onUpdate({ highContrast: !settings.highContrast })}
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.highContrast
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
              }`}
            >
              <Contrast className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Kontras Tinggi: {settings.highContrast ? 'Aktif' : 'Mati'}</span>
            </button>

            {/* Screen Reader Mode Toggle */}
            <button
              type="button"
              aria-pressed={settings.screenReaderMode}
              onClick={() =>
                onUpdate({ screenReaderMode: !settings.screenReaderMode })
              }
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.screenReaderMode
                  ? 'bg-[#059669] text-white border-[#059669]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
              }`}
            >
              {settings.screenReaderMode ? (
                <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                Pembaca Layar: {settings.screenReaderMode ? 'Aktif' : 'Mati'}
              </span>
            </button>

            {/* Text Scale Segmented Control */}
            <div
              role="group"
              aria-label="Ukuran huruf"
              className="inline-flex items-center p-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)]"
            >
              <span className="px-2 text-xs font-medium text-[var(--text-secondary)] inline-flex items-center gap-1 whitespace-nowrap">
                <Type className="w-3.5 h-3.5" aria-hidden="true" />
                Teks
              </span>
              {textScales.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={settings.textScale === item.value}
                  onClick={() => onUpdate({ textScale: item.value })}
                  className={`px-2.5 py-1.5 min-h-[32px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    settings.textScale === item.value
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Dyslexia Friendly Spacing */}
            <button
              type="button"
              aria-pressed={settings.dyslexiaFriendly}
              onClick={() =>
                onUpdate({ dyslexiaFriendly: !settings.dyslexiaFriendly })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.dyslexiaFriendly
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
              }`}
            >
              <span>Spasi Disleksia</span>
            </button>

            {/* Reduced Motion */}
            <button
              type="button"
              aria-pressed={settings.reduceMotion}
              onClick={() => onUpdate({ reduceMotion: !settings.reduceMotion })}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.reduceMotion
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Kurangi Gerak</span>
            </button>

            {/* Reset Accessibility */}
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset semua pengaturan aksesibilitas ke standar"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Screen Reader Control Strip (shown when Screen Reader Mode is enabled) */}
        {settings.screenReaderMode && (
          <div
            role="region"
            aria-label="Panel aktif pembaca layar suara"
            className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap shrink-0">
                Narasi Aktif:
              </span>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {announcement ||
                  'Arahkan kursor atau tombol Tab ke elemen mana pun untuk mendengarkan deskripsi audio.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <label
                htmlFor="speech-rate-select"
                className="text-xs font-medium text-[var(--text-secondary)]"
              >
                Kecepatan Suara:
              </label>
              <select
                id="speech-rate-select"
                value={settings.speechRate}
                onChange={(e) =>
                  onUpdate({ speechRate: Number(e.target.value) })
                }
                className="px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
              >
                <option value={0.85}>0.85x (Lambat)</option>
                <option value={1}>1.0x (Normal)</option>
                <option value={1.25}>1.25x (Cepat)</option>
              </select>

              <button
                type="button"
                onClick={onReadSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bacakan Ringkasan Halaman</span>
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={onStopSpeech}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hentikan Suara</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
