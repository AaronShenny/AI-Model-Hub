import { useState } from "react";
import { Star, Trash2, MessageSquarePlus, ChevronDown, ChevronUp } from "lucide-react";
import { useReviews, type Review } from "@/hooks/useReviews";

interface Props {
  modelId: string;
  modelName: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const px = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={readonly ? "button" : "button"}
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
          aria-label={readonly ? `${n} star` : `Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${px} ${
              n <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete }: { review: Review; onDelete: () => void }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
            {review.author[0].toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-sm text-foreground">{review.author}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly size="sm" />
          <button
            type="button"
            onClick={onDelete}
            title="Delete review"
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {review.text && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-10">{review.text}</p>
      )}
    </div>
  );
}

export function ReviewSection({ modelId, modelName }: Props) {
  const { reviews, addReview, deleteReview, avgRating } = useReviews(modelId);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const PREVIEW_COUNT = 3;
  const visible = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!text.trim()) {
      setError("Please write a review before submitting.");
      return;
    }
    addReview({ author, rating, text });
    setAuthor("");
    setRating(0);
    setText("");
    setError("");
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground">Community Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Math.round(avgRating!)} readonly size="sm" />
              <span className="text-sm font-medium text-foreground">
                {avgRating!.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Write a review
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Your review of <span className="text-primary">{modelName}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Name (optional)
              </label>
              <input
                type="text"
                placeholder="Anonymous"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Rating *</label>
              <div className="flex items-center h-[34px]">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Review *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Share your experience with ${modelName}...`}
              rows={3}
              maxLength={1000}
              className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{text.length}/1000</p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Submit review
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => deleteReview(review.id)}
            />
          ))}
          {reviews.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Show fewer
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Show all {reviews.length} reviews
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
