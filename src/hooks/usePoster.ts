import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPosterByTitle } from "@/lib/omdb";

/**
 * Lazy-loads a poster only when the element is visible in the viewport.
 * Returns [poster, ref] — attach ref to the container element.
 */
export function usePoster(title: string, year?: number) {
  const [poster, setPoster] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // start loading slightly before visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    fetchPosterByTitle(title, year).then((url) => {
      if (!cancelled) setPoster(url);
    });
    return () => { cancelled = true; };
  }, [visible, title, year]);

  return { poster, ref };
}
