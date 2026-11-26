import {
  Book,
  SearchFilters,
  SmartSearchMatch,
  SmartSearchOutput,
} from '../types/library';

const SYNONYM_GROUPS: string[][] = [
  ['ai', 'kecerdasan buatan', 'algoritma', 'komputer', 'coding', 'pemrograman', 'informatika', 'teknologi'],
  ['novel', 'cerita', 'cerpen', 'sastra', 'fiksi', 'kisah', 'bacaan'],
  ['sejarah', 'nusantara', 'budaya', 'rempah', 'kuno', 'manuskrip', 'tradisi', 'indonesia'],
  ['desain', 'seni', 'arsitektur', 'tipografi', 'ui', 'ux', 'grafis', 'batik', 'warna'],
  ['psikologi', 'kebiasaan', 'mental', 'komunikasi', 'empati', 'pengembangan diri', 'fokus'],
  ['uang', 'finansial', 'ekonomi', 'bisnis', 'investasi', 'umkm', 'keuangan'],
  ['inklusi', 'aksesibilitas', 'disabilitas', 'wcag', 'pembaca layar', 'audio'],
  ['bintang', 'astronomi', 'antariksa', 'langit', 'teleskop', 'sains', 'matematika'],
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function expandQueryWithSynonyms(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    if (token.length < 2) continue;
    for (const group of SYNONYM_GROUPS) {
      if (group.some((term) => term === token || (token.length >= 4 && term.includes(token)))) {
        for (const term of group) {
          expanded.add(term);
        }
      }
    }
  }
  return Array.from(expanded);
}

function matchesYearRange(year: number, range: SearchFilters['rentangTahun']): boolean {
  switch (range) {
    case '2024-2026':
      return year >= 2024 && year <= 2026;
    case '2020-2023':
      return year >= 2020 && year <= 2023;
    case '2015-2019':
      return year >= 2015 && year <= 2019;
    case 'sebelum-2015':
      return year < 2015;
    default:
      return true;
  }
}

