import { useState, useEffect } from "react";
import { Star, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Review {
  id: string;
  movieId: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

function getStoredReviews(movieId: number): Review[] {
  try {
    const all = JSON.parse(localStorage.getItem("cinevault_reviews") || "[]") as Review[];
    return all.filter((r) => r.movieId === movieId);
  } catch {
    return [];
  }
}

function saveReview(review: Review) {
  try {
    const all = JSON.parse(localStorage.getItem("cinevault_reviews") || "[]") as Review[];
    all.push(review);
    localStorage.setItem("cinevault_reviews", JSON.stringify(all));
  } catch {}
}

function deleteReview(id: string) {
  try {
    const all = JSON.parse(localStorage.getItem("cinevault_reviews") || "[]") as Review[];
    localStorage.setItem("cinevault_reviews", JSON.stringify(all.filter((r) => r.id !== id)));
  } catch {}
}

export function MovieReviews({ movieId }: { movieId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setReviews(getStoredReviews(movieId));
  }, [movieId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating === 0) return;

    const review: Review = {
      id: crypto.randomUUID(),
      movieId,
      name: name.trim().slice(0, 50),
      rating,
      comment: comment.trim().slice(0, 500),
      date: new Date().toISOString(),
    };

    saveReview(review);
    setReviews(getStoredReviews(movieId));
    setName("");
    setRating(0);
    setComment("");
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    setReviews(getStoredReviews(movieId));
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-display text-3xl text-foreground">Reviews</h2>
        {avgRating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-primary font-medium">{avgRating}</span>
            <span>from {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Add review form */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
        <p className="text-sm font-medium text-foreground">Write a Review</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-border sm:max-w-[200px]"
            maxLength={50}
            required
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    s <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>}
          </div>
        </div>
        <Textarea
          placeholder="Share your thoughts about this movie..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-secondary border-border min-h-[80px]"
          maxLength={500}
          required
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{comment.length}/500</span>
          <Button type="submit" size="sm" disabled={!name.trim() || !comment.trim() || rating === 0}>
            <Send className="h-4 w-4" /> Post Review
          </Button>
        </div>
      </form>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-3">
          {reviews
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(r.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
