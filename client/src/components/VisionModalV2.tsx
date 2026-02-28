import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function VisionModalV2() {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      disabled
      className="fixed bottom-8 right-8 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white font-black text-sm tracking-wider rounded-full shadow-lg opacity-50 cursor-not-allowed z-40 flex items-center gap-2"
    >
      <Zap className="w-5 h-5" />
      VISÃO (Em Desenvolvimento)
    </motion.button>
  );
}