export function runSmartSearch(
  books: Book[],
  filters: SearchFilters
): SmartSearchOutput {
  const rawQuery = filters.query.trim();
  const normQuery = normalizeText(rawQuery);
  const tokens = normQuery.split(/\s+/).filter((t) => t.length > 0);
  const expandedTerms = expandQueryWithSynonyms(tokens);

  // Build autocomplete suggestions from entire catalog
  const suggestions: SmartSearchOutput['suggestions'] = [];
  if (normQuery.length >= 2) {
    const seen = new Set<string>();
    for (const book of books) {
      if (normalizeText(book.judul).includes(normQuery) && !seen.has(`j-${book.judul}`)) {
        seen.add(`j-${book.judul}`);
        suggestions.push({ type: 'judul', label: book.judul, value: book.judul });
      }
      if (normalizeText(book.penulis).includes(normQuery) && !seen.has(`p-${book.penulis}`)) {
        seen.add(`p-${book.penulis}`);
        suggestions.push({ type: 'penulis', label: book.penulis, value: book.penulis });
      }
      for (const kw of book.kataKunci) {
        if (normalizeText(kw).includes(normQuery) && !seen.has(`t-${kw}`)) {
          seen.add(`t-${kw}`);
          suggestions.push({ type: 'topik', label: kw, value: kw });
        }
      }
    }
  }

  // First apply structured facet filters
  const facetFiltered = books.filter((book) => {
    if (filters.kategori !== 'Semua' && book.kategori !== filters.kategori) {
      return false;
    }
    if (filters.penulis !== 'Semua' && book.penulis !== filters.penulis) {
      return false;
    }
    if (!matchesYearRange(book.tahunTerbit, filters.rentangTahun)) {
      return false;
    }
    if (filters.tahunSpesifik !== 'Semua' && book.tahunTerbit !== filters.tahunSpesifik) {
      return false;
    }
    if (filters.hanyaTersedia && book.tersedia <= 0) {
      return false;
    }
    return true;
  });

  let scored: SmartSearchMatch[] = [];

  if (tokens.length === 0) {
    scored = facetFiltered.map((book) => ({
      book,
      score: 1,
      matchReasons: [],
    }));
  } else {
    for (const book of facetFiltered) {
      let score = 0;
      const reasons = new Set<string>();

      const judul = normalizeText(book.judul);
      const subjudul = normalizeText(book.subjudul);
      const penulis = normalizeText(book.penulis);
      const kategori = normalizeText(book.kategori);
      const sinopsis = normalizeText(book.sinopsis);
      const tahun = String(book.tahunTerbit);
      const isbn = normalizeText(book.isbn);
      const keywords = book.kataKunci.map(normalizeText);

      // Direct full-phrase bonus
      if (judul.includes(normQuery)) {
        score += 50;
        reasons.add('Judul');
      }
      if (penulis.includes(normQuery)) {
        score += 45;
        reasons.add('Penulis');
      }
      if (subjudul.includes(normQuery)) {
        score += 25;
        reasons.add('Subjudul');
      }
      if (kategori.includes(normQuery)) {
        score += 20;
        reasons.add('Kategori');
      }
      if (isbn.includes(normQuery)) {
        score += 40;
        reasons.add('ISBN');
      }

      // Per-token & fuzzy matching
      for (const token of tokens) {
        if (judul.includes(token)) {
          score += 24;
          reasons.add('Judul');
        }
        if (penulis.includes(token)) {
          score += 22;
          reasons.add('Penulis');
        }
        if (tahun === token) {
          score += 30;
          reasons.add(`Tahun ${tahun}`);
        }
        if (keywords.some((k) => k.includes(token))) {
          score += 18;
          reasons.add('Topik Cerdas');
        }
        if (sinopsis.includes(token)) {
          score += 10;
          reasons.add('Sinopsis');
        }

        // Fuzzy word match on title & author words for typo tolerance
        if (token.length >= 4) {
          const titleAndAuthorWords = `${judul} ${penulis} ${keywords.join(' ')}`.split(/\s+/);
          for (const word of titleAndAuthorWords) {
            if (word.length >= 4 && Math.abs(word.length - token.length) <= 2) {
              const dist = levenshteinDistance(token, word);
              if (dist === 1 || (token.length >= 6 && dist === 2)) {
                score += 12;
                reasons.add('Kemiripan Kata');
                break;
              }
            }
          }
        }
      }

      // Synonym expansion score
      for (const syn of expandedTerms) {
        if (tokens.includes(syn)) continue;
        if (
          judul.includes(syn) ||
          kategori.includes(syn) ||
          keywords.some((k) => k.includes(syn))
        ) {
          score += 8;
          reasons.add('Topik Terkait');
        }
      }

      if (score > 0) {
        scored.push({
          book,
          score,
          matchReasons: Array.from(reasons).slice(0, 3),
        });
      }
    }
  }

  // Compute "Did You Mean?" if results are empty or weak for a typed query
  let didYouMean: string | null = null;
  if (tokens.length > 0 && scored.length === 0) {
    const vocab = new Set<string>();
    for (const b of books) {
      b.judul.split(/\s+/).forEach((w) => vocab.add(normalizeText(w)));
      b.penulis.split(/\s+/).forEach((w) => vocab.add(normalizeText(w)));
      b.kataKunci.forEach((k) => vocab.add(normalizeText(k)));
    }
    let bestWord: string | null = null;
    let bestDist = Infinity;
    for (const candidate of vocab) {
      if (candidate.length < 4) continue;
      const d = levenshteinDistance(normQuery, candidate);
      if (d > 0 && d <= 2 && d < bestDist) {
        bestDist = d;
        bestWord = candidate;
      }
    }
    didYouMean = bestWord;
  }

  // Apply sorting
  scored.sort((a, b) => {
    switch (filters.urutan) {
      case 'terbaru':
        return b.book.tahunTerbit - a.book.tahunTerbit || b.score - a.score;
      case 'judul-az':
        return a.book.judul.localeCompare(b.book.judul, 'id');
      case 'tersedia':
        return b.book.tersedia - a.book.tersedia || b.score - a.score;
      case 'relevansi':
      default:
        return b.score - a.score || b.book.tahunTerbit - a.book.tahunTerbit;
    }
  });

  return {
    results: scored,
    didYouMean,
    suggestions: suggestions.slice(0, 6),
  };
}
