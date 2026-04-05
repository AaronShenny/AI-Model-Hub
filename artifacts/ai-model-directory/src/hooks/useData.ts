import { useState, useEffect } from "react";
import type { AIModel, Provider, GlossaryEntry, PricingExample } from "@/types";

const BASE = import.meta.env.BASE_URL;

function dataUrl(path: string) {
  return `${BASE}data/${path}`;
}

function toReasoningLevel(raw: unknown): AIModel["capabilities"]["reasoning_level"] {
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  if (raw === true) return "high";
  return "low";
}

function normalizePricingExamples(model: any): PricingExample[] {
  if (Array.isArray(model.pricing?.examples)) {
    return model.pricing.examples.filter((e: any) => e?.provider && typeof e?.input === "number" && typeof e?.output === "number");
  }

  if (Array.isArray(model.pricing?.example_providers)) {
    const input = model.pricing?.input_price_per_1m_tokens;
    const output = model.pricing?.output_price_per_1m_tokens;
    if (typeof input === "number" && typeof output === "number") {
      return model.pricing.example_providers.map((provider: string) => ({ provider, input, output }));
    }
  }

  return [];
}

function normalizeModel(model: any): AIModel {
  const openSource = /llama|gemma|qwen|phi|mistral/i.test(`${model.model_name} ${model.model_id}`) || model.provider === "Meta";
  const pricingType = model.pricing?.type ?? (openSource ? "provider-dependent" : "official");

  return {
    ...model,
    pricing: {
      type: pricingType,
      note: model.pricing?.note ?? (openSource ? "Pricing varies by host/provider and deployment." : "From official provider docs."),
      input_price_per_1m_tokens: model.pricing?.input_price_per_1m_tokens ?? null,
      output_price_per_1m_tokens: model.pricing?.output_price_per_1m_tokens ?? null,
      examples: normalizePricingExamples(model),
    },
    rate_limits: {
      type: model.rate_limits?.type ?? "unknown",
      note: model.rate_limits?.note ?? "Varies by provider and account tier.",
      rpm: model.rate_limits?.rpm ?? null,
      tpm: model.rate_limits?.tpm ?? null,
      rpd: model.rate_limits?.rpd ?? null,
    },
    capabilities: {
      ...model.capabilities,
      reasoning_level: toReasoningLevel(model.capabilities?.reasoning_level ?? model.capabilities?.reasoning),
    },
    data_quality: model.data_quality ?? (openSource ? "community" : "estimated"),
    availability: model.availability ?? (openSource ? "open-source" : "api"),
    last_verified: model.last_verified ?? model.last_updated ?? null,
  };
}

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(dataUrl("models.json"))
      .then((r) => r.json())
      .then((data) => {
        setModels((data as any[]).map(normalizeModel));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { models, loading, error };
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
