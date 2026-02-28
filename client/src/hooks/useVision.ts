import { useState } from "react";

interface VisionResponse {
  status: string;
  message: string;
  affected_agents: string[];
  actions: string[];
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useVision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionResponse | null>(null);

  const disseminarVisao = async (vision: string): Promise<VisionResponse | null> => {
    if (!vision.trim()) {
      setError("Visão não pode estar vazia");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/vision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: vision }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar visão");
      }

      const data: VisionResponse = await response.json();
      setResult(data);

      if (data.status === "error") {
        setError(data.message);
        return null;
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      console.error("Erro ao disseminar visão:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { disseminarVisao, loading, error, result };
}
