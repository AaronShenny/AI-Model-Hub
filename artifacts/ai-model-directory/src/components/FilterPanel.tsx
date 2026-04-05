import { X } from "lucide-react";
import type { FilterState } from "@/types";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  providers: string[];
  specialties: string[];
  onClear: () => void;
}

const CAPABILITIES = [
  "text",
  "vision",
  "audio",
  "code",
  "function_calling",
  "reasoning_level",
];

const CAP_LABELS: Record<string, string> = {
  text: "Text",
  vision: "Vision",
  audio: "Audio",
  code: "Code",
  function_calling: "Function Calling",
  reasoning_level: "Reasoning (medium/high)",
};

export function FilterPanel({ filters, onChange, providers, specialties, onClear }: Props) {
  function toggleProvider(p: string) {
    onChange({
      ...filters,
      providers: filters.providers.includes(p)
        ? filters.providers.filter((x) => x !== p)
        : [...filters.providers, p],
    });
  }

  function toggleCapability(c: string) {
    onChange({
      ...filters,
      capabilities: filters.capabilities.includes(c)
        ? filters.capabilities.filter((x) => x !== c)
        : [...filters.capabilities, c],
    });
  }

  const hasFilters =
    filters.providers.length > 0 ||
    filters.capabilities.length > 0 ||
    filters.minContext !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Filters</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Provider</p>
        <div className="flex flex-col gap-1">
          {providers.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.providers.includes(p)}
                onChange={() => toggleProvider(p)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {p}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Capability</p>
        <div className="flex flex-col gap-1">
          {CAPABILITIES.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.capabilities.includes(c)}
                onChange={() => toggleCapability(c)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {CAP_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Min. Context Window</p>
        <select
          value={filters.minContext ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              minContext: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-full text-sm rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
        >
          <option value="">Any</option>
          <option value="8192">8K+</option>
          <option value="32768">32K+</option>
          <option value="65536">64K+</option>
          <option value="128000">128K+</option>
          <option value="200000">200K+</option>
          <option value="1000000">1M+</option>
        </select>
      </div>
    </div>
  );
}
