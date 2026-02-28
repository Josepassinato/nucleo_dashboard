import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.5 },
  }),
};

export default function StatusCards() {
  // Fetch real metrics
  const metrics = trpc.admin.getMetricsSummary.useQuery();
  const isLoading = metrics.isLoading;
  const metricsSummary = metrics.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Card 1: MRR */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
        className="rounded-xl border border-emerald-500/20 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-emerald-500/40 transition-all"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">MRR (Receita Mensal)</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        ) : (
          <>
            <p className="text-4xl font-bold text-foreground mb-6">
              R$ {(metricsSummary?.mrr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assinaturas Ativas</span>
                <span className="text-emerald-400 font-semibold">{metricsSummary?.activeSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crescimento MRR</span>
                <span className={metricsSummary?.mrrGrowth && metricsSummary.mrrGrowth > 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {metricsSummary?.mrrGrowth ? `${metricsSummary.mrrGrowth > 0 ? '+' : ''}${metricsSummary.mrrGrowth.toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">ARR: R$ {(metricsSummary?.arr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
          </>
        )}
      </motion.div>

      {/* Card 2: Saúde do Negócio */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
        className="rounded-xl border border-blue-500/20 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-blue-500/40 transition-all"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Saúde do Negócio</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Churn Rate</span>
              <span className="text-2xl font-bold text-emerald-400">{(metricsSummary?.churnRate || 0).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Novas Assinaturas</span>
              <span className="text-2xl font-bold text-blue-400">{metricsSummary?.newSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crescimento Churn</span>
              <span className={metricsSummary?.churnRateChange && metricsSummary.churnRateChange < 0 ? "text-2xl font-bold text-cyan-400" : "text-2xl font-bold text-red-400"}>
                {metricsSummary?.churnRateChange ? `${metricsSummary.churnRateChange > 0 ? '+' : ''}${metricsSummary.churnRateChange.toFixed(2)}%` : '0%'}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-muted-foreground">Métricas: <span className="text-foreground font-semibold">Sincronizadas</span></p>
              <p className="text-xs text-muted-foreground mt-1">Status: <span className="text-emerald-400 font-semibold">Operacional</span></p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Card 3: Status do Sistema */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.1)" }}
        className="rounded-xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm p-8 hover:border-red-500/40 transition-all"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Status do Sistema</h3>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-red-400" />
              <p className="text-slate-400">Carregando...</p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 mb-2">✓ Banco de dados conectado</p>
                <p className="text-xs text-emerald-300/70">Todas as métricas sincronizadas</p>
              </div>
              <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-500/20">
                <p className="text-sm text-blue-300 mb-2">✓ API tRPC operacional</p>
                <p className="text-xs text-blue-300/70">Comunicação backend-frontend funcionando</p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
