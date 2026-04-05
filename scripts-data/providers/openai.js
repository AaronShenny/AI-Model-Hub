/**
 * OpenAI model fetcher.
 *
 * In production, replace the static payload with a call to
 * https://platform.openai.com/docs/models (or API metadata endpoint).
 */
export async function fetchOpenAIModels() {
  return [
    { model_id: "gpt-4o", model_name: "GPT-4o", provider: "OpenAI" },
    { model_id: "gpt-4o-mini", model_name: "GPT-4o mini", provider: "OpenAI" },
    { model_id: "gpt-4.1", model_name: "GPT-4.1", provider: "OpenAI" },
    { model_id: "o3", model_name: "o3", provider: "OpenAI" },
    { model_id: "o4-mini", model_name: "o4-mini", provider: "OpenAI" },
  ];
}
