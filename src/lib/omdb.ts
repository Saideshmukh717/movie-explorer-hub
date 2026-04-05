const OMDB_API_KEY = "2f656131";
const OMDB_BASE = "https://www.omdbapi.com/";

const posterCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

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

  const promise = (async () => {
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
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}
