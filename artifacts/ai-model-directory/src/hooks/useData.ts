import { useState, useEffect, useCallback } from "react";
import type { AIModel, Provider, GlossaryEntry } from "@/types";

const BASE = import.meta.env.BASE_URL;

function dataUrl(path: string) {
  return `${BASE}data/${path}`;
}

function toReasoningLevel(raw: unknown): AIModel["capabilities"]["reasoning_level"] {
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  if (raw === true) return "high";
  return "low";
}

function normalizeModel(model: any): AIModel {
  const openSource = /llama|gemma/i.test(`${model.model_name} ${model.model_id}`);

  return {
    ...model,
    pricing: {
      type: model.pricing?.type ?? (openSource ? "provider-dependent" : "official"),
      note: model.pricing?.note ?? (openSource ? "Pricing varies by hosting provider." : "From official provider docs."),
      input_price_per_1m_tokens: model.pricing?.input_price_per_1m_tokens ?? null,
      output_price_per_1m_tokens: model.pricing?.output_price_per_1m_tokens ?? null,
      example_providers: model.pricing?.example_providers ?? (openSource ? ["Together AI", "Fireworks", "Replicate"] : undefined),
    },
    rate_limits: {
      type: model.rate_limits?.type ?? "unknown",
      note: model.rate_limits?.note ?? "Rate limits vary by provider, account tier, and billing.",
      rpm: model.rate_limits?.type === "unknown" ? null : (model.rate_limits?.rpm ?? null),
      tpm: model.rate_limits?.type === "unknown" ? null : (model.rate_limits?.tpm ?? null),
      rpd: model.rate_limits?.type === "unknown" ? null : (model.rate_limits?.rpd ?? null),
    },
    capabilities: {
      ...model.capabilities,
      reasoning_level: toReasoningLevel(model.capabilities?.reasoning_level ?? model.capabilities?.reasoning),
    },
    data_quality: model.data_quality ?? (openSource ? "community" : "estimated"),
    availability: model.availability ?? (openSource ? "open-source" : "api"),
    last_verified: model.last_verified ?? model.last_updated ?? null,
    reviews: Array.isArray(model.reviews)
      ? model.reviews
          .map((review: any) => ({
            rating: Number(review.rating),
            comment: String(review.comment ?? "").trim(),
            date: String(review.date ?? "").trim(),
            username: review.username ? String(review.username).trim() : undefined,
          }))
          .filter((review: any) => review.rating >= 1 && review.rating <= 5 && review.comment && review.date)
      : [],
  };
}

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchModels = useCallback(async () => {
    const response = await fetch(dataUrl("models.json"), { cache: "no-store" });
    const data = await response.json();
    setModels((data as any[]).map(normalizeModel));
  }, []);

  useEffect(() => {
    refetchModels()
      .then(() => {
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [refetchModels]);

  return { models, loading, error, refetchModels };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("providers.json"))
      .then((r) => r.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { providers, loading };
}

export function useGlossary() {
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);

  useEffect(() => {
    fetch(dataUrl("glossary.json"))
      .then((r) => r.json())
      .then(setGlossary)
      .catch(() => {});
  }, []);

  return { glossary };
}
