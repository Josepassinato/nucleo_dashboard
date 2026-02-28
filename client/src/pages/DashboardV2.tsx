import { motion } from "framer-motion";
import HeaderV2 from "@/components/HeaderV2";
import VisionModalV2 from "@/components/VisionModalV2";
import { TrendingUp, Zap, AlertCircle, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DashboardV2() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <HeaderV2 />

      <main className="max-w-7xl mx-auto px-8 pt-32 pb-20">
        {/* Back Button */}
        <Link href="/">
          <motion.a
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para V1
          </motion.a>
        </Link>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Main metric */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600/10 to-blue-500/5 border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-4">Receita Hoje</p>
                <motion.h2
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl font-black tracking-tighter mb-2 italic"
                >
                  Dados em Tempo Real
                </motion.h2>
                <p className="text-blue-300 font-bold text-lg">Acesse o Admin Dashboard para métricas completas</p>
              </div>
            </motion.div>

            {/* Right: Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Status", value: "Ativo", icon: TrendingUp, color: "green" },
                { label: "Modo", value: "Demo", icon: Zap, color: "orange" },
                { label: "Versão", value: "2.0", icon: AlertCircle, color: "red" },
                { label: "Agentes", value: "8", icon: Users, color: "blue" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{stat.label}</p>
                    <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                  </div>
                  <p className="text-2xl font-black">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Agents Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black tracking-tighter mb-8 italic">SUA DIRETORIA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Lucas", role: "CEO", score: 9.4, stress: 32, color: "from-emerald-600 to-emerald-500" },
              { name: "Mariana", role: "CMO", score: 8.9, stress: 58, color: "from-pink-600 to-pink-500" },
              { name: "Pedro", role: "CFO", score: 9.1, stress: 25, color: "from-blue-600 to-blue-500" },
              { name: "Carla", role: "COO", score: 8.7, stress: 42, color: "from-cyan-600 to-cyan-500" },
              { name: "Rafael", role: "CPO", score: 8.3, stress: 65, color: "from-purple-600 to-purple-500" },
              { name: "Ana", role: "CHRO", score: 9.0, stress: 35, color: "from-violet-600 to-violet-500" },
              { name: "Zé", role: "Coach", score: 9.2, stress: 20, color: "from-yellow-600 to-yellow-500" },
              { name: "Dani", role: "Analista", score: 8.8, stress: 48, color: "from-orange-600 to-orange-500" },
            ].map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all group cursor-pointer"
              >
                <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${agent.color} mb-3 flex items-center justify-center font-black text-white text-sm shadow-lg`}>
                  {agent.name[0]}
                </div>
                <p className="text-xs font-bold text-gray-300 mb-1">{agent.name}</p>
                <p className="text-xs text-gray-500 mb-2">{agent.role}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-400">{agent.score}/10</span>
                  <span className={`font-bold ${agent.stress > 60 ? "text-red-400" : agent.stress > 40 ? "text-yellow-400" : "text-green-400"}`}>
                    {agent.stress}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-3xl font-black tracking-tighter mb-8 italic">ÚLTIMAS AÇÕES</h3>
          <div className="space-y-3">
            {[
              { time: "14:22", agent: "Mariana", action: "Novo Reel lançado", result: "+18% engajamento" },
              { time: "14:15", agent: "Pedro", action: "Fluxo otimizado", result: "Economia R$ 2.340" },
              { time: "14:08", agent: "Carla", action: "5 tickets resolvidos", result: "12 min médio" },
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/30 transition-all group flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">{action.time}</p>
                  <p className="text-sm font-bold text-white">{action.agent}</p>
                  <p className="text-xs text-gray-400">{action.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-400">{action.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <VisionModalV2 />
    </div>
  );
}
