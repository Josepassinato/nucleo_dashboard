import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  score: number;
  stress: number;
  status: "active" | "idle" | "warning" | "error";
  last_action: string;
  last_update: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/agents`);
        if (!response.ok) throw new Error("Erro ao carregar agentes");
        const data = await response.json();
        setAgents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar agentes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateAgent = async (agentId: string, updates: Partial<Agent>) => {
    try {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) throw new Error("Agente não encontrado");

      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...agent, ...updates }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar agente");
      const updated = await response.json();
      setAgents(agents.map((a) => (a.id === agentId ? updated.agent : a)));
    } catch (err) {
      console.error("Erro ao atualizar agente:", err);
    }
  };

  return { agents, loading, error, updateAgent };
}
