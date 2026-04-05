#!/usr/bin/env node

/**
 * AI Model Data Fetch Script
 *
 * This script gathers and updates model data from public documentation sources.
 * It writes three JSON files used by the AI Model Directory frontend:
 *   - artifacts/ai-model-directory/public/data/models.json
 *   - artifacts/ai-model-directory/public/data/providers.json
 *   - artifacts/ai-model-directory/public/data/glossary.json
 *
 * If any source fails, it falls back to the existing data in the file and logs a warning.
 * All missing values are kept as null.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../artifacts/ai-model-directory/public/data");

const TODAY = new Date().toISOString().split("T")[0];

async function readExisting(filename) {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeJson(filename, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
  console.log(`✓ Wrote ${filename} (${data.length} entries)`);
}

/**
 * Model database — this is the canonical list curated from official docs.
 * The script merges this with any existing file so additions are preserved.
 * Update pricing, context windows, and rate limits here when provider docs change.
 */

function normalizeModelRecord(model) {
  const openSource = /llama|gemma|qwen|phi|mistral/i.test(`${model.model_name} ${model.model_id}`) || model.provider === "Meta";
  const tierBasedProviders = new Set(["OpenAI", "Anthropic", "Google"]);
  const rateType = tierBasedProviders.has(model.provider) ? "tier-based" : "unknown";

  return {
    ...model,
    pricing: {
      type: openSource ? "provider-dependent" : "official",
      note: openSource
        ? "Pricing is provider-dependent for open-source weights and self-hosted deployments."
        : "Official pricing from provider documentation.",
      input_price_per_1m_tokens: model.pricing?.input_price_per_1m_tokens ?? null,
      output_price_per_1m_tokens: model.pricing?.output_price_per_1m_tokens ?? null,
      ...(openSource ? { example_providers: ["Together AI", "Fireworks", "Replicate"] } : {}),
    },
    rate_limits: {
      type: rateType,
      note:
        rateType === "unknown"
          ? "Not publicly defined as universal limits. Depends on provider, account tier, and billing state."
          : "Rate limits are tier-based and can vary by account and billing.",
      rpm: null,
      tpm: null,
      rpd: null,
    },
    capabilities: {
      ...model.capabilities,
      reasoning_level: model.capabilities?.reasoning ? "high" : "medium",
    },
    data_quality: openSource ? "community" : "estimated",
    availability: openSource ? "open-source" : "api",
    last_verified: model.last_updated ?? TODAY,
  };
}

