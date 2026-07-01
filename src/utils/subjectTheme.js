/**
 * Automatic Visual Identity Generator for Campus Ninja Subjects
 * Generates unique initials, color palettes, and styling without needing manual icon uploads.
 */

const PALETTES = [
  {
    name: 'Indigo',
    primary: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    lightTint: '#F8FAFC',
    progress: '#6366F1',
  },
  {
    name: 'Teal',
    primary: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    lightTint: '#F8FAFC',
    progress: '#14B8A6',
  },
  {
    name: 'Orange',
    primary: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    lightTint: '#F8FAFC',
    progress: '#F97316',
  },
  {
    name: 'Rose',
    primary: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    lightTint: '#F8FAFC',
    progress: '#F43F5E',
  },
  {
    name: 'Blue',
    primary: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    lightTint: '#F8FAFC',
    progress: '#3B82F6',
  },
  {
    name: 'Purple',
    primary: '#9333EA',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    lightTint: '#F8FAFC',
    progress: '#A855F7',
  },
  {
    name: 'Sky',
    primary: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    lightTint: '#F8FAFC',
    progress: '#0EA5E9',
  },
  {
    name: 'Amber',
    primary: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    lightTint: '#F8FAFC',
    progress: '#F59E0B',
  },
];

export const getSubjectVisualIdentity = (title = '') => {
  const cleanTitle = (title || 'Subject').trim();

  // 1. Generate Initials (1-2 chars)
  const ignoredWords = new Set(['and', '&', 'in', 'for', 'of', 'to', 'the', 'part', 'i', 'ii', 'iii']);
  const words = cleanTitle
    .split(/\s+/)
    .filter(w => w.length > 0 && !ignoredWords.has(w.toLowerCase()));

  let initials = 'SUB';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    const word = words[0];
    initials = word.length > 1 ? word.slice(0, 2).toUpperCase() : word[0].toUpperCase();
  }

  // 2. Deterministic Hash for Palette Selection
  let hash = 0;
  for (let i = 0; i < cleanTitle.length; i++) {
    hash = cleanTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % PALETTES.length;
  const palette = PALETTES[paletteIndex];

  return {
    initials,
    ...palette,
  };
};
