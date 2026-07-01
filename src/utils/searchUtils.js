/**
 * Smart Fuzzy Matching Search Utilities for Campus Ninja
 * Handles exact substrings, acronyms/initials (e.g. DSA, OS, ES), and minor spelling mistakes (Levenshtein distance).
 */

const getEditDistance = (a = '', b = '') => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Checks if a search query matches a target item (subject, skill, marketplace product).
 * @param {string} query - User search string
 * @param {Object|string} target - Target object with title/name/description or simple string
 * @returns {boolean}
 */
export const fuzzyMatchItem = (query = '', target) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;

  let title = '';
  let desc = '';
  let code = '';
  let category = '';

  if (typeof target === 'string') {
    title = target;
  } else if (target && typeof target === 'object') {
    title = target.title || target.name || '';
    desc = target.description || target.subtitle || '';
    code = target.code || '';
    category = target.category || '';
  }

  const combinedText = `${title} ${code} ${category} ${desc}`.toLowerCase();

  // 1. Exact Substring Match
  if (combinedText.includes(q)) return true;

  const ignoredWords = new Set(['and', '&', 'in', 'for', 'of', 'to', 'the', 'i', 'ii', 'iii']);
  const targetWords = title
    .toLowerCase()
    .split(/[\s\-&()]+/)
    .filter(w => w.length > 0 && !ignoredWords.has(w));

  // 2. Acronym / Initials Match (e.g., 'es' -> 'environmental science', 'dsa' -> 'data structures algorithms')
  const acronym = targetWords.map(w => w[0]).join('');
  if (acronym.length >= 2 && (q === acronym || q.startsWith(acronym) || acronym.startsWith(q))) {
    return true;
  }

  // 3. Token-based Fuzzy Word Matching (handles minor spelling mistakes)
  const queryWords = q.split(/[\s\-&()]+/).filter(w => w.length > 0 && !ignoredWords.has(w));
  if (queryWords.length === 0) return false;

  // Check if every query word matches at least one target word within allowed edit distance
  const allQueryWordsMatched = queryWords.every(qw => {
    // Exact or substring inside any target word or combined text
    if (combinedText.includes(qw)) return true;

    // Check edit distance against target words
    return targetWords.some(tw => {
      if (tw.includes(qw) || qw.includes(tw)) return true;
      const distance = getEditDistance(qw, tw);
      const allowedThreshold = qw.length >= 6 ? 2 : (qw.length >= 4 ? 1 : 0);
      return distance <= allowedThreshold;
    });
  });

  return allQueryWordsMatched;
};
