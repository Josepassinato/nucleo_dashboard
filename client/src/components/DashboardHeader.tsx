import { Button } from "@/components/ui/button";
import { AlertTriangle, Moon, Sun, Power } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("há 2 min");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-background border-b border-border z-50">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Ⓝ</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Núcleo</h1>
            <p className="text-xs text-muted-foreground">Diretoria Autônoma</p>
          </div>
        </motion.div>

        {/* Center: Time & Last Update */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <p className="text-sm font-medium text-foreground">{currentTime}</p>
          <p className="text-xs text-muted-foreground">Última atualização: {lastUpdate}</p>
        </motion.div>

        {/* Right: Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
            <span className="text-white font-bold text-sm">JC</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-lg"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
