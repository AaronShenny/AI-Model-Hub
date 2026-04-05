/**
 * Real OpenAI model fetcher using the official Models API.
 */

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";
const OPENAI_SOURCE_URL = "https://platform.openai.com/docs/api-reference/models";

function toIso(ts) {
  return typeof ts === "number" ? new Date(ts * 1000).toISOString() : null;
}

function inferSpecialty(modelId) {
  const id = modelId.toLowerCase();

  if (id.startsWith("o")) return "reasoning";
  if (id.includes("4o")) return "multimodal";
  if (id.includes("mini")) return "efficient";
  if (id.includes("embedding")) return "embeddings";
  if (id.includes("audio")) return "audio";
  if (id.includes("image")) return "image";

  return null;
}

function inferCapabilities(modelId) {
  const id = modelId.toLowerCase();
  const isReasoning = id.startsWith("o");
  const isMultimodal = id.includes("4o") || id.includes("omni");

  return {
    text: true,
    vision: isMultimodal || id.includes("vision"),
    audio: id.includes("audio"),
    code: true,
    function_calling: true,
    reasoning_level: isReasoning ? "high" : "medium",
  };
}

function normalizeOpenAIModel(model) {
  const id = model.id;

  return {
    provider: "OpenAI",
    model_id: id,
    model_name: id,

    specialty: inferSpecialty(id),

    context_window: null,
    max_output_tokens: null,

    pricing: {
      type: "unknown",
      input_price_per_1m_tokens: null,
      output_price_per_1m_tokens: null,
      note:
        "Pricing is not returned by the OpenAI Models API. Refer to official pricing page.",
      examples: [],
    },

    rate_limits: {
      type: "unknown",
      rpm: null,
      tpm: null,
      rpd: null,
      note:
        "Rate limits vary by account tier and are not exposed via the models API.",
    },

    capabilities: inferCapabilities(id),

    availability: "api",
    data_quality: "official",
    source_url: OPENAI_SOURCE_URL,

    last_updated: toIso(model.created),
    last_verified: new Date().toISOString(),

    notes: `Owned by ${model.owned_by || "OpenAI"}`,
    raw: model,
  };
}

export async function fetchOpenAIModels() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const res = await fetch(OPENAI_MODELS_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `OpenAI Models API failed (${res.status} ${res.statusText}): ${body.slice(0, 300)}`
    );
  }

  const json = await res.json();
  const models = Array.isArray(json.data) ? json.data : [];

  const mapped = models.map(normalizeOpenAIModel);

  // 🔥 Better dedupe using model_id
  const unique = new Map();
  for (const model of mapped) {
    unique.set(model.model_id, model);
  }

  return [...unique.values()];
}
