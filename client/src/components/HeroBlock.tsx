import { motion } from "framer-motion";
import { TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function HeroBlock() {
  // Fetch real metrics
  const metrics = trpc.admin.getMetricsSummary.useQuery();
  const revenueTrend = trpc.admin.getRevenueTrend.useQuery();

  // Calculate today's revenue (last data point) vs yesterday
  const todayRevenue = revenueTrend.data?.[revenueTrend.data.length - 1]?.revenue || 0;
  const yesterdayRevenue = revenueTrend.data?.[revenueTrend.data.length - 2]?.revenue || 0;
  const revenueChange = todayRevenue - yesterdayRevenue;
  const revenueChangePercent = yesterdayRevenue > 0 ? Number(((revenueChange / yesterdayRevenue) * 100).toFixed(1)) : 0;

  // Get subscription count
  const activeSubscriptions = metrics.data?.activeSubscriptions || 0;

  // Calculate average ticket value
  const avgTicketValue = activeSubscriptions > 0 ? todayRevenue / activeSubscriptions : 0;

  const isLoading = metrics.isLoading || revenueTrend.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-24 mb-8 rounded-2xl bg-gradient-to-br from-emerald-900/20 via-slate-900 to-slate-900 border border-emerald-500/20 p-12 md:p-16 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Numbers */}
        <div className="flex-1 text-center md:text-left">
          {isLoading ? (
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="text-slate-400">Carregando métricas...</p>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-6xl md:text-7xl font-bold text-emerald-400 mb-2">
                +R$ {todayRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-3xl md:text-4xl font-semibold mb-4 ${
                Number(revenueChangePercent) >= 0 ? "text-emerald-300" : "text-red-300"
              }`}>
                {Number(revenueChangePercent) >= 0 ? "+" : ""}{revenueChangePercent}% vs ontem
              </p>
              <p className="text-lg text-muted-foreground">
                {activeSubscriptions} assinaturas | Ticket médio R$ {avgTicketValue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
            </motion.div>
          )}
        </div>

        {/* Right: Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
