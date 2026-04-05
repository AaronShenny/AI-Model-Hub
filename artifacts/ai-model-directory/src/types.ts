export type PricingType = "official" | "provider-dependent" | "estimated";
export type RateLimitType = "official" | "tier-based" | "unknown";
export type ReasoningLevel = "low" | "medium" | "high";
export type DataQuality = "official" | "estimated" | "community" | "unknown";
export type Availability = "api" | "open-source" | "hosted";

export interface PricingExample {
  provider: string;
  input: number;
  output: number;
}

export interface ModelPricing {
  type: PricingType;
  note: string;
  input_price_per_1m_tokens: number | null;
  output_price_per_1m_tokens: number | null;
  examples: PricingExample[];
}

export interface ModelRateLimits {
  type: RateLimitType;
  note: string;
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
  reasoning_level: ReasoningLevel;
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
  data_quality: DataQuality;
  availability: Availability;
  last_verified: string | null;
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
