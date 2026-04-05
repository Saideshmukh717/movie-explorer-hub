import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, DollarSign, TrendingUp, Users, Calendar, Globe } from "lucide-react";
import { useMovies } from "@/contexts/MovieContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/movieData";
import { usePoster } from "@/hooks/usePoster";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { movies, loading } = useMovies();

  if (loading) return <LoadingScreen />;

  const movie = movies.find((m) => m.id === Number(id));
  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-16">
        <p className="text-2xl text-muted-foreground">Movie not found</p>
        <Button asChild variant="outline"><Link to="/browse">Back to Browse</Link></Button>
      </div>
    );
  }

  return <MovieDetailContent movie={movie} />;
}

function MovieDetailContent({ movie }: { movie: any }) {
  const poster = usePoster(movie.title, movie.year);

  const profit = movie.revenue - movie.budget;
  const profitPercent = movie.budget > 0 ? ((profit / movie.budget) * 100).toFixed(0) : "N/A";
  const director = movie.crew["Director"] || "Unknown";
  const writer = movie.crew["Writer"] || movie.crew["Screenplay"] || "Unknown";
  const composer = movie.crew["Original Music Composer"] || "Unknown";
  const castEntries = Object.entries(movie.cast).slice(0, 12);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero gradient */}
      <div className="relative border-b border-border">
        {poster && (
          <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15 blur-md scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container relative z-10 py-10 space-y-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/browse">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-full md:w-64 shrink-0">
              {poster ? (
                <img
                  src={poster}
                  alt={movie.title}
                  className="w-full rounded-lg border border-border shadow-2xl shadow-primary/10"
                />
              ) : (
                <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-secondary to-card border border-border flex items-center justify-center">
                  <span className="font-display text-8xl text-muted-foreground/20">{movie.title.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {movie.deep_theme && (
                <Badge variant="outline" className="border-primary/40 text-primary">{movie.deep_theme}</Badge>
              )}
              <h1 className="font-display text-5xl md:text-6xl leading-none text-foreground">{movie.title}</h1>
              {movie.tagline && <p className="text-lg text-muted-foreground italic">"{movie.tagline}"</p>}

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-lg font-bold text-primary">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({movie.vote_count.toLocaleString()} votes)</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> {movie.release_date}
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {movie.runtime} min
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" /> {movie.original_language.toUpperCase()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g: string) => (
                  <Badge key={g} variant="secondary">{g}</Badge>
                ))}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{movie.overview}</p>

              <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Director</p>
                  <p className="text-sm font-medium text-foreground">{director}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Writer</p>
                  <p className="text-sm font-medium text-foreground">{writer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Composer</p>
                  <p className="text-sm font-medium text-foreground">{composer}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Budget", value: movie.budget > 0 ? formatCurrency(movie.budget) : "N/A" },
            { icon: DollarSign, label: "Revenue", value: movie.revenue > 0 ? formatCurrency(movie.revenue) : "N/A" },
            { icon: TrendingUp, label: "Profit", value: movie.budget > 0 && movie.revenue > 0 ? `${formatCurrency(profit)} (${profitPercent}%)` : "N/A", color: profit > 0 ? "text-green-400" : "text-cinema-red" },
            { icon: Users, label: "Popularity", value: `${movie.popularity.toFixed(0)} (${movie.popularity_category})` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className={`font-display text-xl ${item.color || "text-foreground"}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Success Score</span>
              <span className="text-primary font-medium">{movie.success_score.toFixed(1)}</span>
            </div>
            <Progress value={Math.min(movie.success_score, 100)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Engagement Score</span>
              <span className="text-accent font-medium">{movie.engagement_score.toFixed(0)}</span>
            </div>
            <Progress value={Math.min(movie.engagement_score / 1000, 100)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weighted Rating</span>
              <span className="text-primary font-medium">{movie.weighted_rating.toFixed(2)}</span>
            </div>
            <Progress value={(movie.weighted_rating / 10) * 100} className="h-2" />
          </div>
        </div>

        {castEntries.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-3xl text-foreground">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {castEntries.map(([character, actor]: [string, string]) => (
                <div key={character} className="rounded-lg border border-border bg-card p-3 text-center">
                  <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-display text-lg text-muted-foreground">{actor.charAt(0)}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{actor}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {movie.production_companies.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-2xl text-foreground">Production Companies</h2>
            <div className="flex flex-wrap gap-2">
              {movie.production_companies.map((c: string) => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
