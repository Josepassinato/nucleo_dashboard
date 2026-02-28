import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import {
  RevenueChart,
  SubscriptionChart,
  ChurnChart,
  PlanDistributionChart,
  MetricsTable,
} from "@/components/MetricsCharts";
import { Loader2, BarChart3, DollarSign, Users, TrendingDown, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch all metrics
  const metrics = trpc.admin.getMetricsSummary.useQuery();
  const revenueTrend = trpc.admin.getRevenueTrend.useQuery();
  const subscriptionTrend = trpc.admin.getSubscriptionTrend.useQuery();
  const churnTrend = trpc.admin.getChurnTrend.useQuery();
  const planDistribution = trpc.admin.getPlanDistribution.useQuery();
  const ltvByPlan = trpc.admin.getLTVByPlan.useQuery();
  const cac = trpc.admin.getCAC.useQuery();
  const ltvCacRatio = trpc.admin.getLTVCACRatio.useQuery();

  useEffect(() => {
    const allLoaded =
      !metrics.isLoading &&
      !revenueTrend.isLoading &&
      !subscriptionTrend.isLoading &&
      !churnTrend.isLoading &&
      !planDistribution.isLoading;

    setIsLoading(allLoaded === false);
  }, [
    metrics.isLoading,
    revenueTrend.isLoading,
    subscriptionTrend.isLoading,
    churnTrend.isLoading,
    planDistribution.isLoading,
  ]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">Acesso negado. Você não é um administrador.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const metricsSummary = metrics.data;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Métricas de negócio e performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="MRR"
            value={`R$ ${(metricsSummary?.mrr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`}
            change={metricsSummary?.mrrGrowth}
            trend={
              metricsSummary?.mrrGrowth && metricsSummary.mrrGrowth > 0
                ? "up"
                : metricsSummary?.mrrGrowth && metricsSummary.mrrGrowth < 0
                  ? "down"
                  : "neutral"
            }
            icon={<DollarSign className="w-6 h-6" />}
            description="Monthly Recurring Revenue"
          />

          <KPICard
            title="ARR"
            value={`R$ ${(metricsSummary?.arr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="w-6 h-6" />}
            description="Annual Recurring Revenue"
          />

          <KPICard
            title="Assinaturas Ativas"
            value={metricsSummary?.activeSubscriptions || 0}
            icon={<Users className="w-6 h-6" />}
            description="Total de clientes ativos"
          />

          <KPICard
            title="Churn Rate"
            value={`${(metricsSummary?.churnRate || 0).toFixed(2)}%`}
            change={metricsSummary?.churnRateChange}
            trend={
              metricsSummary?.churnRateChange && metricsSummary.churnRateChange < 0
                ? "up"
                : metricsSummary?.churnRateChange && metricsSummary.churnRateChange > 0
                  ? "down"
                  : "neutral"
            }
            icon={<TrendingDown className="w-6 h-6" />}
            description="Taxa de cancelamento"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <KPICard
            title="Novas Assinaturas"
            value={metricsSummary?.newSubscriptions || 0}
            icon={<Users className="w-6 h-6" />}
            description="Este mês"
          />

          <KPICard
            title="CAC"
            value={`R$ ${(cac.data || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`}
            description="Customer Acquisition Cost"
          />

          <KPICard
            title="LTV:CAC"
            value={`${(ltvCacRatio.data || 0).toFixed(1)}:1`}
            trend={ltvCacRatio.data && ltvCacRatio.data >= 3 ? "up" : "down"}
            description="Deve ser >= 3:1"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {revenueTrend.data && <RevenueChart data={revenueTrend.data} />}
          {subscriptionTrend.data && <SubscriptionChart data={subscriptionTrend.data} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {churnTrend.data && <ChurnChart data={churnTrend.data} />}
          {planDistribution.data && <PlanDistributionChart data={planDistribution.data} />}
        </div>

        {/* LTV by Plan Table */}
        {ltvByPlan.data && (
          <MetricsTable
            title="Lifetime Value por Plano"
            data={Object.entries(ltvByPlan.data).map(([plan, ltv]) => ({
              plan: plan.charAt(0).toUpperCase() + plan.slice(1),
              ltv: `R$ ${ltv.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`,
            }))}
            columns={[
              { key: "plan", label: "Plano" },
              { key: "ltv", label: "LTV" },
            ]}
          />
        )}

        {/* Info Section */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Sobre as Métricas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white mb-2">MRR (Monthly Recurring Revenue)</p>
              <p>Receita mensal recorrente de todas as assinaturas ativas.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">ARR (Annual Recurring Revenue)</p>
              <p>Receita anual recorrente (MRR × 12).</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Churn Rate</p>
              <p>Percentual de clientes que cancelaram no período.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">CAC (Customer Acquisition Cost)</p>
              <p>Custo médio para adquirir um novo cliente.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">LTV (Lifetime Value)</p>
              <p>Valor total que um cliente gera ao longo de sua vida.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">LTV:CAC Ratio</p>
              <p>Deve ser &gt;= 3:1 para um negócio saudável.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
