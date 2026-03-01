import { motion } from "framer-motion";
import { AlertTriangle, Flame, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.5 },
  }),
};

export default function StatusCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Card 1: Caixa Atual */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
        className="rounded-xl border border-emerald-500/20 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-emerald-500/40 transition-all"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Caixa Hoje</h3>
        <p className="text-4xl font-bold text-foreground mb-6">R$ 47.820</p>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entradas</span>
            <span className="text-emerald-400 font-semibold">+R$ 21.450</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saídas</span>
            <span className="text-red-400 font-semibold">-R$ 3.978</span>
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
        <p className="text-xs text-muted-foreground mt-2">Previsão 7 dias: +R$ 68k</p>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ROAS</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-400">4,8×</span>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Churn</span>
            <span className="text-2xl font-bold text-emerald-400">3,9%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Margem Bruta</span>
            <span className="text-2xl font-bold text-cyan-400">87%</span>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-muted-foreground">Ads ativos: <span className="text-foreground font-semibold">7 campanhas</span></p>
            <p className="text-xs text-muted-foreground mt-1">Gasto hoje: <span className="text-orange-400 font-semibold">R$ 1.820</span></p>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Alertas Críticos */}
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
          <h3 className="text-sm font-semibold text-red-400">Alertas Críticos</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-500/20">
            <p className="text-sm text-red-300 mb-2">⚠️ 2 anúncios com ROAS &lt; 1,5×</p>
            <Button size="sm" variant="outline" className="text-xs h-7 border-red-500/30 hover:bg-red-950/50">
              Pausar agora
            </Button>
          </div>
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-500/20">
            <p className="text-sm text-red-300 mb-2">⚠️ Estoque virtual crítico em 3 produtos</p>
            <Button size="sm" variant="outline" className="text-xs h-7 border-red-500/30 hover:bg-red-950/50">
              Ver
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
