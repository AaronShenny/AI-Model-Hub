import { useState, useEffect } from "react";
import type { AIModel, Provider, GlossaryEntry } from "@/types";

const BASE = import.meta.env.BASE_URL;

function dataUrl(path: string) {
  return `${BASE}data/${path}`;
}

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(dataUrl("models.json"))
      .then((r) => r.json())
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { models, loading, error };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("providers.json"))
      .then((r) => r.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { providers, loading };
}

export function useGlossary() {
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);

  useEffect(() => {
    fetch(dataUrl("glossary.json"))
      .then((r) => r.json())
      .then(setGlossary)
      .catch(() => {});
  }, []);

  return { glossary };
}
