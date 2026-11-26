import React, { useState } from 'react';
import { Book } from '../types/library';

interface BookCoverProps {
  book: Book;
  highContrast?: boolean;
  compact?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  highContrast = false,
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(book.cover.imagePath) && !imgError;

  const renderGeometricPattern = () => {
    const { bgHex, accentHex, secondaryHex, pattern } = book.cover;
    const bg = highContrast ? '#111111' : bgHex;
    const accent = highContrast ? '#FACC15' : accentHex;
    const secondary = highContrast ? '#38BDF8' : secondaryHex;

    return (
      <svg
        viewBox="0 0 300 400"
        className="w-full h-full object-cover"
        aria-hidden="true"
      >
        <rect width="300" height="400" fill={bg} />
        {pattern === 'waves' && (
          <g opacity="0.9">
            <path
              d="M0 240 Q 75 190 150 240 T 300 240 L 300 400 L 0 400 Z"
              fill={accent}
            />
            <path
              d="M0 295 Q 75 250 150 295 T 300 295 L 300 400 L 0 400 Z"
              fill={secondary}
            />
            <circle cx="220" cy="110" r="46" fill={secondary} />
          </g>
        )}
        {pattern === 'prism' && (
          <g>
            <polygon points="150,55 255,250 45,250" fill={accent} opacity="0.92" />
            <polygon points="150,55 255,250 185,295" fill={secondary} opacity="0.85" />
            <rect x="45" y="278" width="210" height="14" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
        {pattern === 'arch' && (
          <g>
            <path
              d="M55 340 L55 180 A95 95 0 0 1 245 180 L245 340 Z"
              fill={accent}
            />
            <path
              d="M95 340 L95 195 A55 55 0 0 1 205 195 L205 340 Z"
              fill={secondary}
            />
            <circle cx="150" cy="115" r="20" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
        {pattern === 'circles' && (
          <g>
            <circle cx="115" cy="155" r="78" fill={accent} />
            <circle cx="195" cy="225" r="68" fill={secondary} opacity="0.9" />
            <circle cx="150" cy="185" r="32" fill="#FFFFFF" opacity="0.92" />
          </g>
        )}
        {pattern === 'grid' && (
          <g>
            <rect x="40" y="65" width="100" height="100" fill={accent} />
            <rect x="160" y="65" width="100" height="100" fill={secondary} />
            <rect x="40" y="185" width="100" height="100" fill={secondary} opacity="0.8" />
            <circle cx="210" cy="235" r="50" fill={accent} />
          </g>
        )}
        {pattern === 'stripes' && (
          <g>
            <rect x="35" y="60" width="45" height="280" fill={accent} />
            <rect x="105" y="95" width="45" height="245" fill={secondary} />
            <rect x="175" y="60" width="45" height="280" fill="#FFFFFF" opacity="0.9" />
            <circle cx="240" cy="105" r="24" fill={accent} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div
      className={`relative w-full aspect-[3/4] overflow-hidden rounded-lg border ${
        highContrast
          ? 'border-white bg-black'
          : 'border-[var(--border-hairline)] bg-[var(--bg-subtle)]'
      }`}
    >
      {hasImage ? (
        <img
          src={book.cover.imagePath}
          alt={`Sampul ilustrasi buku ${book.judul} karya ${book.penulis}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        renderGeometricPattern()
      )}

      {/* Subtle bottom scrim with clean editorial spine title for quick shelf recognition */}
      {!compact && (
        <div
          className={`absolute inset-x-0 bottom-0 p-3.5 ${
            highContrast
              ? 'bg-black/95 border-t border-white'
              : 'bg-gradient-to-t from-black/85 via-black/50 to-transparent'
          }`}
        >
          <p className="text-[11px] font-medium tracking-wide text-white/90 truncate">
            {book.penulis}
          </p>
          <p className="text-sm font-bold text-white leading-snug line-clamp-2">
            {book.judul}
          </p>
        </div>
      )}
    </div>
  );
};
