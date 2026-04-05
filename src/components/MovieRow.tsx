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
    const amount = dir === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-foreground">{title}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
