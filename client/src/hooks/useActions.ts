import { useState, useEffect } from "react";

interface Action {
  id: string;
  agent_id: string;
  agent_name: string;
  role: string;
  timestamp: string;
  action: string;
  description: string;
  color: string;
  result?: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/actions`);
        if (!response.ok) throw new Error("Erro ao carregar ações");
        const data = await response.json();
        setActions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar ações:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();

    // Atualizar a cada 15 segundos
    const interval = setInterval(fetchActions, 15000);
    return () => clearInterval(interval);
  }, []);

  return { actions, loading, error };
}
