/**
 * Anthropic model fetcher.
 *
 * Set SIMULATE_ANTHROPIC_FAILURE=1 to test fail-safe execution.
 */
export async function fetchAnthropicModels() {
  if (process.env.SIMULATE_ANTHROPIC_FAILURE === "1") {
    throw new Error("Simulated Anthropic source failure");
  }

  return [
    { model_id: "claude-opus-4-1", model_name: "Claude Opus 4.1", provider: "Anthropic" },
    { model_id: "claude-sonnet-4-5", model_name: "Claude Sonnet 4.5", provider: "Anthropic" },
    { model_id: "claude-3-7-sonnet", model_name: "Claude 3.7 Sonnet", provider: "Anthropic" },
  ];
}
