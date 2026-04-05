/**
 * Real Gemini model fetcher using the official Gemini Models API.
 *
 * Official docs:
 * - models.list: GET https://generativelanguage.googleapis.com/v1beta/models
 * - Paginated with pageSize / pageToken
 * - Returns model metadata such as displayName, description, inputTokenLimit,
 *   outputTokenLimit, supportedGenerationMethods, and thinking
 *
 * Important:
 * - Pricing is NOT returned by models.list
 * - Rate limits are NOT returned by models.list
 * - Rate limits are project-tier based and can change over time
 */

const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_SOURCE_URL = "https://ai.google.dev/api/models";

type GeminiApiModel = {
  name?: string; // e.g. "models/gemini-2.5-flash"
  baseModelId?: string;
  version?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
  thinking?: boolean;
  temperature?: number;
  maxTemperature?: number;
  topP?: number;
  topK?: number;
};

type GeminiListResponse = {
  models?: GeminiApiModel[];
  nextPageToken?: string;
};

type FetchGeminiModelsOptions = {
  apiKey?: string;
  pageSize?: number;
  onlyGenerateContent?: boolean;
};

function normalizeModelId(name?: string) {
  if (!name) return null;
  return name.replace(/^models\//, "").trim();
}

function hasMethod(model: GeminiApiModel, method: string) {
  return Array.isArray(model.supportedGenerationMethods)
    ? model.supportedGenerationMethods.includes(method)
    : false;
}

function toIsoNow() {
  return new Date().toISOString();
}

function mapGeminiModel(model: GeminiApiModel) {
  const modelId = normalizeModelId(model.name);

  // Be conservative: only mark capabilities that the Models API itself exposes.
  const supportsGenerateContent = hasMethod(model, "generateContent");
  const supportsEmbedContent = hasMethod(model, "embedContent");

  return {
    provider: "Google",
    model_id: modelId,
    model_name: model.displayName ?? modelId ?? model.name ?? "Unknown Gemini model",

    // Use the official description as a note, but do not overclaim a "specialty"
    // unless you maintain that separately from docs/manual curation.
    specialty: null,

    context_window: typeof model.inputTokenLimit === "number" ? model.inputTokenLimit : null,
    max_output_tokens: typeof model.outputTokenLimit === "number" ? model.outputTokenLimit : null,

    pricing: {
      type: "unknown",
      input_price_per_1m_tokens: null,
      output_price_per_1m_tokens: null,
      note:
        "Gemini pricing is documented separately from the Models API and may vary by tier/model. Do not infer pricing from the Models endpoint.",
      examples: [],
    },

    rate_limits: {
      type: "unknown",
      rpm: null,
      tpm: null,
      rpd: null,
      note:
        "Gemini rate limits are project-tier based and are not returned by the Models API.",
    },

    capabilities: {
      text: supportsGenerateContent,
      vision: null,
      audio: null,
      code: null,
      function_calling: supportsGenerateContent ? null : null,
      reasoning: Boolean(model.thinking) ? "high" : null,
      embeddings: supportsEmbedContent,
      thinking: Boolean(model.thinking),
    },

    availability: "api",
    data_quality: "official",
    source_url: GEMINI_SOURCE_URL,
    last_updated: toIsoNow(),
    last_verified: toIsoNow(),
    notes: model.description ?? "Official Gemini model metadata from the Models API.",
    raw: model,
  };
}

async function fetchGeminiPage(
  apiKey: string,
  pageSize = 1000,
  pageToken?: string,
): Promise<GeminiListResponse> {
  const url = new URL(GEMINI_MODELS_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("pageSize", String(pageSize));
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Gemini Models API failed (${res.status} ${res.statusText}): ${body.slice(0, 300)}`,
    );
  }

  return (await res.json()) as GeminiListResponse;
}

export async function fetchGeminiModels(options: FetchGeminiModelsOptions = {}) {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const pageSize = Math.min(Math.max(options.pageSize ?? 1000, 1), 1000);
  const onlyGenerateContent = options.onlyGenerateContent ?? false;

  const all: GeminiApiModel[] = [];
  let pageToken: string | undefined;

  while (true) {
    const page = await fetchGeminiPage(apiKey, pageSize, pageToken);

    if (Array.isArray(page.models) && page.models.length > 0) {
      all.push(...page.models);
    }

    if (!page.nextPageToken) break;
    pageToken = page.nextPageToken;
  }

  const mapped = all
    .filter((model) => {
      if (!onlyGenerateContent) return true;
      return hasMethod(model, "generateContent");
    })
    .map(mapGeminiModel)
    .filter((model) => Boolean(model.model_id));

  // Deduplicate by model_id
  const unique = new Map<string, (typeof mapped)[number]>();
  for (const model of mapped) {
    unique.set(model.model_id, model);
  }

  return [...unique.values()];
}
