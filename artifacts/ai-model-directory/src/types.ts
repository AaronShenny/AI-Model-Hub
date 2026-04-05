export interface ModelPricing {
  input_price_per_1m_tokens: number | null;
  output_price_per_1m_tokens: number | null;
}

export interface ModelRateLimits {
  rpm: number | null;
  tpm: number | null;
  rpd: number | null;
}

export interface ModelCapabilities {
  text: boolean;
  vision: boolean;
  audio: boolean;
  code: boolean;
  function_calling: boolean;
  reasoning: boolean;
}

export interface AIModel {
  id: string;
  provider: string;
  model_name: string;
  model_id: string;
  specialty: string;
  context_window: number | null;
  pricing: ModelPricing;
  rate_limits: ModelRateLimits;
  capabilities: ModelCapabilities;
  best_for: string | null;
  source_url: string | null;
  last_updated: string | null;
  notes: string | null;
}

export interface Provider {
  id: string;
  name: string;
  website: string;
  description: string;
  logo_color: string;
}

export interface GlossaryEntry {
  term: string;
  short: string;
  definition: string;
  unit: string | null;
}

export type SortOption = "cheapest" | "largest_context" | "newest" | "provider" | "name";

export interface FilterState {
  search: string;
  providers: string[];
  capabilities: string[];
  priceRange: [number | null, number | null];
  minContext: number | null;
  specialties: string[];
}
