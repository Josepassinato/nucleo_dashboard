import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderV2() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent border-b border-blue-500/20 z-50 backdrop-blur-xl"
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left: Logo with bold typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic">NÚCLEO</h1>
            <p className="text-xs text-blue-400 font-bold tracking-widest uppercase">Diretoria Autônoma</p>
          </div>
        </motion.div>

        {/* Right: Controls */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-blue-500/10 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
