import { Link } from "wouter";
import { ArrowLeft, X, CheckCircle2, XCircle } from "lucide-react";
import { useModels } from "@/hooks/useData";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { formatContextWindow, formatPrice, formatLargeNumber } from "@/utils/format";

interface Props {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

const CAP_LABELS: [string, string][] = [
  ["text", "Text"],
  ["vision", "Vision"],
  ["audio", "Audio"],
  ["code", "Code"],
  ["function_calling", "Function Calling"],
  ["reasoning", "Reasoning"],
];

export default function Compare({ compareIds, onToggleCompare }: Props) {
  const { models, loading } = useModels();
  const selected = models.filter((m) => compareIds.includes(m.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Directory
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">Compare</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Compare Models</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select up to 4 models from the directory to compare side-by-side.
          {selected.length > 0 && ` Currently comparing ${selected.length} model${selected.length > 1 ? "s" : ""}.`}
        </p>
      </div>

      {selected.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <p className="text-lg font-semibold text-foreground">No models selected</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Go to the directory and click the bookmark icon on any model card.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Browse models
          </Link>
        </div>
      ) : loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted/40 rounded-xl" />
          <div className="h-64 bg-muted/40 rounded-xl" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground bg-muted/30 w-40">
                  Attribute
                </th>
                {selected.map((model) => (
                  <th key={model.id} className="px-4 py-3 bg-muted/20 min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground">{model.provider}</p>
                        <p className="font-semibold text-foreground">{model.model_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleCompare(model.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">Specialty</td>
                {selected.map((m) => (
                  <td key={m.id} className="px-4 py-3">{m.specialty}</td>
                ))}
              </tr>
              <tr className="border-b border-border/40 bg-muted/5">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">
                  <GlossaryTooltip term="context window">Context Window</GlossaryTooltip>
                </td>
                {selected.map((m) => {
                  const max = Math.max(...selected.map((s) => s.context_window ?? 0));
                  const isBest = m.context_window === max;
                  return (
                    <td
                      key={m.id}
                      className={`px-4 py-3 font-medium ${isBest ? "text-green-600 dark:text-green-400" : ""}`}
                    >
                      {m.context_window ? formatContextWindow(m.context_window) : "—"}
                      {isBest && selected.length > 1 && (
                        <span className="ml-1 text-xs text-green-600/60">↑</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">
                  <GlossaryTooltip term="input tokens">Input Price</GlossaryTooltip>
                  <span className="block text-xs font-normal">/1M tokens</span>
                </td>
                {selected.map((m) => {
                  const min = Math.min(...selected.map((s) => s.pricing.input_price_per_1m_tokens ?? Infinity));
                  const isBest = m.pricing.input_price_per_1m_tokens === min;
                  return (
                    <td
                      key={m.id}
                      className={`px-4 py-3 font-medium ${isBest ? "text-green-600 dark:text-green-400" : ""}`}
                    >
                      {m.pricing.input_price_per_1m_tokens != null
                        ? `$${m.pricing.input_price_per_1m_tokens.toFixed(3)}`
                        : "—"}
                      {isBest && selected.length > 1 && m.pricing.input_price_per_1m_tokens != null && (
                        <span className="ml-1 text-xs text-green-600/60">↓</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border/40 bg-muted/5">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">
                  <GlossaryTooltip term="output tokens">Output Price</GlossaryTooltip>
                  <span className="block text-xs font-normal">/1M tokens</span>
                </td>
                {selected.map((m) => {
                  const min = Math.min(...selected.map((s) => s.pricing.output_price_per_1m_tokens ?? Infinity));
                  const isBest = m.pricing.output_price_per_1m_tokens === min;
                  return (
                    <td
                      key={m.id}
                      className={`px-4 py-3 font-medium ${isBest ? "text-green-600 dark:text-green-400" : ""}`}
                    >
                      {m.pricing.output_price_per_1m_tokens != null
                        ? `$${m.pricing.output_price_per_1m_tokens.toFixed(3)}`
                        : "—"}
                      {isBest && selected.length > 1 && m.pricing.output_price_per_1m_tokens != null && (
                        <span className="ml-1 text-xs text-green-600/60">↓</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">
                  <GlossaryTooltip term="rpm">RPM</GlossaryTooltip>
                </td>
                {selected.map((m) => (
                  <td key={m.id} className="px-4 py-3">
                    {m.rate_limits.rpm != null ? formatLargeNumber(m.rate_limits.rpm) : "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/40 bg-muted/5">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10">
                  <GlossaryTooltip term="tpm">TPM</GlossaryTooltip>
                </td>
                {selected.map((m) => (
                  <td key={m.id} className="px-4 py-3">
                    {m.rate_limits.tpm != null ? formatLargeNumber(m.rate_limits.tpm) : "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10 align-top">Capabilities</td>
                {selected.map((m) => (
                  <td key={m.id} className="px-4 py-3">
                    <div className="space-y-1.5">
                      {CAP_LABELS.map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1.5 text-xs">
                          {m.capabilities[key as keyof typeof m.capabilities] ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                          )}
                          <span
                            className={
                              m.capabilities[key as keyof typeof m.capabilities]
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            }
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground font-medium bg-muted/10 align-top">Notes</td>
                {selected.map((m) => (
                  <td key={m.id} className="px-4 py-3 text-xs text-muted-foreground">
                    {m.notes ?? "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
