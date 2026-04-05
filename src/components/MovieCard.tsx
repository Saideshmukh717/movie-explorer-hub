import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Movie } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { usePoster } from "@/hooks/usePoster";

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
}

const genreColors: Record<string, string> = {
  Action: "bg-cinema-red/20 text-cinema-red border-cinema-red/30",
  Comedy: "bg-primary/20 text-primary border-primary/30",
  Drama: "bg-accent/20 text-accent border-accent/30",
  Horror: "bg-destructive/20 text-destructive border-destructive/30",
};

export function MovieCard({ movie, size = "md" }: MovieCardProps) {
  const firstGenre = movie.genres[0] || "Unknown";
  const colorClass = genreColors[firstGenre] || "bg-secondary text-secondary-foreground border-border";
  const year = movie.year || movie.release_date?.slice(0, 4);
  const poster = usePoster(movie.title, movie.year);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
        size === "sm" ? "min-w-[180px]" : size === "lg" ? "min-w-[280px]" : "min-w-[220px]"
      }`}
    >
      {/* Poster */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-secondary to-background ${
          size === "sm" ? "h-40" : size === "lg" ? "h-64" : "h-52"
        }`}
      >
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-muted-foreground/30">
              {movie.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-xs font-semibold text-primary">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
        {/* Year badge */}
        <div className="absolute top-2 left-2 rounded-full bg-background/80 px-2 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-foreground">{year}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-body text-sm font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <Badge
              key={genre}
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${genreColors[genre] || colorClass}`}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
