import { useState, useEffect } from "react";

interface Metrics {
  revenue_today: number;
  revenue_growth: number;
  total_sales: number;
  average_ticket: number;
  cash_today: number;
  cash_inflow: number;
  cash_outflow: number;
  roas: number;
  churn: number;
  gross_margin: number;
  active_campaigns: number;
  daily_spend: number;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/metrics`);
        if (!response.ok) throw new Error("Erro ao carregar métricas");
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar métricas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}
