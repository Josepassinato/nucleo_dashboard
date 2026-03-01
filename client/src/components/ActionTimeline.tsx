import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    id: 1,
    agent: "Mariana Oliveira",
    role: "CMO",
    time: "14:22",
    action: "Novo Reel lançado",
    description: "projetado +18% engajamento",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 2,
    agent: "Pedro Lima",
    role: "CFO",
    time: "14:15",
    action: "Fluxo de caixa otimizado",
    description: "economia de R$ 2.340",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: 3,
    agent: "Carla Santos",
    role: "COO",
    time: "14:08",
    action: "5 tickets resolvidos",
    description: "tempo médio 12 minutos",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 4,
    agent: "Rafael Torres",
    role: "CPO",
    time: "13:55",
    action: "Teste A/B iniciado",
    description: "2 variações em 500 usuários",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: 5,
    agent: "Dani Ferreira",
    role: "Analista",
    time: "13:42",
    action: "Oportunidade identificada",
    description: "nicho de e-commerce sustentável",
    color: "from-yellow-500 to-orange-600",
  },
];

export default function ActionTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">Últimas Decisões Automáticas</h2>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-4 -mx-8 px-8">
        <div className="flex gap-6 min-w-min">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 w-80 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-emerald-500/40 transition-all group cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {action.agent.split(" ")[0][0]}{action.agent.split(" ")[1][0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{action.agent}</p>
                  <p className="text-xs text-muted-foreground">{action.role}</p>
                </div>
              </div>

              {/* Time */}
              <p className="text-xs text-muted-foreground mb-3">{action.time}</p>

              {/* Action */}
              <p className="text-sm font-semibold text-foreground mb-1">{action.action}</p>
              <p className="text-sm text-muted-foreground mb-4">{action.description}</p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 hover:border-emerald-500/40">
                  Ver resultado
                </button>
                <button className="flex-1 px-3 py-2 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 hover:border-red-500/40">
                  Reverter
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
