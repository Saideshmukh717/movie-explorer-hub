import type { Movie } from "./types";

/**
 * Get movie recommendations based on genre overlap, keyword similarity, and rating.
 */
export function getRecommendations(movie: Movie, allMovies: Movie[], count = 8): Movie[] {
  const scored = allMovies
    .filter((m) => m.id !== movie.id)
    .map((m) => {
      let score = 0;

      // Genre overlap (strongest signal)
      const genreOverlap = m.genres.filter((g) => movie.genres.includes(g)).length;
      score += genreOverlap * 3;

      // Keyword overlap
      const kw1 = new Set(movie.keywords);
      const kwOverlap = m.keywords.filter((k) => kw1.has(k)).length;
      score += kwOverlap * 2;

      // Same deep_theme
      if (movie.deep_theme && m.deep_theme === movie.deep_theme) score += 4;

      // Similar era (within 5 years)
      if (Math.abs(m.year - movie.year) <= 5) score += 1;

      // Rating bonus
      score += m.weighted_rating * 0.3;

      // Same language bonus
      if (m.original_language === movie.original_language) score += 0.5;

      return { movie: m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return scored.map((s) => s.movie);
}
