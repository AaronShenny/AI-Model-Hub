/**
 * Gemini model fetcher.
 *
 * Simulates structured extraction from provider docs.
 * This keeps the output stable when APIs are unavailable.
 */
export async function fetchGeminiModels() {
  return [
    { model_id: "gemini-2.5-pro", model_name: "Gemini 2.5 Pro", provider: "Google" },
    { model_id: "gemini-2.5-flash", model_name: "Gemini 2.5 Flash", provider: "Google" },
    { model_id: "gemini-2.0-flash", model_name: "Gemini 2.0 Flash", provider: "Google" },
  ];
}
