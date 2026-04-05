import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, TrendingUp, DollarSign, Play } from "lucide-react";
import { useMovies } from "@/contexts/MovieContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MovieRow } from "@/components/MovieRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/movieData";
import { usePoster } from "@/hooks/usePoster";

function HeroBanner({ movie }: { movie: any }) {
  const poster = usePoster(movie.title, movie.year);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="container relative z-10 flex min-h-[480px] flex-col justify-end pb-12 pt-20">
        <div className="flex gap-8 items-end">
          {poster && (
            <img
              src={poster}
              alt={movie.title}
              className="hidden md:block w-48 rounded-lg shadow-2xl shadow-primary/10 border border-border"
            />
          )}
          <div className="max-w-2xl space-y-4 animate-fade-in">
            {movie.deep_theme && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                {movie.deep_theme}
              </Badge>
            )}
            <h1 className="font-display text-6xl md:text-7xl leading-none text-foreground">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-lg text-muted-foreground italic">"{movie.tagline}"</p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {movie.overview}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold text-primary">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{movie.year}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{movie.runtime} min</span>
              {movie.revenue > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(movie.revenue)}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button asChild>
                <Link to={`/movie/${movie.id}`}>
                  <Play className="h-4 w-4" /> View Details
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/browse">Browse All</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { movies, loading } = useMovies();

  const { featured, trending, topRated, boxOffice } = useMemo(() => {
    if (!movies.length) return { featured: null, trending: [], topRated: [], boxOffice: [] };

    const sorted = [...movies].filter((m) => m.overview && m.vote_count > 100);
    const topByRating = sorted.sort((a, b) => b.weighted_rating - a.weighted_rating);
    const featured = topByRating[Math.floor(Math.random() * Math.min(10, topByRating.length))];
    const trending = [...movies].sort((a, b) => b.popularity - a.popularity).slice(0, 20);
    const topRated = topByRating.slice(0, 20);
    const boxOffice = [...movies].sort((a, b) => b.revenue - a.revenue).slice(0, 20);

    return { featured, trending, topRated, boxOffice };
  }, [movies]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen pt-16">
      {featured && <HeroBanner movie={featured} />}

      <div className="container space-y-10 py-10">
        <MovieRow title="🔥 Trending Now" movies={trending} />
        <MovieRow title="⭐ Top Rated" movies={topRated} />
        <MovieRow title="💰 Box Office Hits" movies={boxOffice} />

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: "Total Movies", value: movies.length.toLocaleString() },
            { icon: Star, label: "Avg Rating", value: (movies.reduce((s, m) => s + m.vote_average, 0) / movies.length).toFixed(1) },
            { icon: DollarSign, label: "Total Revenue", value: formatCurrency(movies.reduce((s, m) => s + m.revenue, 0)) },
            { icon: Play, label: "Genres", value: new Set(movies.flatMap((m) => m.genres)).size.toString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-5 text-center">
              <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
