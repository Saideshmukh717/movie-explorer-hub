const OMDB_API_KEY = "2f656131";
const OMDB_BASE = "https://www.omdbapi.com/";

const STORAGE_KEY = "cinevault_poster_cache_v1";

// Persistent cache backed by localStorage. Once a poster URL is resolved
// (or confirmed missing), it's stored permanently so the OMDb API is never
// called again for the same title/year combination.
const posterCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

// Hydrate in-memory cache from localStorage on module load
try {
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, string | null>;
    for (const [k, v] of Object.entries(parsed)) posterCache.set(k, v);
  }
} catch {
  // ignore corrupt cache
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function persistCache() {
  if (typeof localStorage === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  // Debounce writes to avoid hammering localStorage during bulk fetches
  persistTimer = setTimeout(() => {
    try {
      const obj: Record<string, string | null> = {};
      posterCache.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // quota exceeded or unavailable — silently ignore
    }
  }, 500);
}

export function clearPosterCache() {
  posterCache.clear();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// Concurrency limiter: fewer parallel requests on mobile to keep
// the main thread responsive and avoid network contention.
let activeRequests = 0;
const isMobileUA =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const MAX_CONCURRENT = isMobileUA ? 2 : 4;
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
      persistCache();
      return poster;
    } catch {
      posterCache.set(cacheKey, null);
      persistCache();
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
