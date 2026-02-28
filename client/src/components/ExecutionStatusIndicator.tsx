import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Zap,
  TrendingUp,
} from "lucide-react";

interface ExecutionStatusIndicatorProps {
  status: string | null;
  phase: number | null;
  phaseName: string | null;
  progressPercent: number | null;
  isConnected?: boolean;
  isLoading?: boolean;
}

export function ExecutionStatusIndicator({
  status,
  phase,
  phaseName,
  progressPercent,
  isConnected = false,
  isLoading = false,
}: ExecutionStatusIndicatorProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Pulse animation for active executions
  useEffect(() => {
    if (status === "deploying") {
      const interval = setInterval(() => {
        setPulseAnimation((prev) => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case "deployed":
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case "deploying":
        return (
          <div className={`relative ${pulseAnimation ? "animate-pulse" : ""}`}>
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        );
      case "failed":
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "deployed":
        return "Implantado";
      case "deploying":
        return "Implantando";
      case "failed":
        return "Falhou";
      default:
        return "Pendente";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "deployed":
        return "bg-emerald-900/20 border-emerald-500/50";
      case "deploying":
        return "bg-blue-900/20 border-blue-500/50";
      case "failed":
        return "bg-red-900/20 border-red-500/50";
      default:
        return "bg-yellow-900/20 border-yellow-500/50";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "deployed":
        return "text-emerald-400";
      case "deploying":
        return "text-blue-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-semibold ${getTextColor()}`}>
              {getStatusLabel()}
            </p>
            <p className="text-xs text-slate-400">
              {phaseName || "Fase Desconhecida"}
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <Zap className="w-3 h-3" />
            Live
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Progresso</span>
          <span className={`text-xs font-semibold ${getTextColor()}`}>
            {progressPercent || 0}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === "deployed"
                ? "bg-emerald-500"
                : status === "deploying"
                ? "bg-blue-500"
                : status === "failed"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            style={{ width: `${progressPercent || 0}%` }}
          />
        </div>
      </div>

      {/* Phase Info */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <TrendingUp className="w-3 h-3" />
        <span>Fase {phase || "?"}</span>
        {isLoading && (
          <>
            <span>•</span>
            <span className="text-blue-400">Atualizando...</span>
          </>
        )}
      </div>
    </div>
  );
}
