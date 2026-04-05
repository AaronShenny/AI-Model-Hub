import { Link } from "wouter";
import { ExternalLink, BookmarkPlus, BookmarkCheck } from "lucide-react";
import type { AIModel } from "@/types";
import { CapabilityBadge } from "./CapabilityBadge";
import { GlossaryTooltip, DataPointTooltip } from "./GlossaryTooltip";
import { formatContextWindow, formatPrice } from "@/utils/format";
import { displayValue, getDataQualityBadge, pricingHeadline } from "@/utils/modelMeta";

interface Props {
  model: AIModel;
  isComparing?: boolean;
  onToggleCompare?: (id: string) => void;
  compareDisabled?: boolean;
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
  Anthropic: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
  Google: "from-blue-500/10 to-cyan-500/5 border-blue-500/20",
  Mistral: "from-orange-500/10 to-yellow-500/5 border-orange-500/20",
  Meta: "from-blue-600/10 to-indigo-500/5 border-blue-600/20",
};

export function ModelCard({ model, isComparing, onToggleCompare, compareDisabled }: Props) {
  const gradient = PROVIDER_COLORS[model.provider] ?? "from-muted/50 to-muted/20 border-border";
  const quality = getDataQualityBadge(model.data_quality);

  return (
    <div className={`relative group rounded-xl border bg-gradient-to-br ${gradient} p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${isComparing ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{model.provider}</p>
          <Link href={`/model/${model.id}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate cursor-pointer">{model.model_name}</h3>
          </Link>
          <div className="mt-1 inline-flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${quality.className}`}>{quality.label}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{model.availability}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{model.specialty}</p>
        </div>
        {onToggleCompare && (
          <button type="button" onClick={() => onToggleCompare(model.id)} disabled={compareDisabled && !isComparing} title={isComparing ? "Remove from comparison" : "Add to comparison"} className={`p-1.5 rounded-lg transition-colors ${isComparing ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"} disabled:opacity-30 disabled:cursor-not-allowed`}>
            {isComparing ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">{pricingHeadline(model)}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground"><GlossaryTooltip term="context window" className="text-muted-foreground">Context</GlossaryTooltip></span>
          <span className="font-semibold text-foreground">{model.context_window ? formatContextWindow(model.context_window) : "Not available"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground"><GlossaryTooltip term="input tokens" className="text-muted-foreground">Input</GlossaryTooltip></span>
          <span className="font-semibold text-foreground">{model.pricing.input_price_per_1m_tokens != null ? formatPrice(model.pricing.input_price_per_1m_tokens) : "Not available"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground"><GlossaryTooltip term="output tokens" className="text-muted-foreground">Output</GlossaryTooltip></span>
          <span className="font-semibold text-foreground">{model.pricing.output_price_per_1m_tokens != null ? formatPrice(model.pricing.output_price_per_1m_tokens) : "Not available"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">
            <DataPointTooltip label="RPM" title="Rate limit" description="Maximum allowed API usage per time window. Often depends on account tier and provider." className="text-muted-foreground" />
          </span>
          <span className="font-semibold text-foreground">{model.rate_limits.rpm != null ? model.rate_limits.rpm.toLocaleString() : "Not publicly defined"}</span>
        </div>
      </div>

      {model.pricing.type === "provider-dependent" && (
        <p className="text-[11px] text-muted-foreground">
          Varies by provider {model.pricing.example_providers?.length ? `(${model.pricing.example_providers.join(", ")})` : ""}
        </p>
      )}

      <CapabilityBadge capabilities={model.capabilities} compact />

      {model.best_for && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{model.best_for}</p>}

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/40">
        <Link href={`/model/${model.id}`} className="text-xs text-primary hover:underline font-medium">View details</Link>
        {model.source_url && (
          <a href={model.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Official source">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">Verified: {displayValue(model.last_verified, "Not available")}</p>
    </div>
  );
}
