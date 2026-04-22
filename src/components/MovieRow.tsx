import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { Button } from "@/components/ui/button";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 640;
    const base = isMobile ? scrollRef.current.clientWidth * 0.85 : 400;
    scrollRef.current.scrollBy({ left: dir === "left" ? -base : base, behavior: "smooth" });
  };

  return (
    <section className="space-y-3 sm:space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground">{title}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth-mobile pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
