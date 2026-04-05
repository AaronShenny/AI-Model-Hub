import { useGlossary } from "@/hooks/useData";

export default function Glossary() {
  const { glossary } = useGlossary();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Glossary</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Definitions for technical terms used throughout this directory.
        </p>
      </div>

      {glossary.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {glossary.map((entry) => (
            <div
              key={entry.short}
              id={entry.short}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-foreground text-base">{entry.term}</h2>
                  {entry.unit && (
                    <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 font-medium">
                      {entry.unit}
                    </span>
                  )}
                </div>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground flex-shrink-0">
                  {entry.short}
                </code>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{entry.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
