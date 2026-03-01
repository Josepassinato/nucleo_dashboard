import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export default function DashboardFooter() {
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [vision, setVision] = useState("");

  const handleLeaderboard = () => {
    alert("Leaderboard completo será lançado em breve.");
  };

  const handleSettings = () => {
    alert("Configurações de limites será lançado em breve.");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="border-t border-slate-700 pt-8 pb-20 mt-12 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Main CTA */}
        <Button
          onClick={() => setShowVisionModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg rounded-lg gap-2 group"
        >
          Definir Nova Visão
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Links */}
        <div className="flex gap-6 text-sm">
          <button 
            onClick={handleLeaderboard}
            className="text-muted-foreground hover:text-emerald-400 transition-colors font-medium cursor-pointer"
          >
            Ver Leaderboard Completo
          </button>
          <button 
            onClick={handleSettings}
            className="text-muted-foreground hover:text-emerald-400 transition-colors font-medium cursor-pointer"
          >
            Configurações de Limites
          </button>
        </div>
      </motion.div>

      {/* Vision Modal */}
      {showVisionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowVisionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-emerald-500/30 rounded-xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Definir Nova Visão</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Descreva a nova direção estratégica para a Núcleo Ventures. Os agentes ajustarão suas ações automaticamente.
            </p>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="Ex: Focar em crescimento de receita recorrente com redução de 20% em custos operacionais..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowVisionModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  console.log("Nova visão definida:", vision);
                  alert("Visão definida com sucesso! Os agentes ajustarão suas ações.");
                  setShowVisionModal(false);
                  setVision("");
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Enviar Visão
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
