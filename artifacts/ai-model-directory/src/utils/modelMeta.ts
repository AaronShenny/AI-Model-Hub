import type { AIModel, DataQuality } from "@/types";

export function getDataQualityBadge(dataQuality: DataQuality) {
  switch (dataQuality) {
    case "official":
      return {
        label: "🟢 Official",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
        tooltip: "Indicates how reliable this data is based on source and verification.",
      };
    case "estimated":
      return {
        label: "🟡 Estimated",
        className: "bg-amber-500/10 text-amber-700 border-amber-500/30",
        tooltip: "Indicates how reliable this data is based on source and verification.",
      };
    case "community":
      return {
        label: "🔵 Community",
        className: "bg-blue-500/10 text-blue-700 border-blue-500/30",
        tooltip:
          "Data compiled from community sources and public documentation. May not reflect official guarantees.",
      };
    default:
      return {
        label: "🔴 Unknown",
        className: "bg-red-500/10 text-red-700 border-red-500/30",
        tooltip: "Indicates how reliable this data is based on source and verification.",
      };
  }
}

export function pricingHeadline(model: AIModel) {
  if (model.pricing.type === "official") {
    return "Official Pricing";
  }

  if (model.pricing.type === "unknown") {
    return "Pricing not yet verified";
  }

  return "Varies by provider";
}

export function displayValue<T>(value: T | null | undefined, fallback = "Not available") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}
