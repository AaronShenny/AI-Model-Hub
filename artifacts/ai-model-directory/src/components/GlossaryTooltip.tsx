import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { useGlossary } from "@/hooks/useData";
import type { GlossaryEntry } from "@/types";

interface Props {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

const INLINE_GLOSSARY: Record<string, GlossaryEntry> = {
  "context window": {
    term: "Context Window",
    short: "context_window",
    definition:
      "The maximum number of tokens a model can process in a single request, including both input and output.",
    unit: "tokens",
  },
  "rate limit": {
    term: "Rate Limit",
    short: "rate_limit",
    definition:
      "The maximum amount of API usage allowed in a given time period. It may be measured as requests per minute (RPM), tokens per minute (TPM), or requests per day (RPD).",
    unit: null,
  },
  rpm: {
    term: "RPM",
    short: "rpm",
    definition:
      "Requests Per Minute — the maximum number of API calls you can make in a 60-second window.",
    unit: "requests/minute",
  },
  tpm: {
    term: "TPM",
    short: "tpm",
    definition:
      "Tokens Per Minute — the maximum number of tokens (input + output combined) processed per minute.",
    unit: "tokens/minute",
  },
  rpd: {
    term: "RPD",
    short: "rpd",
    definition:
      "Requests Per Day — the maximum number of API calls allowed over a 24-hour period.",
    unit: "requests/day",
  },
  "input tokens": {
    term: "Input Tokens",
    short: "input_price",
    definition:
      "The text you send to the model (prompt, documents, history). Priced per 1 million tokens.",
    unit: "$/1M tokens",
  },
  "output tokens": {
    term: "Output Tokens",
    short: "output_price",
    definition:
      "The text the model generates in response. Usually more expensive than input tokens.",
    unit: "$/1M tokens",
  },
  "pricing per 1m tokens": {
    term: "Pricing per 1M Tokens",
    short: "pricing",
    definition:
      "The cost charged for processing one million tokens. Input and output are usually priced separately.",
    unit: "$/1M tokens",
  },
};

export function GlossaryTooltip({ term, children, className }: Props) {
  const [visible, setVisible] = useState(false);
  const { glossary } = useGlossary();

  const key = term.toLowerCase();
  const entry =
    INLINE_GLOSSARY[key] ||
    glossary.find(
      (g) => g.short === key || g.term.toLowerCase() === key
    );

  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }

  return (
    <span className="relative inline-flex items-center gap-0.5 group">
      <button
        type="button"
        className={`underline decoration-dotted underline-offset-2 cursor-help focus:outline-none focus:ring-2 focus:ring-primary/40 rounded ${className ?? ""}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        aria-label={`Definition: ${entry.term}`}
        aria-describedby={`tooltip-${entry.short}`}
      >
        {children ?? term}
      </button>
      <HelpCircle className="w-3 h-3 text-muted-foreground opacity-60" />
      {visible && (
        <div
          id={`tooltip-${entry.short}`}
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-72 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-sm"
        >
          <p className="font-semibold text-foreground mb-1">{entry.term}</p>
          <p className="text-muted-foreground leading-relaxed">{entry.definition}</p>
          {entry.unit && (
            <p className="mt-1 text-xs text-primary font-medium">Unit: {entry.unit}</p>
          )}
        </div>
      )}
    </span>
  );
}

export function InfoIcon({ term }: { term: string }) {
  const [visible, setVisible] = useState(false);
  const { glossary } = useGlossary();

  const key = term.toLowerCase();
  const entry =
    INLINE_GLOSSARY[key] ||
    glossary.find((g) => g.short === key || g.term.toLowerCase() === key);

  if (!entry) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        aria-label={`Info: ${entry.term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-sm">
          <p className="font-semibold text-foreground mb-1">{entry.term}</p>
          <p className="text-muted-foreground leading-relaxed">{entry.definition}</p>
          {entry.unit && (
            <p className="mt-1 text-xs text-primary font-medium">Unit: {entry.unit}</p>
          )}
        </div>
      )}
    </span>
  );
}
