import { useState, useEffect } from "react";
import { fetchPosterByTitle } from "@/lib/omdb";

export function usePoster(title: string, year?: number) {
  const [poster, setPoster] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPosterByTitle(title, year).then((url) => {
      if (!cancelled) setPoster(url);
    });
    return () => { cancelled = true; };
  }, [title, year]);

  return poster;
}
