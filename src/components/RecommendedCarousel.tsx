import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";
import type { Movie } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePoster } from "@/hooks/usePoster";

const SLIDE_COUNT = 8;
const INTERVAL_MS = 5000;

interface RecommendedCarouselProps {
  movies: Movie[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function Slide({ movie, active }: { movie: Movie; active: boolean }) {
  const { poster, ref } = usePoster(movie.title, movie.year);

  return (
    <div
      ref={ref}
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${active ? "animate-ken-burns" : ""}`}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 shimmer-bg animate-shimmer" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="relative z-10 flex h-full items-end sm:items-center px-4 sm:px-10 pb-6 sm:pb-0">
        <div
          className={`max-w-xl space-y-2 sm:space-y-4 ${
            active ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <Badge variant="outline" className="border-primary/40 text-primary gap-1 text-[10px] sm:text-xs">
            <Sparkles className="h-3 w-3" /> Recommended
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl leading-none text-foreground line-clamp-2">
            {movie.title}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Star className="h-3.5 w-3.5 fill-primary" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span>•</span>
            <span>{movie.year}</span>
            {movie.genres[0] && (
              <>
                <span>•</span>
                <span>{movie.genres.slice(0, 2).join(", ")}</span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
            {movie.overview}
          </p>
          <Button asChild size="sm" className="mt-1">
            <Link to={`/movie/${movie.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecommendedCarousel({ movies }: RecommendedCarouselProps) {
  // Random 8 picks, regenerated each mount (page load)
  const slides = useMemo(() => {
    const pool = movies.filter((m) => m.overview && m.vote_count > 200 && m.vote_average >= 6.5);
    return pickRandom(pool.length >= SLIDE_COUNT ? pool : movies, SLIDE_COUNT);
  }, [movies]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || slides.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDE_COUNT);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + SLIDE_COUNT) % SLIDE_COUNT);

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative h-[360px] sm:h-[480px] md:h-[540px]">
        {slides.map((m, i) => (
          <Slide key={m.id} movie={m} active={i === index} />
        ))}

        {/* Controls */}
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/60 backdrop-blur-md p-2 sm:p-3 text-foreground hover:bg-background/90 active:scale-90 transition-all"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/60 backdrop-blur-md p-2 sm:p-3 text-foreground hover:bg-background/90 active:scale-90 transition-all"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/30 hover:bg-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
