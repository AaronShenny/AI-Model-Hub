#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchOpenAIModels } from "./providers/openai.js";
import { fetchGeminiModels } from "./providers/gemini.js";
import { fetchAnthropicModels } from "./providers/anthropic.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_PATH = path.resolve(
  __dirname,
  "../artifacts/ai-model-directory/public/data/models.json",
);
const TODAY = new Date().toISOString().split("T")[0];
const NOW_ISO = () => new Date().toISOString();

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

function normalize(str) {
  return String(str ?? "")
    .toLowerCase()
    .replace(/[\s._]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .trim();
}

function isSameModel(a, b) {
  return normalize(a.model_name) === normalize(b.model_name) && normalize(a.provider) === normalize(b.provider);
}

function buildDiscoveredModelTemplate(discovered) {
  return {
    id: discovered.model_id,
    model_id: discovered.model_id,
    model_name: discovered.model_name,
    provider: discovered.provider,
    specialty: "Unverified",
    context_window: null,
    data_quality: "unknown",
    is_new: true,
    pricing: {
      type: "unknown",
      input_price_per_1m_tokens: null,
      output_price_per_1m_tokens: null,
      note: "Not yet verified",
    },
    rate_limits: {
      type: "unknown",
      rpm: null,
      tpm: null,
      rpd: null,
      note: "Not publicly defined",
    },
    capabilities: {
      text: false,
      vision: false,
      audio: false,
      code: false,
      function_calling: false,
      reasoning_level: "unknown",
    },
    availability: "api",
    best_for: null,
    reasoning_level: "unknown",
    last_verified: NOW_ISO(),
    source_url: null,
    last_updated: TODAY,
    notes: "Auto-discovered model. Needs verification.",
  };
}

function normalizeExistingModel(model) {
  return {
    ...model,
    id: model.id ?? model.model_id,
    model_id: model.model_id ?? model.id,
    data_quality: model.data_quality ?? "unknown",
    last_verified: model.last_verified ?? null,
    notes: model.notes ?? null,
    is_new: model.is_new ?? false,
  };
}

function mergeModel(existingModel, discoveredModel) {
  const merged = { ...existingModel };
  merged.last_verified = NOW_ISO();
  merged.is_new = false;

  if (isMissing(merged.model_id)) {
    merged.model_id = discoveredModel.model_id;
  }

  if (isMissing(merged.id)) {
    merged.id = merged.model_id;
  }

  if (isMissing(merged.model_name)) {
    merged.model_name = discoveredModel.model_name;
  }

  if (isMissing(merged.provider)) {
    merged.provider = discoveredModel.provider;
  }

  if (isMissing(merged.context_window) && !isMissing(discoveredModel.context_window)) {
    merged.context_window = discoveredModel.context_window;
  }

  if (isMissing(merged.capabilities) && !isMissing(discoveredModel.capabilities)) {
    merged.capabilities = discoveredModel.capabilities;
  }

  return merged;
}

async function safelyFetch(label, fetcher) {
  try {
    const models = await fetcher();
    return { label, models, error: null };
  } catch (error) {
    return {
      label,
      models: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function safeSortByProviderAndName(models) {
  return [...models].sort((a, b) => {
    const providerCmp = String(a.provider).localeCompare(String(b.provider));
    if (providerCmp !== 0) {
      return providerCmp;
    }
    return String(a.model_name).localeCompare(String(b.model_name));
  });
}

async function saveJsonSafely(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = `${filePath}.tmp`;

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}

async function main() {
  const existingRawModels = await readJsonArray(MODELS_PATH);
  const existingModels = existingRawModels.map(normalizeExistingModel);

  const fetchResults = await Promise.all([
    safelyFetch("OpenAI", fetchOpenAIModels),
    safelyFetch("Gemini", fetchGeminiModels),
    safelyFetch("Anthropic", fetchAnthropicModels),
  ]);

  for (const result of fetchResults) {
    if (result.error) {
      console.error(`[ERROR] ${result.label} fetch failed: ${result.error}`);
    }
  }

  const discoveredModels = fetchResults
    .flatMap((result) => result.models)
    .filter((model) => model?.model_id && model?.model_name && model?.provider);

  // Deduplicate discovered models by normalized provider+name identity.
  const discoveredById = new Map();
  for (const model of discoveredModels) {
    const key = `${normalize(model.provider)}::${normalize(model.model_name)}`;
    if (!discoveredById.has(key)) {
      discoveredById.set(key, model);
    }
  }

  const mergedModels = [...existingModels];

  let newCount = 0;
  let mergedCount = 0;

  for (const discovered of discoveredById.values()) {
    const existing = mergedModels.find((model) => isSameModel(model, discovered));

    if (!existing) {
      mergedModels.push(buildDiscoveredModelTemplate(discovered));
      newCount += 1;
      console.log(`[NEW] ${discovered.model_name}`);
      continue;
    }

    const merged = mergeModel(existing, discovered);
    const existingIndex = mergedModels.findIndex((m) => isSameModel(m, discovered));
    if (existingIndex !== -1) {
      mergedModels[existingIndex] = merged;
      mergedCount += 1;
      console.log(`[MERGED] ${discovered.model_name}`);
    }
  }

  const uniqueModels = [];
  for (const model of mergedModels) {
    const alreadyExists = uniqueModels.some((u) => isSameModel(u, model));
    if (!alreadyExists) {
      uniqueModels.push(model);
    } else {
      console.log(`[DEDUPED] ${model.model_name}`);
    }
  }

  const sortedModels = safeSortByProviderAndName(uniqueModels);

  await saveJsonSafely(MODELS_PATH, sortedModels);

  console.log(`\nDone. Total models: ${sortedModels.length}`);
  console.log(`New models: ${newCount}`);
  console.log(`Merged models: ${mergedCount}`);
  console.log(`Failed sources: ${fetchResults.filter((r) => r.error).length}`);
}

main().catch((error) => {
  console.error(`[ERROR] Unexpected script failure: ${error instanceof Error ? error.stack : String(error)}`);
  process.exitCode = 1;
});
