/**
 * Real Anthropic model fetcher using the official Models API.
 * Requires:
 *   - ANTHROPIC_API_KEY in server env
 *   - Node 18+ (global fetch) or a fetch polyfill
 *
 * Note:
 *   The official Models API returns model metadata/capabilities, not pricing.
 *   Pricing is maintained separately by Anthropic.
 */

const ANTHROPIC_MODELS_URL = "https://api.anthropic.com/v1/models";
const ANTHROPIC_API_VERSION = "2023-06-01";
const ANTHROPIC_SOURCE_URL = "https://docs.anthropic.com/en/api/models-list";

type AnthropicApiModel = {
  id: string;
  display_name?: string;
  created_at?: string;
  max_input_tokens?: number;
  max_tokens?: number;
  capabilities?: {
    batch?: { supported?: boolean };
    citations?: { supported?: boolean };
    code_execution?: { supported?: boolean };
    image_input?: { supported?: boolean };
    pdf_input?: { supported?: boolean };
    structured_outputs?: { supported?: boolean };
    thinking?: {
      supported?: boolean;
      types?: {
        adaptive?: { supported?: boolean };
        enabled?: { supported?: boolean };
      };
    };
    effort?: {
      high?: { supported?: boolean };
      low?: { supported?: boolean };
      medium?: { supported?: boolean };
      max?: { supported?: boolean };
      supported?: boolean;
    };
  };
};

type AnthropicModelsResponse = {
  data: AnthropicApiModel[];
  first_id?: string;
  last_id?: string;
  has_more?: boolean;
};

function pickSupported(value: unknown): boolean {
  return Boolean((value as { supported?: boolean } | undefined)?.supported);
}

function toIsoNow() {
  return new Date().toISOString();
}

function normalizeAnthropicModel(model: AnthropicApiModel) {
  const vision = pickSupported(model.capabilities?.image_input);
  const pdf = pickSupported(model.capabilities?.pdf_input);
  const codeExecution = pickSupported(model.capabilities?.code_execution);
  const citations = pickSupported(model.capabilities?.citations);
  const structuredOutputs = pickSupported(model.capabilities?.structured_outputs);
  const thinking = Boolean(model.capabilities?.thinking?.supported);

  return {
    provider: "Anthropic",
    model_id: model.id,
    model_name: model.display_name ?? model.id,
    specialty: null, // keep honest; do not invent specialty from the API
    context_window: model.max_input_tokens ?? null,
    max_output_tokens: model.max_tokens ?? null,

    pricing: {
      type: "unknown",
      input_price_per_1m_tokens: null,
      output_price_per_1m_tokens: null,
      note:
        "Anthropic pricing is maintained on the separate pricing page, not in the Models API.",
      examples: [],
    },

    rate_limits: {
      type: "unknown",
      rpm: null,
      tpm: null,
      rpd: null,
      note:
        "Rate limits are not returned by the Models API. Keep them unknown unless fetched from a separate source.",
    },

    capabilities: {
      text: true,
      vision,
      audio: null,
      code: codeExecution,
      function_calling: structuredOutputs || codeExecution,
      reasoning: thinking ? "high" : null,
      citations,
      pdf_input: pdf,
      structured_outputs: structuredOutputs,
      code_execution: codeExecution,
      thinking,
    },

    availability: "api",
    data_quality: "official",
    source_url: ANTHROPIC_SOURCE_URL,
    last_updated: model.created_at ?? null,
    last_verified: toIsoNow(),
    notes:
      "Official metadata from Anthropic's Models API. Pricing and rate limits are intentionally left unresolved.",
    raw: model,
  };
}

async function fetchAnthropicPage(
  apiKey: string,
  afterId?: string,
  limit = 1000,
): Promise<AnthropicModelsResponse> {
  const url = new URL(ANTHROPIC_MODELS_URL);
  url.searchParams.set("limit", String(limit));
  if (afterId) url.searchParams.set("after_id", afterId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "anthropic-version": ANTHROPIC_API_VERSION,
      "x-api-key": apiKey,
      accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Anthropic Models API failed (${res.status} ${res.statusText}): ${body.slice(0, 300)}`,
    );
  }

  return (await res.json()) as AnthropicModelsResponse;
}

export async function fetchAnthropicModels() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const seenPages = new Set<string>();
  const all: AnthropicApiModel[] = [];

  let afterId: string | undefined;

  while (true) {
    const page = await fetchAnthropicPage(apiKey, afterId, 1000);

    if (Array.isArray(page.data) && page.data.length > 0) {
      all.push(...page.data);
    }

    if (!page.has_more || !page.last_id) {
      break;
    }

    if (seenPages.has(page.last_id)) {
      throw new Error(
        `Pagination loop detected at after_id=${page.last_id}. Aborting to avoid infinite loop.`,
      );
    }

    seenPages.add(page.last_id);
    afterId = page.last_id;
  }

  const unique = new Map<string, ReturnType<typeof normalizeAnthropicModel>>();

  for (const model of all) {
    const normalized = normalizeAnthropicModel(model);
    unique.set(normalized.model_id, normalized);
  }

  return [...unique.values()];
}
