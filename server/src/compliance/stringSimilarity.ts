import { SimilarityResult } from './types';

export class StringSimilarity {
  /**
   * Levenshtein edit distance computation
   */
  static levenshteinDistance(s1: string, s2: string): number {
    const a = s1.trim().toLowerCase();
    const b = s2.trim().toLowerCase();
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const matrix: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) matrix[i][0] = i;
    for (let j = 0; j <= n; j++) matrix[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,       // deletion
          matrix[i][j - 1] + 1,       // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[m][n];
  }

  /**
   * Jaro string similarity algorithm
   */
  static jaroSimilarity(s1: string, s2: string): number {
    const a = s1.trim().toLowerCase();
    const b = s2.trim().toLowerCase();

    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
    const aMatches = new Array(a.length).fill(false);
    const bMatches = new Array(b.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    for (let i = 0; i < a.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, b.length);

      for (let j = start; j < end; j++) {
        if (bMatches[j]) continue;
        if (a[i] !== b[j]) continue;
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    let k = 0;
    for (let i = 0; i < a.length; i++) {
      if (!aMatches[i]) continue;
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }

    const m = matches;
    return (m / a.length + m / b.length + (m - transpositions / 2) / m) / 3.0;
  }

  /**
   * Jaro-Winkler string similarity algorithm with common prefix scaling
   */
  static jaroWinklerSimilarity(s1: string, s2: string, prefixScale = 0.1): number {
    const jaroDist = this.jaroSimilarity(s1, s2);
    if (jaroDist < 0.7) return parseFloat(jaroDist.toFixed(4));

    const a = s1.trim().toLowerCase();
    const b = s2.trim().toLowerCase();

    let prefixLen = 0;
    for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
      if (a[i] === b[i]) prefixLen++;
      else break;
    }

    const jw = jaroDist + prefixLen * prefixScale * (1 - jaroDist);
    return parseFloat(Math.min(1.0, jw).toFixed(4));
  }

  /**
   * Token Sort Ratio: splits strings into tokens, sorts them, and checks similarity
   * Handles re-ordered word titles like "Surathkal NITK" vs "NITK Surathkal"
   */
  static tokenSortRatio(s1: string, s2: string): number {
    const cleanAndSort = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join(' ');

    const sorted1 = cleanAndSort(s1);
    const sorted2 = cleanAndSort(s2);

    return this.jaroWinklerSimilarity(sorted1, sorted2);
  }

  /**
   * Comprehensive multi-metric similarity score evaluation
   */
  static evaluate(declared: string, extracted: string): SimilarityResult {
    const d = (declared || '').trim();
    const e = (extracted || '').trim();

    if (!d && !e) {
      return {
        levenshteinDistance: 0,
        jaroSimilarity: 1.0,
        jaroWinklerSimilarity: 1.0,
        tokenSortRatio: 1.0,
        confidence: 1.0,
        matchLevel: 'EXACT_MATCH',
      };
    }

    if (!d || !e) {
      return {
        levenshteinDistance: Math.max(d.length, e.length),
        jaroSimilarity: 0.0,
        jaroWinklerSimilarity: 0.0,
        tokenSortRatio: 0.0,
        confidence: 0.0,
        matchLevel: 'DISCREPANCY',
      };
    }

    const lev = this.levenshteinDistance(d, e);
    const jaro = this.jaroSimilarity(d, e);
    const jw = this.jaroWinklerSimilarity(d, e);
    const tsr = this.tokenSortRatio(d, e);

    const maxLen = Math.max(d.length, e.length);
    const levNormalized = maxLen > 0 ? Math.max(0, 1 - lev / maxLen) : 1;

    // Weighted composite confidence
    let confidence = parseFloat((jw * 0.35 + tsr * 0.45 + levNormalized * 0.2).toFixed(4));
    if (tsr >= 0.95) {
      confidence = Math.max(confidence, parseFloat((0.85 + tsr * 0.1).toFixed(4)));
    }

    let matchLevel: SimilarityResult['matchLevel'] = 'DISCREPANCY';
    if (d.toLowerCase() === e.toLowerCase()) {
      matchLevel = 'EXACT_MATCH';
    } else if (confidence >= 0.80) {
      matchLevel = 'STRONG_MATCH';
    } else if (confidence >= 0.65) {
      matchLevel = 'PARTIAL_MATCH';
    } else {
      matchLevel = 'DISCREPANCY';
    }

    return {
      levenshteinDistance: lev,
      jaroSimilarity: parseFloat(jaro.toFixed(4)),
      jaroWinklerSimilarity: jw,
      tokenSortRatio: tsr,
      confidence,
      matchLevel,
    };
  }
}
