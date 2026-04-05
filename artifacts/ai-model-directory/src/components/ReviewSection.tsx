import { useState } from "react";
import { Star, MessageSquarePlus, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import type { ModelReview } from "@/types";

interface Props {
  modelId: string;
  modelName: string;
  reviews: ModelReview[];
  onRefetchModels: () => Promise<void>;
}

const REVIEW_ENDPOINT = import.meta.env.VITE_REVIEW_API_URL ?? "/api/add-review";

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
          type="button"
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

function ReviewCard({ review }: { review: ModelReview }) {
  const date = new Date(review.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(review.username?.[0] ?? "A").toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-sm text-foreground">{review.username ?? "Anonymous"}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-10">{review.comment}</p>
    </div>
  );
}

export function ReviewSection({ modelId, modelName, reviews, onRefetchModels }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const PREVIEW_COUNT = 3;
  const visible = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);

  async function retryRefetchModels(retryCount = 3) {
    let attempt = 0;

    while (attempt < retryCount) {
      try {
        await onRefetchModels();
        return;
      } catch {
        attempt += 1;
        if (attempt >= retryCount) throw new Error("Failed to refresh models after review submit.");
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: modelId,
          rating,
          comment: comment.trim(),
          username: username.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message = result?.error ?? "Could not submit review. Please try again.";
        throw new Error(message);
      }

      setSuccess(
        "Thanks! Your review was saved. GitHub Pages may take a few seconds to publish it.",
      );

      setUsername("");
      setRating(0);
      setComment("");
      setShowForm(false);

      await retryRefetchModels();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground">Community Reviews</h2>
          {reviews.length > 0 && avgRating != null && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
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
              <label className="text-xs text-muted-foreground mb-1 block">Name (optional)</label>
              <input
                type="text"
                placeholder="Anonymous"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <label className="text-xs text-muted-foreground mb-1 block">Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with ${modelName}...`}
              rows={3}
              maxLength={1000}
              className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{comment.length}/1000</p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
                setSuccess("");
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Submit review"
              )}
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
          {visible.map((review, index) => (
            <ReviewCard key={`${review.date}-${index}`} review={review} />
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
