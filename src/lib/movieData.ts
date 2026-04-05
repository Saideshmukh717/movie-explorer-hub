import Papa from "papaparse";
import type { Movie } from "./types";

const CLEANED_URL = "https://raw.githubusercontent.com/Saideshmukh717/movie-project-for-microsoft/main/cleaned_movies_data.csv";
const THEMED_URL = "https://raw.githubusercontent.com/Saideshmukh717/movie-project-for-microsoft/main/themed_movies_data.csv";

function parsePythonDict(s: string): Record<string, string> {
  if (!s || s === "{}") return {};
  const result: Record<string, string> = {};
  // Match 'key': 'value' pairs
  const regex = /'([^']*(?:''[^']*)*)'\s*:\s*'([^']*(?:''[^']*)*)'/g;
  let match;
  while ((match = regex.exec(s)) !== null) {
    result[match[1].replace(/''/g, "'")] = match[2].replace(/''/g, "'");
  }
  // Also try "key": "value"
  const regex2 = /"([^"]*(?:""[^"]*)*)"\s*:\s*"([^"]*(?:""[^"]*)*)"/g;
  while ((match = regex2.exec(s)) !== null) {
    result[match[1].replace(/""/g, '"')] = match[2].replace(/""/g, '"');
  }
  return result;
}

function splitCommaList(s: string): string[] {
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function parseRow(row: Record<string, string>): Movie {
  return {
    id: parseInt(row.id) || 0,
    title: row.title || "",
    original_title: row.original_title || "",
    overview: row.overview || "",
    tagline: row.tagline || "",
    budget: parseFloat(row.budget) || 0,
    revenue: parseFloat(row.revenue) || 0,
    runtime: parseFloat(row.runtime) || 0,
    release_date: row.release_date || "",
    year: parseInt(row.year) || 0,
    genres: splitCommaList(row.genres),
    keywords: splitCommaList(row.keywords),
    original_language: row.original_language || "en",
    popularity: parseFloat(row.popularity) || 0,
    vote_average: parseFloat(row.vote_average) || 0,
    vote_count: parseInt(row.vote_count) || 0,
    status: row.status || "",
    production_companies: splitCommaList(row.production_companies),
    production_countries: splitCommaList(row.production_countries),
    cast: parsePythonDict(row.cast),
    crew: parsePythonDict(row.crew),
    tags: row.tags || "",
    engagement_score: parseFloat(row.engagement_score) || 0,
    weighted_rating: parseFloat(row.weighted_rating) || 0,
    popularity_category: row.popularity_category || "Low",
    overview_length: parseInt(row.overview_length) || 0,
    success_score: parseFloat(row.success_score) || 0,
    deep_theme: row.deep_theme || undefined,
  };
}

async function fetchAndParse(url: string): Promise<Movie[]> {
  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (parsed.data as Record<string, string>[]).map(parseRow);
}

let cachedMovies: Movie[] | null = null;

export async function loadMovies(): Promise<Movie[]> {
  if (cachedMovies) return cachedMovies;

  const [cleaned, themed] = await Promise.all([
    fetchAndParse(CLEANED_URL),
    fetchAndParse(THEMED_URL),
  ]);

  // Merge deep_theme from themed into cleaned
  const themeMap = new Map<number, string>();
  themed.forEach((m) => {
    if (m.deep_theme) themeMap.set(m.id, m.deep_theme);
  });
  cleaned.forEach((m) => {
    m.deep_theme = themeMap.get(m.id) || undefined;
  });

  cachedMovies = cleaned;
  return cachedMovies;
}

export function getAllGenres(movies: Movie[]): string[] {
  const set = new Set<string>();
  movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
  return Array.from(set).sort();
}

export function getYearRange(movies: Movie[]): [number, number] {
  const years = movies.map((m) => m.year).filter((y) => y > 1900);
  return [Math.min(...years), Math.max(...years)];
}

export function formatCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
