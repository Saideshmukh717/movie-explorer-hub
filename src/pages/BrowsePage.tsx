import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMovies } from "@/contexts/MovieContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllGenres } from "@/lib/movieData";

const ITEMS_PER_PAGE = 24;

type SortKey = "rating" | "popularity" | "revenue" | "year" | "title";

export default function BrowsePage() {
  const { movies, loading } = useMovies();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("popularity");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [popularityCat, setPopularityCat] = useState("all");

  const genres = useMemo(() => getAllGenres(movies), [movies]);

  const filtered = useMemo(() => {
    let result = movies.filter((m) => {
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedGenre !== "all" && !m.genres.includes(selectedGenre)) return false;
      if (m.vote_average < minRating) return false;
      if (popularityCat !== "all" && m.popularity_category !== popularityCat) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.weighted_rating - a.weighted_rating;
        case "popularity": return b.popularity - a.popularity;
        case "revenue": return b.revenue - a.revenue;
        case "year": return b.year - a.year;
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    return result;
  }, [movies, query, selectedGenre, sortBy, minRating, popularityCat]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-5xl text-foreground">Browse Movies</h1>
          <p className="text-muted-foreground">{filtered.length.toLocaleString()} movies found</p>
        </div>

        {/* Search and controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortKey); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-primary text-primary" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-fade-in">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Genre</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedGenre === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => { setSelectedGenre("all"); setPage(1); }}
                >
                  All
                </Badge>
                {genres.map((g) => (
                  <Badge
                    key={g}
                    variant={selectedGenre === g ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => { setSelectedGenre(g); setPage(1); }}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Min Rating</p>
                <Select value={String(minRating)} onValueChange={(v) => { setMinRating(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-[120px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 6, 7, 8].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r === 0 ? "Any" : `${r}+`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Popularity</p>
                <Select value={popularityCat} onValueChange={(v) => { setPopularityCat(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Movie grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginated.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="sm" />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
