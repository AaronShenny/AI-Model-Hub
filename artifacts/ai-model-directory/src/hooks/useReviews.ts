import { useState, useEffect, useCallback } from "react";

export interface Review {
  id: string;
  modelId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "aidir_reviews";

function loadAll(): Review[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews(modelId: string) {
  const [all, setAll] = useState<Review[]>(() => loadAll());

  const reviews = all.filter((r) => r.modelId === modelId);

  const addReview = useCallback(
    (data: { author: string; rating: number; text: string }) => {
      const review: Review = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        modelId,
        author: data.author.trim() || "Anonymous",
        rating: data.rating,
        text: data.text.trim(),
        createdAt: new Date().toISOString(),
      };
      setAll((prev) => {
        const next = [review, ...prev];
        saveAll(next);
        return next;
      });
    },
    [modelId]
  );

  const deleteReview = useCallback((id: string) => {
    setAll((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveAll(next);
      return next;
    });
  }, []);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return { reviews, addReview, deleteReview, avgRating };
}