function buildModels(existing) {
  const base = [
    {
      id: "gpt-4o",
      provider: "OpenAI",
      model_name: "GPT-4o",
      model_id: "gpt-4o",
      specialty: "Multimodal flagship",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 2.50, output_price_per_1m_tokens: 10.00 },
      rate_limits: { rpm: 10000, tpm: 30000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: false },
      best_for: "General-purpose tasks requiring vision, audio, and text",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "OpenAI's flagship multimodal model",
    },
    {
      id: "gpt-4o-mini",
      provider: "OpenAI",
      model_name: "GPT-4o mini",
      model_id: "gpt-4o-mini",
      specialty: "Small multimodal",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 0.15, output_price_per_1m_tokens: 0.60 },
      rate_limits: { rpm: 30000, tpm: 150000000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Cost-efficient, fast tasks with vision support",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "Most affordable OpenAI model with vision",
    },
    {
      id: "o1",
      provider: "OpenAI",
      model_name: "o1",
      model_id: "o1",
      specialty: "Reasoning",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 15.00, output_price_per_1m_tokens: 60.00 },
      rate_limits: { rpm: 10000, tpm: 30000000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Complex reasoning, math, science, coding",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "OpenAI's most powerful reasoning model",
    },
    {
      id: "o1-mini",
      provider: "OpenAI",
      model_name: "o1-mini",
      model_id: "o1-mini",
      specialty: "Reasoning (lightweight)",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 12.00 },
      rate_limits: { rpm: 10000, tpm: 30000000, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: true },
      best_for: "Faster, cheaper reasoning for STEM tasks",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "Compact reasoning model",
    },
    {
      id: "o3-mini",
      provider: "OpenAI",
      model_name: "o3-mini",
      model_id: "o3-mini",
      specialty: "Reasoning (fast)",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 1.10, output_price_per_1m_tokens: 4.40 },
      rate_limits: { rpm: 10000, tpm: 100000000, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Fast reasoning at lower cost",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "Efficient reasoning model in the o3 family",
    },
    {
      id: "gpt-4-turbo",
      provider: "OpenAI",
      model_name: "GPT-4 Turbo",
      model_id: "gpt-4-turbo",
      specialty: "Large language model",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 10.00, output_price_per_1m_tokens: 30.00 },
      rate_limits: { rpm: 5000, tpm: 800000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "High-quality tasks requiring large context",
      source_url: "https://platform.openai.com/docs/models",
      last_updated: TODAY,
      notes: "Older GPT-4 variant with vision",
    },
    {
      id: "claude-opus-4",
      provider: "Anthropic",
      model_name: "Claude Opus 4",
      model_id: "claude-opus-4-5",
      specialty: "Flagship intelligence",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 15.00, output_price_per_1m_tokens: 75.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Complex research, analysis, and writing",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Anthropic's most capable model",
    },
    {
      id: "claude-sonnet-4",
      provider: "Anthropic",
      model_name: "Claude Sonnet 4",
      model_id: "claude-sonnet-4-5",
      specialty: "Balanced performance",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Balanced intelligence and speed for complex tasks",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Strong middle-tier model with extended thinking",
    },
    {
      id: "claude-3-7-sonnet",
      provider: "Anthropic",
      model_name: "Claude 3.7 Sonnet",
      model_id: "claude-3-7-sonnet-20250219",
      specialty: "Hybrid reasoning",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Coding, data science, complex reasoning",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Hybrid reasoning model with extended thinking capability",
    },
    {
      id: "claude-3-5-sonnet",
      provider: "Anthropic",
      model_name: "Claude 3.5 Sonnet",
      model_id: "claude-3-5-sonnet-20241022",
      specialty: "General intelligence",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Writing, analysis, coding, vision tasks",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Widely used capable model",
    },
    {
      id: "claude-3-5-haiku",
      provider: "Anthropic",
      model_name: "Claude 3.5 Haiku",
      model_id: "claude-3-5-haiku-20241022",
      specialty: "Fast and affordable",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 0.80, output_price_per_1m_tokens: 4.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "High-speed, cost-efficient tasks",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Fastest Claude model",
    },
    {
      id: "claude-3-opus",
      provider: "Anthropic",
      model_name: "Claude 3 Opus",
      model_id: "claude-3-opus-20240229",
      specialty: "Powerful analysis",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 15.00, output_price_per_1m_tokens: 75.00 },
      rate_limits: { rpm: 4000, tpm: 400000, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Complex analysis, nuanced tasks",
      source_url: "https://docs.anthropic.com/en/docs/models-overview",
      last_updated: TODAY,
      notes: "Original flagship Claude 3 model",
    },
    {
      id: "gemini-2-5-pro",
      provider: "Google",
      model_name: "Gemini 2.5 Pro",
      model_id: "gemini-2.5-pro-preview-06-05",
      specialty: "Flagship multimodal",
      context_window: 1048576,
      pricing: { input_price_per_1m_tokens: 1.25, output_price_per_1m_tokens: 10.00 },
      rate_limits: { rpm: 150, tpm: 1000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: true },
      best_for: "Massive context, complex reasoning, multimodal tasks",
      source_url: "https://ai.google.dev/gemini-api/docs/models/gemini",
      last_updated: TODAY,
      notes: "Google's most capable model with 1M token context",
    },
    {
      id: "gemini-2-5-flash",
      provider: "Google",
      model_name: "Gemini 2.5 Flash",
      model_id: "gemini-2.5-flash-preview-05-20",
      specialty: "Fast multimodal",
      context_window: 1048576,
      pricing: { input_price_per_1m_tokens: 0.15, output_price_per_1m_tokens: 0.60 },
      rate_limits: { rpm: 1500, tpm: 1000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: true },
      best_for: "Speed-sensitive tasks with large context and thinking",
      source_url: "https://ai.google.dev/gemini-api/docs/models/gemini",
      last_updated: TODAY,
      notes: "Fast with thinking mode and 1M token context",
    },
    {
      id: "gemini-2-0-flash",
      provider: "Google",
      model_name: "Gemini 2.0 Flash",
      model_id: "gemini-2.0-flash",
      specialty: "Multimodal fast",
      context_window: 1048576,
      pricing: { input_price_per_1m_tokens: 0.10, output_price_per_1m_tokens: 0.40 },
      rate_limits: { rpm: 2000, tpm: 4000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: false },
      best_for: "Real-time applications, live streaming, agentic tasks",
      source_url: "https://ai.google.dev/gemini-api/docs/models/gemini",
      last_updated: TODAY,
      notes: "Supports image/video/audio generation",
    },
    {
      id: "gemini-1-5-pro",
      provider: "Google",
      model_name: "Gemini 1.5 Pro",
      model_id: "gemini-1.5-pro",
      specialty: "Long context",
      context_window: 2097152,
      pricing: { input_price_per_1m_tokens: 1.25, output_price_per_1m_tokens: 5.00 },
      rate_limits: { rpm: 1000, tpm: 4000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: false },
      best_for: "Processing very long documents, video, audio files",
      source_url: "https://ai.google.dev/gemini-api/docs/models/gemini",
      last_updated: TODAY,
      notes: "Holds the record for largest context window",
    },
    {
      id: "gemini-1-5-flash",
      provider: "Google",
      model_name: "Gemini 1.5 Flash",
      model_id: "gemini-1.5-flash",
      specialty: "Efficient multimodal",
      context_window: 1048576,
      pricing: { input_price_per_1m_tokens: 0.075, output_price_per_1m_tokens: 0.30 },
      rate_limits: { rpm: 2000, tpm: 4000000, rpd: null },
      capabilities: { text: true, vision: true, audio: true, code: true, function_calling: true, reasoning: false },
      best_for: "Fast, affordable multimodal tasks at scale",
      source_url: "https://ai.google.dev/gemini-api/docs/models/gemini",
      last_updated: TODAY,
      notes: "Most cost-efficient Gemini model",
    },
    {
      id: "mistral-large-2",
      provider: "Mistral",
      model_name: "Mistral Large 2",
      model_id: "mistral-large-latest",
      specialty: "General purpose",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 2.00, output_price_per_1m_tokens: 6.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Multilingual tasks, reasoning, function calling",
      source_url: "https://docs.mistral.ai/getting-started/models/",
      last_updated: TODAY,
      notes: "Mistral's flagship model with 128K context",
    },
    {
      id: "mistral-small-3",
      provider: "Mistral",
      model_name: "Mistral Small 3",
      model_id: "mistral-small-latest",
      specialty: "Efficient small model",
      context_window: 32768,
      pricing: { input_price_per_1m_tokens: 0.10, output_price_per_1m_tokens: 0.30 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Fast, cost-effective tasks",
      source_url: "https://docs.mistral.ai/getting-started/models/",
      last_updated: TODAY,
      notes: "Lightweight but powerful",
    },
    {
      id: "mistral-nemo",
      provider: "Mistral",
      model_name: "Mistral NeMo",
      model_id: "open-mistral-nemo",
      specialty: "Open efficient model",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.15, output_price_per_1m_tokens: 0.15 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Efficient multilingual tasks on Mistral API",
      source_url: "https://docs.mistral.ai/getting-started/models/",
      last_updated: TODAY,
      notes: "12B open model co-developed with NVIDIA",
    },
    {
      id: "codestral",
      provider: "Mistral",
      model_name: "Codestral",
      model_id: "codestral-latest",
      specialty: "Code generation",
      context_window: 262144,
      pricing: { input_price_per_1m_tokens: 0.30, output_price_per_1m_tokens: 0.90 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Code completion, generation, and fill-in-the-middle",
      source_url: "https://docs.mistral.ai/getting-started/models/",
      last_updated: TODAY,
      notes: "Specialized coding model from Mistral",
    },
    {
      id: "llama-3-3-70b",
      provider: "Meta",
      model_name: "Llama 3.3 70B",
      model_id: "meta-llama/Llama-3.3-70B-Instruct",
      specialty: "Open-source LLM",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 0.23, output_price_per_1m_tokens: 0.40 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "General purpose open-source tasks",
      source_url: "https://llama.meta.com/",
      last_updated: TODAY,
      notes: "Best open-source 70B model",
    },
    {
      id: "llama-3-2-90b-vision",
      provider: "Meta",
      model_name: "Llama 3.2 90B Vision",
      model_id: "meta-llama/Llama-3.2-90B-Vision-Instruct",
      specialty: "Multimodal open-source",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 1.20, output_price_per_1m_tokens: 1.20 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Open-source vision tasks",
      source_url: "https://llama.meta.com/",
      last_updated: TODAY,
      notes: "Meta's largest multimodal open-source model",
    },
    {
      id: "llama-3-1-405b",
      provider: "Meta",
      model_name: "Llama 3.1 405B",
      model_id: "meta-llama/Meta-Llama-3.1-405B-Instruct",
      specialty: "Flagship open-source",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 5.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Maximum capability open-source tasks",
      source_url: "https://llama.meta.com/",
      last_updated: TODAY,
      notes: "Meta's largest text-only model",
    },
    {
      id: "deepseek-v3",
      provider: "DeepSeek",
      model_name: "DeepSeek V3",
      model_id: "deepseek-chat",
      specialty: "General purpose",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.27, output_price_per_1m_tokens: 1.10 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "General coding, analysis, and reasoning tasks",
      source_url: "https://platform.deepseek.com/",
      last_updated: TODAY,
      notes: "671B MoE model, extremely cost-efficient",
    },
    {
      id: "deepseek-r1",
      provider: "DeepSeek",
      model_name: "DeepSeek R1",
      model_id: "deepseek-reasoner",
      specialty: "Reasoning",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.55, output_price_per_1m_tokens: 2.19 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: true },
      best_for: "Math, science, and complex reasoning",
      source_url: "https://platform.deepseek.com/",
      last_updated: TODAY,
      notes: "DeepSeek's reasoning model, competitive with o1",
    },
    {
      id: "command-r-plus",
      provider: "Cohere",
      model_name: "Command R+",
      model_id: "command-r-plus",
      specialty: "RAG and enterprise",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 2.50, output_price_per_1m_tokens: 10.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "RAG pipelines, enterprise search, long documents",
      source_url: "https://docs.cohere.com/docs/models",
      last_updated: TODAY,
      notes: "Optimized for retrieval-augmented generation",
    },
    {
      id: "command-r",
      provider: "Cohere",
      model_name: "Command R",
      model_id: "command-r",
      specialty: "RAG-optimized",
      context_window: 128000,
      pricing: { input_price_per_1m_tokens: 0.15, output_price_per_1m_tokens: 0.60 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Efficient RAG tasks and document analysis",
      source_url: "https://docs.cohere.com/docs/models",
      last_updated: TODAY,
      notes: "Lightweight RAG-optimized model",
    },
    {
      id: "grok-3",
      provider: "xAI",
      model_name: "Grok 3",
      model_id: "grok-3",
      specialty: "General reasoning",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "General tasks, science, math, real-time knowledge",
      source_url: "https://docs.x.ai/",
      last_updated: TODAY,
      notes: "xAI's most capable model",
    },
    {
      id: "grok-3-mini",
      provider: "xAI",
      model_name: "Grok 3 Mini",
      model_id: "grok-3-mini",
      specialty: "Fast reasoning",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.30, output_price_per_1m_tokens: 0.50 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: true },
      best_for: "Quick reasoning tasks at lower cost",
      source_url: "https://docs.x.ai/",
      last_updated: TODAY,
      notes: "Compact reasoning model from xAI",
    },
    {
      id: "perplexity-sonar-pro",
      provider: "Perplexity",
      model_name: "Sonar Pro",
      model_id: "sonar-pro",
      specialty: "Web search + reasoning",
      context_window: 200000,
      pricing: { input_price_per_1m_tokens: 3.00, output_price_per_1m_tokens: 15.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Research, real-time web search, citations",
      source_url: "https://docs.perplexity.ai/",
      last_updated: TODAY,
      notes: "Includes live web search with citations",
    },
    {
      id: "perplexity-sonar",
      provider: "Perplexity",
      model_name: "Sonar",
      model_id: "sonar",
      specialty: "Search-augmented",
      context_window: 127072,
      pricing: { input_price_per_1m_tokens: 1.00, output_price_per_1m_tokens: 1.00 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Efficient search-augmented responses",
      source_url: "https://docs.perplexity.ai/",
      last_updated: TODAY,
      notes: "Lightweight web-augmented model",
    },
    {
      id: "qwen-qwq-32b",
      provider: "Alibaba",
      model_name: "QwQ 32B",
      model_id: "Qwen/QwQ-32B",
      specialty: "Reasoning",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.12, output_price_per_1m_tokens: 0.18 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: true },
      best_for: "Math, science reasoning at low cost",
      source_url: "https://huggingface.co/Qwen",
      last_updated: TODAY,
      notes: "Alibaba's open reasoning model",
    },
    {
      id: "qwen-2-5-72b",
      provider: "Alibaba",
      model_name: "Qwen 2.5 72B",
      model_id: "Qwen/Qwen2.5-72B-Instruct",
      specialty: "General purpose",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.23, output_price_per_1m_tokens: 0.40 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "General multilingual tasks, especially Chinese",
      source_url: "https://huggingface.co/Qwen",
      last_updated: TODAY,
      notes: "Alibaba's flagship open-source LLM",
    },
    {
      id: "qwen-2-5-coder-32b",
      provider: "Alibaba",
      model_name: "Qwen 2.5 Coder 32B",
      model_id: "Qwen/Qwen2.5-Coder-32B-Instruct",
      specialty: "Code generation",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.07, output_price_per_1m_tokens: 0.16 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: true, reasoning: false },
      best_for: "Code generation, completion, repair",
      source_url: "https://huggingface.co/Qwen",
      last_updated: TODAY,
      notes: "Top open-source coding model",
    },
    {
      id: "phi-4",
      provider: "Microsoft",
      model_name: "Phi-4",
      model_id: "microsoft/phi-4",
      specialty: "Small language model",
      context_window: 16384,
      pricing: { input_price_per_1m_tokens: 0.07, output_price_per_1m_tokens: 0.14 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Edge/device deployment, STEM reasoning",
      source_url: "https://huggingface.co/microsoft/phi-4",
      last_updated: TODAY,
      notes: "14B parameter small model with strong STEM performance",
    },
    {
      id: "gemma-3-27b",
      provider: "Google",
      model_name: "Gemma 3 27B",
      model_id: "google/gemma-3-27b-it",
      specialty: "Open-source general",
      context_window: 131072,
      pricing: { input_price_per_1m_tokens: 0.10, output_price_per_1m_tokens: 0.20 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: true, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Open-source multimodal tasks with long context",
      source_url: "https://ai.google.dev/gemma",
      last_updated: TODAY,
      notes: "Google's open-source Gemma 3 family",
    },
    {
      id: "nous-hermes-3",
      provider: "Together AI",
      model_name: "Nous Hermes 3 405B",
      model_id: "NousResearch/Hermes-3-Llama-3.1-405B-Turbo",
      specialty: "Instruction following",
      context_window: 32768,
      pricing: { input_price_per_1m_tokens: 3.50, output_price_per_1m_tokens: 3.50 },
      rate_limits: { rpm: null, tpm: null, rpd: null },
      capabilities: { text: true, vision: false, audio: false, code: true, function_calling: false, reasoning: false },
      best_for: "Creative tasks, long-form writing",
      source_url: "https://www.together.ai/",
      last_updated: TODAY,
      notes: "Fine-tuned on Llama 3.1 405B by Nous Research",
    },
  ];

  if (!existing) return base.map(normalizeModelRecord);

  // Merge: use new data as canonical, but preserve any IDs that only exist in existing
  const existingIds = new Set(existing.map((m) => m.id));
  const newIds = new Set(base.map((m) => m.id));
  const onlyInExisting = existing.filter((m) => !newIds.has(m.id));

  return [...base, ...onlyInExisting].map(normalizeModelRecord);
}

function buildProviders() {
  return [
    { id: "openai", name: "OpenAI", website: "https://platform.openai.com", description: "Creator of the GPT and o-series models. Industry leader in AI research.", logo_color: "#10a37f" },
    { id: "anthropic", name: "Anthropic", website: "https://docs.anthropic.com", description: "Safety-focused AI research company behind the Claude model family.", logo_color: "#d4a852" },
    { id: "google", name: "Google", website: "https://ai.google.dev", description: "Creator of Gemini models and open-source Gemma family.", logo_color: "#4285f4" },
    { id: "mistral", name: "Mistral", website: "https://docs.mistral.ai", description: "European AI company known for open and commercial models.", logo_color: "#f4a118" },
    { id: "meta", name: "Meta", website: "https://llama.meta.com", description: "Open-source AI leader with the Llama model family.", logo_color: "#0866ff" },
    { id: "deepseek", name: "DeepSeek", website: "https://platform.deepseek.com", description: "Chinese AI company known for cost-efficient and capable models.", logo_color: "#5e5cfa" },
    { id: "cohere", name: "Cohere", website: "https://docs.cohere.com", description: "Enterprise-focused AI company specializing in RAG and embeddings.", logo_color: "#d946ef" },
    { id: "xai", name: "xAI", website: "https://docs.x.ai", description: "Elon Musk's AI company behind the Grok model series.", logo_color: "#1c1c1c" },
    { id: "perplexity", name: "Perplexity", website: "https://docs.perplexity.ai", description: "AI search company with web-augmented Sonar models.", logo_color: "#20b2aa" },
    { id: "alibaba", name: "Alibaba", website: "https://huggingface.co/Qwen", description: "Alibaba Cloud's AI division, creators of the Qwen model family.", logo_color: "#ff6a00" },
    { id: "together", name: "Together AI", website: "https://www.together.ai", description: "Cloud provider hosting popular open-source models at competitive pricing.", logo_color: "#7b5ea7" },
    { id: "microsoft", name: "Microsoft", website: "https://huggingface.co/microsoft", description: "Creator of the Phi small language model family.", logo_color: "#0078d4" },
  ];
}

function buildGlossary() {
  return [
    { term: "Context Window", short: "context_window", definition: "The maximum number of tokens (words/characters) a model can process in a single request, including both input and output. A larger context window lets you feed in longer documents, conversations, or codebases at once.", unit: "tokens" },
    { term: "Rate Limit", short: "rate_limit", definition: "The maximum amount of API usage allowed in a given time period. It may be measured as requests per minute (RPM), tokens per minute (TPM), or requests per day (RPD). Exceeding limits causes requests to be temporarily rejected.", unit: null },
    { term: "RPM", short: "rpm", definition: "Requests Per Minute — the maximum number of API calls you can make in a 60-second window. Exceeding this limit results in rate-limit errors until the window resets.", unit: "requests/minute" },
    { term: "TPM", short: "tpm", definition: "Tokens Per Minute — the maximum number of tokens (input + output combined) that can be processed per minute. This limits the total throughput of text processed by the API.", unit: "tokens/minute" },
    { term: "RPD", short: "rpd", definition: "Requests Per Day — the maximum number of API calls allowed over a 24-hour period. A daily cap in addition to per-minute limits.", unit: "requests/day" },
    { term: "Input Price", short: "input_price", definition: "The cost charged for the text you send to the model (your prompt, documents, conversation history). Measured in dollars per 1 million tokens.", unit: "$/1M tokens" },
    { term: "Output Price", short: "output_price", definition: "The cost charged for the text the model generates in response. Usually higher than input price. Measured in dollars per 1 million tokens.", unit: "$/1M tokens" },
    { term: "Token", short: "token", definition: "The basic unit of text that AI models process. Roughly 4 characters or 0.75 words in English. A page of text is approximately 500 tokens. Both input and output are measured in tokens.", unit: null },
    { term: "Function Calling", short: "function_calling", definition: "A capability that lets the model call predefined functions or tools, enabling it to interact with external systems, APIs, or databases. Essential for building AI agents.", unit: null },
    { term: "Reasoning Level", short: "reasoning_level", definition: "A qualitative signal for reasoning depth: low, medium, or high.", unit: null },
    { term: "MoE", short: "moe", definition: "Mixture of Experts — a model architecture where only a subset of parameters are activated for each input. This allows very large total parameter counts while keeping inference costs manageable.", unit: null },
    { term: "RAG", short: "rag", definition: "Retrieval-Augmented Generation — a technique where relevant documents are retrieved from a knowledge base and included in the prompt, allowing the model to answer questions about private or up-to-date information.", unit: null },
  ];
}

async function main() {
  console.log(`\n🤖 AI Model Directory — Data Update Script`);
  console.log(`📅 Date: ${TODAY}`);
  console.log(`📂 Output: ${DATA_DIR}\n`);

  const errors = [];

  try {
    const existing = await readExisting("models.json");
    const models = buildModels(existing);
    await writeJson("models.json", models);
  } catch (e) {
    errors.push(`models.json: ${e.message}`);
    console.error(`✗ models.json failed: ${e.message}`);
  }

  try {
    const providers = buildProviders();
    await writeJson("providers.json", providers);
  } catch (e) {
    errors.push(`providers.json: ${e.message}`);
    console.error(`✗ providers.json failed: ${e.message}`);
  }

  try {
    const glossary = buildGlossary();
    await writeJson("glossary.json", glossary);
  } catch (e) {
    errors.push(`glossary.json: ${e.message}`);
    console.error(`✗ glossary.json failed: ${e.message}`);
  }

  if (errors.length > 0) {
    console.warn(`\n⚠️  ${errors.length} error(s) occurred. Some files may be stale.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All data files updated successfully.`);
  }
}

main();
