import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { data: metrics, isLoading } = trpc.admin.getMetricsSummary.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-6" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Card 1: MRR e Crescimento */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
        className="rounded-xl border border-emerald-500/20 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-emerald-500/40 transition-all"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          MRR (Receita Mensal Recorrente)
        </h3>
        <p className="text-4xl font-bold text-foreground mb-6">
          {metrics ? formatCurrency(metrics.mrr || 0) : "R$ 0"}
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Crescimento</span>
            <span className={`font-semibold ${metrics && metrics.mrrGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {metrics ? `${metrics.mrrGrowth >= 0 ? "+" : ""}${metrics.mrrGrowth.toFixed(1)}%` : "0%"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ARR</span>
            <span className="text-blue-400 font-semibold">
              {metrics ? formatCurrency(metrics.arr || 0) : "R$ 0"}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(Math.max((metrics?.mrrGrowth || 0) + 50, 0), 100)}%`,
            }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Novas assinaturas:{" "}
          <span className="text-foreground font-semibold">
            {metrics?.newSubscriptions || 0}
          </span>
        </p>
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
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Saúde do Negócio
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Churn Rate</span>
            <span className="text-2xl font-bold text-emerald-400">
              {metrics ? formatPercent(metrics.churnRate || 0) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Assinaturas Ativas</span>
            <span className="text-2xl font-bold text-blue-400">
              {metrics?.activeSubscriptions || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mudança Churn</span>
            <span className={`text-2xl font-bold ${metrics && metrics.churnRateChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {metrics ? `${metrics.churnRateChange >= 0 ? "+" : ""}${(metrics.churnRateChange * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-muted-foreground">
              Status:{" "}
              <span className="text-foreground font-semibold">
                ✓ Operacional
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Status do Sistema */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.1)" }}
        className="rounded-xl border border-slate-500/20 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-slate-500/40 transition-all"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-400">
            Status do Sistema
          </h3>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-500/20">
            <p className="text-sm text-slate-300 mb-2">
              ✓ Banco de dados conectado
            </p>
            <p className="text-xs text-muted-foreground">
              Dados carregados em tempo real
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-500/20">
            <p className="text-sm text-slate-300 mb-2">
              ✓ API tRPC operacional
            </p>
            <p className="text-xs text-muted-foreground">
              Todas as métricas disponíveis
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
