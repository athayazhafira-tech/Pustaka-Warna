export type BookCategory =
  | 'Fiksi & Sastra'
  | 'Sains & Teknologi'
  | 'Sejarah & Budaya'
  | 'Desain & Seni'
  | 'Pengembangan Diri'
  | 'Ekonomi & Bisnis';

export type YearRangeFilter =
  | 'semua'
  | '2024-2026'
  | '2020-2023'
  | '2015-2019'
  | 'sebelum-2015';

export type SortOption =
  | 'relevansi'
  | 'terbaru'
  | 'judul-az'
  | 'tersedia';

export interface CoverVisual {
  imagePath?: string;
  bgHex: string;
  accentHex: string;
  secondaryHex: string;
  pattern: 'arch' | 'prism' | 'waves' | 'circles' | 'grid' | 'stripes';
}

export interface Book {
  id: string;
  judul: string;
  subjudul: string;
  penulis: string;
  kategori: BookCategory;
  tahunTerbit: number;
  penerbit: string;
  halaman: number;
  bahasa: string;
  isbn: string;
  kodePanggil: string;
  format: 'E-Book & Audio' | 'E-Book Interaktif' | 'Buku Digital';
  totalEksemplar: number;
  tersedia: number;
  sinopsis: string;
  kutipanBab: {
    judulBab: string;
    paragraf: string[];
  };
  kataKunci: string[];
  cover: CoverVisual;
}

export interface SearchFilters {
  query: string;
  kategori: BookCategory | 'Semua';
  penulis: string;
  rentangTahun: YearRangeFilter;
  tahunSpesifik: number | 'Semua';
  hanyaTersedia: boolean;
  urutan: SortOption;
}

export interface SmartSearchMatch {
  book: Book;
  score: number;
  matchReasons: string[];
}

export interface SmartSearchOutput {
  results: SmartSearchMatch[];
  didYouMean: string | null;
  suggestions: {
    type: 'judul' | 'penulis' | 'topik';
    label: string;
    value: string;
  }[];
}

export interface LoanRecord {
  loanId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  durationDays: number;
  renewedCount: number;
  progressPercent: number;
  note?: string;
}

export interface LoanHistoryRecord {
  loanId: string;
  bookId: string;
  borrowedAt: string;
  returnedAt: string;
}

export type TextScale = 'normal' | 'lg' | 'xl';

export interface AccessibilitySettings {
  highContrast: boolean;
  screenReaderMode: boolean;
  speechRate: number;
  textScale: TextScale;
  dyslexiaFriendly: boolean;
  reduceMotion: boolean;
}
