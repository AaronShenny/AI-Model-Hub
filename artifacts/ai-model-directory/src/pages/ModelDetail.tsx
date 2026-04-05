import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useModels } from "@/hooks/useData";
import { GlossaryTooltip, DataPointTooltip } from "@/components/GlossaryTooltip";
import { CapabilityBadge } from "@/components/CapabilityBadge";
import { ReviewSection } from "@/components/ReviewSection";
import { formatContextWindow, formatDate, formatLargeNumber, formatPrice } from "@/utils/format";
import { getDataQualityBadge, pricingHeadline } from "@/utils/modelMeta";

interface Props {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export default function ModelDetail({ compareIds, onToggleCompare }: Props) {
  const params = useParams<{ id: string }>();
  const { models, loading } = useModels();

  const model = models.find((m) => m.id === params.id);
  const isComparing = compareIds.includes(params.id ?? "");

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="rounded-xl bg-muted/40 h-16 animate-pulse" /></div>;
  if (!model) return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p className="text-xl font-semibold">Model not found</p><Link href="/" className="mt-4 inline-block text-primary hover:underline">← Back to directory</Link></div>;

  const quality = getDataQualityBadge(model.data_quality);
  const uncertainData = model.data_quality !== "official";
  const uncertainPricing = model.pricing.type === "provider-dependent" || model.pricing.type === "estimated";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" />Directory</Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{model.provider}</p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">{model.model_name}</h1>
            <p className="text-muted-foreground mt-1">{model.specialty}</p>
            <div className="mt-2 flex items-center gap-2">
              <DataPointTooltip label={<span className={`text-xs px-2 py-0.5 rounded-full border ${quality.className}`}>{quality.label}</span>} title="Data confidence" description={quality.tooltip} />
              <span className="text-xs text-muted-foreground uppercase">{model.availability}</span>
            </div>
          </div>
          <button type="button" onClick={() => onToggleCompare(model.id)} disabled={!isComparing && compareIds.length >= 4} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${isComparing ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"}`}>
            {isComparing ? <><BookmarkCheck className="w-4 h-4" /> Remove from compare</> : <><BookmarkPlus className="w-4 h-4" /> Add to compare</>}
          </button>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
          <span className="font-medium text-foreground">Last verified:</span> {model.last_verified ? formatDate(model.last_verified) : "Not available"}
        </div>

        {uncertainData && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900">Values are estimates — not official guarantees.</div>}

        {model.best_for && <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3"><span className="font-medium text-foreground">Best for: </span>{model.best_for}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
          <h2 className="font-semibold text-foreground">Specs</h2>
          <div className="flex items-center justify-between"><GlossaryTooltip term="context window">Context Window</GlossaryTooltip><span className="font-semibold">{model.context_window ? `${formatContextWindow(model.context_window)} tokens` : "Not available"}</span></div>
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Model ID</span><code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{model.model_id}</code></div>
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Reasoning</span><span className="font-medium">{model.capabilities.reasoning_level}</span></div>
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Last Updated</span><span>{formatDate(model.last_updated)}</span></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
          <h2 className="font-semibold text-foreground">Pricing</h2>
          <p className={`${uncertainPricing ? "text-muted-foreground" : "text-foreground font-medium"}`}>{pricingHeadline(model)}</p>
          <div className="flex items-center justify-between"><GlossaryTooltip term="input tokens">Input /1M</GlossaryTooltip><span className={uncertainPricing ? "text-muted-foreground" : "font-semibold"}>{model.pricing.input_price_per_1m_tokens != null ? `${uncertainPricing ? "~ " : ""}${formatPrice(model.pricing.input_price_per_1m_tokens)}` : "Not available"}</span></div>
          <div className="flex items-center justify-between"><GlossaryTooltip term="output tokens">Output /1M</GlossaryTooltip><span className={uncertainPricing ? "text-muted-foreground" : "font-semibold"}>{model.pricing.output_price_per_1m_tokens != null ? `${uncertainPricing ? "~ " : ""}${formatPrice(model.pricing.output_price_per_1m_tokens)}` : "Not available"}</span></div>
          {model.pricing.type === "provider-dependent" && model.pricing.examples.length > 0 && (
            <div className="text-xs text-muted-foreground border-t border-border/40 pt-2 space-y-1">
              <p>Example ({model.pricing.examples[0].provider}):</p>
              <p>Input: ~ {formatPrice(model.pricing.examples[0].input)}</p>
              <p>Output: ~ {formatPrice(model.pricing.examples[0].output)}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{model.pricing.note}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-foreground"><GlossaryTooltip term="rate limit">Rate Limits</GlossaryTooltip></h2>
        {model.rate_limits.type === "unknown" ? (
          <div className="text-sm space-y-1">
            <p className="text-foreground">Not publicly defined</p>
            <p className="text-muted-foreground">Varies by provider and account tier</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            {([{ key: "rpm", label: "RPM" }, { key: "tpm", label: "TPM" }, { key: "rpd", label: "RPD" }] as const).map(({ key, label }) => (
              <div key={key} className="text-center">
                <p className="text-muted-foreground text-xs mb-1"><DataPointTooltip label={label} title="Rate limit" description="Maximum API usage allowed per time window. Often varies by provider, account tier, and billing." /></p>
                <p className="font-semibold text-foreground text-lg">{model.rate_limits[key] != null ? formatLargeNumber(model.rate_limits[key]!) : "Not available"}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{model.rate_limits.note}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Capabilities</h2>
        <CapabilityBadge capabilities={model.capabilities} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <h2 className="font-semibold text-foreground">Sources</h2>
        {model.source_url ? <a href={model.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"><ExternalLink className="w-4 h-4" />Official model documentation</a> : <p className="text-sm text-muted-foreground">Not available</p>}
      </div>

      {model.notes && <div className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold text-foreground mb-2">Notes</h2><p className="text-sm text-muted-foreground">{model.notes}</p></div>}

      <ReviewSection modelId={model.id} modelName={model.model_name} />
    </div>
  );
}
