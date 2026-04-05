import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { useGlossary } from "@/hooks/useData";
import type { GlossaryEntry } from "@/types";

interface TooltipBaseProps {
  label: React.ReactNode;
  title: string;
  description: string;
  unit?: string | null;
  className?: string;
}

function InlineTooltip({ label, title, description, unit, className }: TooltipBaseProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      <button
        type="button"
        className={`underline decoration-dotted underline-offset-2 cursor-help focus:outline-none focus:ring-2 focus:ring-primary/40 rounded ${className ?? ""}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        aria-label={`Definition: ${title}`}
      >
        {label}
      </button>
      <HelpCircle className="w-3 h-3 text-muted-foreground opacity-60" />
      {visible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-72 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-sm"
        >
          <p className="font-semibold text-foreground mb-1">{title}</p>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          {unit && <p className="mt-1 text-xs text-primary font-medium">Unit: {unit}</p>}
        </div>
      )}
    </span>
  );
}

interface Props {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

const INLINE_GLOSSARY: Record<string, GlossaryEntry> = {
  "context window": {
    term: "Context Window",
    short: "context_window",
    definition: "Maximum tokens that can be processed in one request (prompt + response).",
    unit: "tokens",
  },
  "rate limit": {
    term: "Rate Limit",
    short: "rate_limit",
    definition: "Maximum allowed API usage per time window. Often depends on account tier and provider.",
    unit: null,
  },
  rpm: {
    term: "RPM",
    short: "rpm",
    definition: "Requests per minute. Often varies by provider, plan, and current usage tier.",
    unit: "requests/minute",
  },
  tpm: {
    term: "TPM",
    short: "tpm",
    definition: "Tokens per minute across input and output. Usually tier-dependent, not universal.",
    unit: "tokens/minute",
  },
  rpd: {
    term: "RPD",
    short: "rpd",
    definition: "Requests per day when a provider applies daily caps.",
    unit: "requests/day",
  },
  "input tokens": {
    term: "Input Tokens",
    short: "input_price",
    definition: "Tokens you send to the model, usually priced per 1 million tokens.",
    unit: "$/1M tokens",
  },
  "output tokens": {
    term: "Output Tokens",
    short: "output_price",
    definition: "Tokens the model generates. Output is often priced higher than input.",
    unit: "$/1M tokens",
  },
  "pricing per 1m tokens": {
    term: "Pricing per 1M Tokens",
    short: "pricing",
    definition: "Input/output token rates. For open-source models, this commonly varies by host/provider.",
    unit: "$/1M tokens",
  },
};

export function GlossaryTooltip({ term, children, className }: Props) {
  const { glossary } = useGlossary();
  const key = term.toLowerCase();
  const entry = INLINE_GLOSSARY[key] || glossary.find((g) => g.short === key || g.term.toLowerCase() === key);

  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }

  return (
    <InlineTooltip
      label={children ?? term}
      title={entry.term}
      description={entry.definition}
      unit={entry.unit}
      className={className}
    />
  );
}

export function InfoIcon({ term }: { term: string }) {
  return <GlossaryTooltip term={term}><span className="sr-only">Info</span></GlossaryTooltip>;
}

export function DataPointTooltip({ label, title, description, className }: { label: React.ReactNode; title: string; description: string; className?: string; }) {
  return <InlineTooltip label={label} title={title} description={description} className={className} />;
}
