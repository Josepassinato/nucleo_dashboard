import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function HeroBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-24 mb-8 rounded-2xl bg-gradient-to-br from-emerald-900/20 via-slate-900 to-slate-900 border border-emerald-500/20 p-12 md:p-16 relative overflow-hidden"
    >
      {/* Background decorative elements */}\n      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Numbers */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-6xl md:text-7xl font-bold text-emerald-400 mb-2">
              +R$ 18.472
            </p>
            <p className="text-3xl md:text-4xl font-semibold text-emerald-300 mb-4">
              +12,4% vs ontem
            </p>
            <p className="text-lg text-muted-foreground">
              212 vendas | Ticket médio R$ 87,30
            </p>
          </motion.div>
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
