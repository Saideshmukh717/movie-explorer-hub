const OMDB_API_KEY = "2f656131";
const OMDB_BASE = "https://www.omdbapi.com/";

const posterCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

// Concurrency limiter: max 3 simultaneous requests (mobile-friendly)
let activeRequests = 0;
const MAX_CONCURRENT = 3;
const requestQueue: Array<() => void> = [];

function dequeue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    activeRequests++;
    const next = requestQueue.shift()!;
    next();
  }
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      fn()
        .then(resolve, reject)
        .finally(() => {
          activeRequests--;
          dequeue();
        });
    };
    if (activeRequests < MAX_CONCURRENT) {
      activeRequests++;
      run();
    } else {
      requestQueue.push(run);
    }
  });
}

export async function fetchPosterByTitle(
  title: string,
  year?: number
): Promise<string | null> {
  const cacheKey = `${title}_${year || ""}`;

  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey)!;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const promise = enqueue(async () => {
    try {
      const params = new URLSearchParams({
        apikey: OMDB_API_KEY,
        t: title,
        type: "movie",
      });
      if (year) params.set("y", String(year));

      const res = await fetch(`${OMDB_BASE}?${params}`);
      const data = await res.json();

      const poster =
        data.Response === "True" && data.Poster && data.Poster !== "N/A"
          ? data.Poster
          : null;

      posterCache.set(cacheKey, poster);
      return poster;
    } catch {
      posterCache.set(cacheKey, null);
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
