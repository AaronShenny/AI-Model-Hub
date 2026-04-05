import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, LayoutGrid, Table2 } from "lucide-react";
import { useModels } from "@/hooks/useData";
import { ModelCard } from "@/components/ModelCard";
import { FilterPanel } from "@/components/FilterPanel";
import type { FilterState, SortOption } from "@/types";
import { formatContextWindow, formatPrice } from "@/utils/format";
import { CapabilityBadge } from "@/components/CapabilityBadge";
import { Link } from "wouter";

const EMPTY_FILTERS: FilterState = {
  search: "",
  providers: [],
  capabilities: [],
  priceRange: [null, null],
  minContext: null,
  specialties: [],
};

interface Props {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export default function Directory({ compareIds, onToggleCompare }: Props) {
  const { models, loading, error } = useModels();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("provider");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))].sort(), [models]);
  const specialties = useMemo(() => [...new Set(models.map((m) => m.specialty))].sort(), [models]);

  const filtered = useMemo(() => {
    let list = [...models];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.model_name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.specialty.toLowerCase().includes(q) ||
          (m.best_for ?? "").toLowerCase().includes(q)
      );
    }

    if (filters.providers.length > 0) {
      list = list.filter((m) => filters.providers.includes(m.provider));
    }

    if (filters.capabilities.length > 0) {
      list = list.filter((m) =>
        filters.capabilities.every((cap) =>
          cap === "reasoning_level"
            ? m.capabilities.reasoning_level !== "low"
            : Boolean(m.capabilities[cap as keyof typeof m.capabilities])
        )
      );
    }

    if (filters.minContext !== null) {
      list = list.filter(
        (m) => m.context_window !== null && m.context_window >= filters.minContext!
      );
    }

    list.sort((a, b) => {
      switch (sort) {
        case "cheapest":
          return (
            (a.pricing.input_price_per_1m_tokens ?? Infinity) -
            (b.pricing.input_price_per_1m_tokens ?? Infinity)
          );
        case "largest_context":
          return (b.context_window ?? 0) - (a.context_window ?? 0);
        case "newest":
          return (b.last_updated ?? "").localeCompare(a.last_updated ?? "");
        case "provider":
          return a.provider.localeCompare(b.provider) || a.model_name.localeCompare(b.model_name);
        case "name":
          return a.model_name.localeCompare(b.model_name);
        default:
          return 0;
      }
    });

    return list;
  }, [models, filters, sort]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64 text-destructive">
        Failed to load models: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI Model Directory</h1>
        <p className="mt-2 text-muted-foreground">
          Explore {models.length > 0 ? `${models.length}+ ` : ""}AI models from the world's top providers.
          Compare pricing, capabilities, and context windows.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search models, providers, or capabilities..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
          >
            <option value="provider">Sort: Provider</option>
            <option value="name">Sort: Name</option>
            <option value="cheapest">Sort: Cheapest</option>
            <option value="largest_context">Sort: Largest Context</option>
            <option value="newest">Sort: Newest</option>
          </select>

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:text-foreground"}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-2 transition-colors border-l border-border ${viewMode === "table" ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:text-foreground"}`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              sidebarOpen
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(filters.providers.length > 0 || filters.capabilities.length > 0 || filters.minContext) && (
              <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                {filters.providers.length + filters.capabilities.length + (filters.minContext ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {sidebarOpen && (
          <aside className="w-56 flex-shrink-0">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                providers={providers}
                specialties={specialties}
                onClear={() => setFilters(EMPTY_FILTERS)}
              />
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-muted/40 h-56 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl font-semibold text-foreground">No models found</p>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} model{filtered.length !== 1 ? "s" : ""}
                {compareIds.length > 0 && (
                  <Link href="/compare" className="ml-2 text-primary hover:underline">
                    {compareIds.length} selected for comparison →
                  </Link>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isComparing={compareIds.includes(model.id)}
                    onToggleCompare={onToggleCompare}
                    compareDisabled={compareIds.length >= 4}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} model{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Model</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Provider</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Context</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Input</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Output</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Capabilities</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((model, i) => (
                      <tr
                        key={model.id}
                        className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${
                          i % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/model/${model.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {model.model_name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{model.specialty}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{model.provider}</td>
                        <td className="px-4 py-3 font-medium">
                          {model.context_window ? formatContextWindow(model.context_window) : "Not available"}
                        </td>
                        <td className="px-4 py-3">
                          {model.pricing.input_price_per_1m_tokens != null
                            ? formatPrice(model.pricing.input_price_per_1m_tokens)
                            : "Not available"}
                        </td>
                        <td className="px-4 py-3">
                          {model.pricing.output_price_per_1m_tokens != null
                            ? formatPrice(model.pricing.output_price_per_1m_tokens)
                            : "Not available"}
                        </td>
                        <td className="px-4 py-3">
                          <CapabilityBadge capabilities={model.capabilities} compact />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onToggleCompare(model.id)}
                            disabled={!compareIds.includes(model.id) && compareIds.length >= 4}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              compareIds.includes(model.id)
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-background text-muted-foreground border-border hover:text-foreground"
                            } disabled:opacity-30`}
                          >
                            {compareIds.includes(model.id) ? "Selected" : "Compare"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
