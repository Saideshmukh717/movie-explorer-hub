import { useMemo, useState } from "react";
import { useMovies } from "@/contexts/MovieContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getAllGenres, formatCurrency } from "@/lib/movieData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = [
  "hsl(45, 93%, 58%)", "hsl(213, 80%, 55%)", "hsl(0, 72%, 51%)",
  "hsl(150, 60%, 45%)", "hsl(280, 60%, 55%)", "hsl(30, 80%, 55%)",
  "hsl(180, 60%, 45%)", "hsl(330, 70%, 55%)", "hsl(100, 50%, 50%)",
  "hsl(60, 70%, 50%)",
];

export default function AnalyticsPage() {
  const { movies, loading } = useMovies();
  const [genreFilter, setGenreFilter] = useState("all");

  const genres = useMemo(() => getAllGenres(movies), [movies]);

  const filtered = useMemo(() => {
    if (genreFilter === "all") return movies;
    return movies.filter((m) => m.genres.includes(genreFilter));
  }, [movies, genreFilter]);

  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((m) => m.genres.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filtered]);

  const yearlyData = useMemo(() => {
    const map: Record<number, { count: number; totalRating: number }> = {};
    filtered.forEach((m) => {
      if (m.year < 1920 || m.year > 2025) return;
      if (!map[m.year]) map[m.year] = { count: 0, totalRating: 0 };
      map[m.year].count++;
      map[m.year].totalRating += m.vote_average;
    });
    return Object.entries(map)
      .map(([year, d]) => ({ year: Number(year), count: d.count, avgRating: +(d.totalRating / d.count).toFixed(2) }))
      .sort((a, b) => a.year - b.year);
  }, [filtered]);

  const ratingDist = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({ range: `${i}-${i + 1}`, count: 0 }));
    filtered.forEach((m) => {
      const idx = Math.min(Math.floor(m.vote_average), 9);
      buckets[idx].count++;
    });
    return buckets;
  }, [filtered]);

  const scatterData = useMemo(() => {
    return filtered
      .filter((m) => m.budget > 0 && m.revenue > 0)
      .slice(0, 500)
      .map((m) => ({ budget: m.budget / 1e6, revenue: m.revenue / 1e6, title: m.title }));
  }, [filtered]);

  const popData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((m) => { counts[m.popularity_category] = (counts[m.popularity_category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const topRevenue = useMemo(() =>
    [...filtered].sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((m) => ({
      name: m.title.length > 20 ? m.title.slice(0, 20) + "…" : m.title,
      value: m.revenue / 1e6,
    }))
  , [filtered]);

  if (loading) return <LoadingScreen />;

  const tooltipStyle = {
    contentStyle: { backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" },
    labelStyle: { color: "hsl(210, 20%, 92%)" },
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">{filtered.length.toLocaleString()} movies analyzed</p>
          </div>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Filter genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre Distribution */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Genre Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {genreData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue vs Budget */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Revenue vs Budget (M$)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="budget" name="Budget" unit="M" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <YAxis dataKey="revenue" name="Revenue" unit="M" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatterData} fill="hsl(213, 80%, 55%)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Ratings Distribution */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Ratings Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="range" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="hsl(45, 93%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Trends */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Yearly Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="hsl(45, 93%, 58%)" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(213, 80%, 55%)" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="hsl(45, 93%, 58%)" strokeWidth={2} dot={false} name="Movie Count" />
                <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="hsl(213, 80%, 55%)" strokeWidth={2} dot={false} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Revenue */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Top 10 Revenue (M$)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis type="number" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 10 }} width={120} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="hsl(150, 60%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Popularity Categories */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">Popularity Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={popData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {popData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
