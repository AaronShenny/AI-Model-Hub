import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, BookmarkPlus, BookmarkCheck, CheckCircle2, XCircle } from "lucide-react";
import { useModels } from "@/hooks/useData";
import { GlossaryTooltip, InfoIcon } from "@/components/GlossaryTooltip";
import { CapabilityBadge } from "@/components/CapabilityBadge";
import { formatContextWindow, formatPrice, formatDate, formatLargeNumber } from "@/utils/format";

interface Props {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export default function ModelDetail({ compareIds, onToggleCompare }: Props) {
  const params = useParams<{ id: string }>();
  const { models, loading } = useModels();

  const model = models.find((m) => m.id === params.id);
  const isComparing = compareIds.includes(params.id ?? "");

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/40 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold">Model not found</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          ← Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Directory
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{model.provider}</p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">{model.model_name}</h1>
            <p className="text-muted-foreground mt-1">{model.specialty}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleCompare(model.id)}
              disabled={!isComparing && compareIds.length >= 4}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                isComparing
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isComparing ? (
                <>
                  <BookmarkCheck className="w-4 h-4" /> Remove from compare
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" /> Add to compare
                </>
              )}
            </button>
            {model.source_url && (
              <a
                href={model.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Source
              </a>
            )}
          </div>
        </div>

        {model.best_for && (
          <p className="mt-4 text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
            <span className="font-medium text-foreground">Best for: </span>
            {model.best_for}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Specs</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <GlossaryTooltip term="context window">Context Window</GlossaryTooltip>
              </span>
              <span className="font-semibold text-foreground">
                {model.context_window
                  ? `${formatContextWindow(model.context_window)} tokens`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Model ID</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {model.model_id}
              </code>
            </div>
            {model.last_updated && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{formatDate(model.last_updated)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            Pricing
            <InfoIcon term="pricing per 1m tokens" />
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <GlossaryTooltip term="input tokens">Input</GlossaryTooltip>
                <span className="text-xs text-muted-foreground">/1M tokens</span>
              </span>
              <span className="font-semibold text-foreground">
                {model.pricing.input_price_per_1m_tokens != null
                  ? `$${model.pricing.input_price_per_1m_tokens.toFixed(3)}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <GlossaryTooltip term="output tokens">Output</GlossaryTooltip>
                <span className="text-xs text-muted-foreground">/1M tokens</span>
              </span>
              <span className="font-semibold text-foreground">
                {model.pricing.output_price_per_1m_tokens != null
                  ? `$${model.pricing.output_price_per_1m_tokens.toFixed(3)}`
                  : "—"}
              </span>
            </div>
            {model.pricing.input_price_per_1m_tokens != null &&
              model.pricing.output_price_per_1m_tokens != null && (
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-xs">Example: 1K in + 500 out</span>
                  <span className="text-xs font-medium text-foreground">
                    ${((model.pricing.input_price_per_1m_tokens * 1000 + model.pricing.output_price_per_1m_tokens * 500) / 1_000_000).toFixed(6)}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <GlossaryTooltip term="rate limit">Rate Limits</GlossaryTooltip>
        </h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {(
            [
              { key: "rpm", label: "RPM" },
              { key: "tpm", label: "TPM" },
              { key: "rpd", label: "RPD" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-muted-foreground text-xs mb-1 flex items-center justify-center gap-1">
                <GlossaryTooltip term={key}>{label}</GlossaryTooltip>
              </p>
              <p className="font-semibold text-foreground text-lg">
                {model.rate_limits[key] != null
                  ? formatLargeNumber(model.rate_limits[key]!)
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Capabilities</h2>
        <CapabilityBadge capabilities={model.capabilities} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-sm">
          {(
            [
              ["text", "Text Generation"],
              ["vision", "Vision / Image Input"],
              ["audio", "Audio Input"],
              ["code", "Code Generation"],
              ["function_calling", "Function Calling"],
              ["reasoning", "Extended Reasoning"],
            ] as [keyof typeof model.capabilities, string][]
          ).map(([key, label]) => (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                model.capabilities[key]
                  ? "border-green-500/30 bg-green-500/5 text-foreground"
                  : "border-border/40 bg-muted/20 text-muted-foreground"
              }`}
            >
              {model.capabilities[key] ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {model.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground">{model.notes}</p>
        </div>
      )}
    </div>
  );
}
