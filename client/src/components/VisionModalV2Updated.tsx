import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useVision } from "@/hooks/useVision";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  impact: boolean;
}

const agents: Agent[] = [
  { id: "mariana", name: "Mariana", role: "Ads & Growth", color: "blue", impact: true },
  { id: "carla", name: "Carla", role: "Operações", color: "gray", impact: false },
  { id: "lucas", name: "Lucas", role: "Gestão Geral", color: "green", impact: true },
];

export default function VisionModalV2Updated() {
  const [isOpen, setIsOpen] = useState(false);
  const [vision, setVision] = useState("");
  const { disseminarVisao, loading, error, result } = useVision();

  const handleSubmit = async () => {
    const visionResult = await disseminarVisao(vision);
    
    if (visionResult && visionResult.status === "success") {
      toast.success("Visão disseminada com sucesso!");
      setTimeout(() => {
        setIsOpen(false);
        setVision("");
      }, 2000);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-sm tracking-wider rounded-full shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:from-blue-500 hover:to-blue-400 transition-all z-40 flex items-center gap-2 group"
      >
        <Zap className="w-5 h-5 group-hover:animate-pulse" />
        DEFINIR VISÃO
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden"
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h3 className="text-4xl font-black tracking-tighter mb-2 italic text-white">DEFINIR NOVA VISÃO</h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">A IA irá decompor sua ordem para toda a diretoria.</p>
            </motion.div>

            {/* Textarea */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-10"
            >
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Ex: Quero focar em retenção este mês. O lucro deve vir de LTV, não de novos anúncios. Ajustem os orçamentos."
                disabled={loading}
                className="w-full bg-transparent border-none text-xl text-white placeholder-gray-700 focus:ring-0 resize-none h-40 font-light leading-relaxed focus:outline-none disabled:opacity-50"
              />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-2 right-2 flex items-center gap-2"
              >
                <span className="text-xs text-blue-400 font-mono uppercase tracking-widest">IA Analisando intenção...</span>
              </motion.div>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Impact visualization */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t border-white/5 pt-8"
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">Impacto Estimado na Estrutura:</p>
              <div className="flex gap-8 justify-center">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: agent.impact ? 1 : 0.4, scale: agent.impact ? 1.1 : 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className={`w-16 h-16 rounded-full border-2 p-0.5 flex items-center justify-center font-black text-white text-lg ${
                        agent.impact
                          ? agent.color === "blue"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-green-500 bg-green-500/10"
                          : "border-gray-700 bg-gray-900/50"
                      }`}
                    >
                      {agent.name[0]}
                    </div>
                    <span className={`text-xs font-bold tracking-tight ${agent.impact ? agent.color === "blue" ? "text-blue-400" : "text-green-400" : "text-gray-500"}`}>
                      {agent.role}
                    </span>
                    {agent.impact && (
                      <motion.div
                        animate={{ scaleX: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`h-1 w-8 rounded-full ${agent.color === "blue" ? "bg-blue-500" : "bg-green-500"}`}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex justify-end gap-4"
            >
              <button
                onClick={() => !loading && setIsOpen(false)}
                className="px-6 py-3 text-gray-500 font-bold text-xs uppercase hover:text-white transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading || !vision.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-blue-600 text-white rounded-full font-black text-xs tracking-widest shadow-lg shadow-blue-500/50 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    DISSEMINAR VISÃO 🚀
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
