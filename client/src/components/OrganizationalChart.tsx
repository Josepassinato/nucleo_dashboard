import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function OrganizationalChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">Organização</h2>

      <Card className="bg-slate-900/50 border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-slate-400">Carregando dados da organização...</p>
          <p className="text-xs text-slate-500">Conecte com seu backend para exibir agentes e equipes</p>
        </div>
      </Card>
    </motion.div>
  );
}
