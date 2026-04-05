import { Eye, Volume2, Code2, Wrench, Brain, MessageSquare } from "lucide-react";
import type { ModelCapabilities } from "@/types";

interface Props {
  capabilities: ModelCapabilities;
  compact?: boolean;
}

const CAPS = [
  { key: "text", label: "Text", Icon: MessageSquare, color: "text-blue-500" },
  { key: "vision", label: "Vision", Icon: Eye, color: "text-purple-500" },
  { key: "audio", label: "Audio", Icon: Volume2, color: "text-green-500" },
  { key: "code", label: "Code", Icon: Code2, color: "text-orange-500" },
  { key: "function_calling", label: "Tools", Icon: Wrench, color: "text-yellow-500" },
] as const;

export function CapabilityBadge({ capabilities, compact = false }: Props) {
  const active = CAPS.filter((c) => capabilities[c.key as keyof ModelCapabilities]);
  const reasoningColor = capabilities.reasoning_level === "high" ? "text-rose-600" : capabilities.reasoning_level === "medium" ? "text-rose-500" : "text-rose-400";

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {active.map(({ key, label, Icon, color }) => (
          <span key={key} title={label} className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-muted ${color}`}>
            <Icon className="w-3 h-3" />
          </span>
        ))}
        <span className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-muted ${reasoningColor}`} title={`Reasoning: ${capabilities.reasoning_level}`}>
          <Brain className="w-3 h-3" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {CAPS.map(({ key, label, Icon, color }) => {
        const enabled = capabilities[key as keyof ModelCapabilities];
        return (
          <span key={key} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${enabled ? `bg-muted border-border ${color} font-medium` : "bg-muted/30 border-border/40 text-muted-foreground/40 line-through"}`}>
            <Icon className="w-3 h-3" />
            {label}
          </span>
        );
      })}
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-muted border-border font-medium ${reasoningColor}`}>
        <Brain className="w-3 h-3" />
        Reasoning: {capabilities.reasoning_level}
      </span>
    </div>
  );
}
