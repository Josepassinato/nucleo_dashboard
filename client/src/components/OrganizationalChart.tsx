import { motion } from "framer-motion";
import { Flame, Lightbulb, Clock } from "lucide-react";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  score: number;
  stress: number;
  status: "active" | "idle" | "warning";
  icons?: ("fire" | "bulb" | "clock")[];
  lastAction?: string;
}

const agents: Agent[] = [
  {
    id: "lucas",
    name: "Lucas Mendes",
    role: "CEO",
    score: 9.4,
    stress: 32,
    status: "active",
    icons: ["fire"],
    lastAction: "Orquestrou nova estratégia de crescimento",
  },
  {
    id: "mariana",
    name: "Mariana Oliveira",
    role: "CMO",
    score: 8.9,
    stress: 58,
    status: "active",
    icons: ["bulb"],
    lastAction: "Criou 3 Reels – engajamento +22%",
  },
  {
    id: "pedro",
    name: "Pedro Lima",
    role: "CFO",
    score: 9.1,
    stress: 25,
    status: "active",
    icons: [],
    lastAction: "Otimizou fluxo de caixa",
  },
  {
    id: "carla",
    name: "Carla Santos",
    role: "COO",
    score: 8.7,
    stress: 42,
    status: "active",
    icons: ["clock"],
    lastAction: "Resolveu 5 tickets de atendimento",
  },
  {
    id: "rafael",
    name: "Rafael Torres",
    role: "CPO",
    score: 8.3,
    stress: 65,
    status: "warning",
    icons: ["bulb"],
    lastAction: "Testou novo feature A/B",
  },
  {
    id: "ana",
    name: "Ana Costa",
    role: "CHRO",
    score: 9.0,
    stress: 35,
    status: "active",
    icons: [],
    lastAction: "Onboarding de novo agente",
  },
  {
    id: "ze",
    name: "Zé Carvalho",
    role: "Coach",
    score: 9.2,
    stress: 20,
    status: "active",
    icons: [],
    lastAction: "Sessão de coaching com Rafael",
  },
  {
    id: "dani",
    name: "Dani Ferreira",
    role: "Analista",
    score: 8.8,
    stress: 48,
    status: "active",
    icons: [],
    lastAction: "Identificou 3 oportunidades de mercado",
  },
];

function getStressColor(stress: number): string {
  if (stress < 40) return "from-emerald-500 to-emerald-600";
  if (stress < 70) return "from-yellow-500 to-yellow-600";
  return "from-red-500 to-red-600";
}

function getStatusGlow(status: string): string {
  if (status === "active") return "shadow-lg shadow-emerald-500/50";
  if (status === "warning") return "shadow-lg shadow-yellow-500/50";
  return "shadow-lg shadow-slate-500/50";
}

export default function OrganizationalChart() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-foreground mb-8">Sua Diretoria Ativa</h2>

      {/* Owner Node */}
      <div className="flex justify-center mb-12">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full blur-xl opacity-30" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-yellow-300 cursor-pointer hover:border-yellow-200 transition-all">
            <div className="text-center">
              <p className="text-white font-bold text-sm">Você</p>
              <p className="text-yellow-100 text-xs">Dono</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedAgent(agent)}
            className="cursor-pointer group"
          >
            <div className={`relative mb-3 ${getStatusGlow(agent.status)}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${getStressColor(agent.stress)} rounded-full blur-lg opacity-40`} />
              <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getStressColor(agent.stress)} flex items-center justify-center border-2 border-slate-700 group-hover:border-emerald-400 transition-all`}>
                <div className="text-center">
                  <p className="text-white font-bold text-xs">{agent.name.split(" ")[0]}</p>
                  <p className="text-white/80 text-xs">{agent.score}</p>
                </div>
              </div>
            </div>

            {/* Icons */}
            <div className="flex justify-center gap-1 mb-2 h-4">
              {agent.icons?.includes("fire") && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Flame className="w-3 h-3 text-orange-500" />
                </motion.div>
              )}
              {agent.icons?.includes("bulb") && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Lightbulb className="w-3 h-3 text-yellow-400" />
                </motion.div>
              )}
              {agent.icons?.includes("clock") && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Clock className="w-3 h-3 text-blue-400" />
                </motion.div>
              )}
            </div>

            {/* Labels */}
            <div className="text-center">
              <p className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
              <p className="text-xs text-yellow-400 mt-1">Estresse: {agent.stress}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tooltip on hover */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedAgent.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-sm"><span className="text-muted-foreground">Última ação:</span> <span className="text-emerald-400">{selectedAgent.lastAction}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Estresse:</span> <span className="text-yellow-400">{selectedAgent.stress}%</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Score:</span> <span className="text-emerald-400">{selectedAgent.score}/10</span></p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
              Dar feedback
            </button>
            <button className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
              Ver histórico
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
