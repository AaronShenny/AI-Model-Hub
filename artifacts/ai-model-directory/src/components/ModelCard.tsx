import { Link } from "wouter";
import { ExternalLink, BookmarkPlus, BookmarkCheck } from "lucide-react";
import type { AIModel } from "@/types";
import { CapabilityBadge } from "./CapabilityBadge";
import { GlossaryTooltip } from "./GlossaryTooltip";
import { formatContextWindow, formatPrice } from "@/utils/format";

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
  DeepSeek: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
  Cohere: "from-fuchsia-500/10 to-pink-500/5 border-fuchsia-500/20",
  xAI: "from-zinc-500/10 to-slate-500/5 border-zinc-500/20",
  Perplexity: "from-teal-500/10 to-cyan-500/5 border-teal-500/20",
  Alibaba: "from-red-500/10 to-orange-500/5 border-red-500/20",
  "Together AI": "from-purple-500/10 to-violet-500/5 border-purple-500/20",
  Microsoft: "from-sky-500/10 to-blue-500/5 border-sky-500/20",
  Nomic: "from-green-500/10 to-emerald-500/5 border-green-500/20",
};

export function ModelCard({ model, isComparing, onToggleCompare, compareDisabled }: Props) {
  const gradient = PROVIDER_COLORS[model.provider] ?? "from-muted/50 to-muted/20 border-border";

  return (
    <div
      className={`relative group rounded-xl border bg-gradient-to-br ${gradient} p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${
        isComparing ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{model.provider}</p>
          <Link href={`/model/${model.id}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate cursor-pointer">
              {model.model_name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{model.specialty}</p>
        </div>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(model.id)}
            disabled={compareDisabled && !isComparing}
            title={isComparing ? "Remove from comparison" : "Add to comparison"}
            className={`p-1.5 rounded-lg transition-colors ${
              isComparing
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isComparing ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <GlossaryTooltip term="context window" className="text-muted-foreground">Context</GlossaryTooltip>
          </span>
          <span className="font-semibold text-foreground">
            {model.context_window ? formatContextWindow(model.context_window) : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <GlossaryTooltip term="input tokens" className="text-muted-foreground">Input</GlossaryTooltip>
          </span>
          <span className="font-semibold text-foreground">
            {model.pricing.input_price_per_1m_tokens != null
              ? formatPrice(model.pricing.input_price_per_1m_tokens)
              : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <GlossaryTooltip term="output tokens" className="text-muted-foreground">Output</GlossaryTooltip>
          </span>
          <span className="font-semibold text-foreground">
            {model.pricing.output_price_per_1m_tokens != null
              ? formatPrice(model.pricing.output_price_per_1m_tokens)
              : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <GlossaryTooltip term="rpm" className="text-muted-foreground">RPM</GlossaryTooltip>
          </span>
          <span className="font-semibold text-foreground">
            {model.rate_limits.rpm != null ? model.rate_limits.rpm.toLocaleString() : "—"}
          </span>
        </div>
      </div>

      <CapabilityBadge capabilities={model.capabilities} compact />

      {model.best_for && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {model.best_for}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/40">
        <Link
          href={`/model/${model.id}`}
          className="text-xs text-primary hover:underline font-medium"
        >
          View details
        </Link>
        {model.source_url && (
          <a
            href={model.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Official source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
