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

/**
 * Real Anthropic model fetcher (clean JS version)
 */

const ANTHROPIC_MODELS_URL = "https://api.anthropic.com/v1/models";
const ANTHROPIC_API_VERSION = "2023-06-01";
const ANTHROPIC_SOURCE_URL = "https://docs.anthropic.com/en/api/models-list";

function pickSupported(value) {
  return Boolean(value && value.supported);
}

function toIsoNow() {
  return new Date().toISOString();
}

function normalizeAnthropicModel(model) {
  const vision = pickSupported(model.capabilities?.image_input);
  const pdf = pickSupported(model.capabilities?.pdf_input);
  const codeExecution = pickSupported(model.capabilities?.code_execution);
  const citations = pickSupported(model.capabilities?.citations);
  const structuredOutputs = pickSupported(model.capabilities?.structured_outputs);
  const thinking = Boolean(model.capabilities?.thinking?.supported);

  return {
    provider: "Anthropic",
    model_id: model.id,
    model_name: model.display_name || model.id,

    specialty: null,

    context_window: model.max_input_tokens || null,
    max_output_tokens: model.max_tokens || null,

    pricing: {
      type: "unknown",
      input_price_per_1m_tokens: null,
      output_price_per_1m_tokens: null,
      note:
        "Pricing is not provided by the Models API. Refer to Anthropic pricing page.",
      examples: [],
    },

    rate_limits: {
      type: "unknown",
      rpm: null,
      tpm: null,
      rpd: null,
      note:
        "Rate limits are not exposed via the Models API and depend on account tier.",
    },

    capabilities: {
      text: true,
      vision,
      audio: null,
      code: codeExecution,
      function_calling: structuredOutputs || codeExecution,
      reasoning_level: thinking ? "high" : null,
      citations,
      pdf_input: pdf,
      structured_outputs: structuredOutputs,
      code_execution: codeExecution,
      thinking,
    },

    availability: "api",
    data_quality: "official",
    source_url: ANTHROPIC_SOURCE_URL,

    last_updated: model.created_at || null,
    last_verified: toIsoNow(),

    notes:
      "Official metadata from Anthropic Models API. Pricing and rate limits not included.",

    raw: model,
  };
}

async function fetchAnthropicPage(apiKey, afterId, limit = 1000) {
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
      `Anthropic API failed (${res.status}): ${body.slice(0, 300)}`
    );
  }

  return await res.json();
}

export async function fetchAnthropicModels() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const seenPages = new Set();
  const all = [];

  let afterId;

  while (true) {
    const page = await fetchAnthropicPage(apiKey, afterId, 1000);

    if (Array.isArray(page.data)) {
      all.push(...page.data);
    }

    if (!page.has_more || !page.last_id) break;

    if (seenPages.has(page.last_id)) {
      throw new Error("Pagination loop detected");
    }

    seenPages.add(page.last_id);
    afterId = page.last_id;
  }

  // 🔥 dedupe by model_id
  const unique = new Map();

  for (const model of all) {
    const normalized = normalizeAnthropicModel(model);
    unique.set(normalized.model_id, normalized);
  }

  return [...unique.values()];
}
