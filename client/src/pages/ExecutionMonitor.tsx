import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useExecutionMonitor } from "@/hooks/useExecutionMonitor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  RotateCcw,
  Eye,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ExecutionLog {
  id: number;
  executionId: number;
  level: "info" | "warning" | "error" | "success";
  message: string;
  details?: any;
  createdAt: Date;
}

interface Execution {
  id: number;
  proposalId: number;
  userId: number;
  phase: number | null;
  phaseName: string | null;
  deployStatus: ("pending" | "deploying" | "deployed" | "failed") | null;
  progressPercent: number | null;
  estimatedTimeRemaining: number | null;
  testsPassed: boolean | null;
  canRollback: boolean | null;
  logs?: ExecutionLog[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ExecutionMonitor() {
  const { user, isAuthenticated } = useAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [useWebSocket, setUseWebSocket] = useState(true);
  const [pollInterval, setPollInterval] = useState(2000);

  // Get all executions
  const getExecutionsQuery = trpc.ceoAgent.getExecutions.useQuery(undefined, {
    staleTime: 1000,
  });

  // Use the execution monitor hook for selected execution
  const executionMonitor = useExecutionMonitor({
    executionId: selectedExecution?.id,
    pollInterval,
    useWebSocket,
  });

  // Update executions list
  useEffect(() => {
    if (getExecutionsQuery.data) {
      setExecutions(getExecutionsQuery.data);
      // Auto-select first execution if none selected
      if (!selectedExecution && getExecutionsQuery.data.length > 0) {
        setSelectedExecution(getExecutionsQuery.data[0]);
      }
    }
  }, [getExecutionsQuery.data, selectedExecution]);

  // Update selected execution with real-time data
  useEffect(() => {
    if (executionMonitor.execution) {
      setSelectedExecution(executionMonitor.execution);
      // Also update in the list
      setExecutions((prev) =>
        prev.map((e) =>
          e.id === executionMonitor.execution?.id
            ? executionMonitor.execution
            : e
        )
      );
    }
  }, [executionMonitor.execution]);

  const handleRollback = async (executionId: number) => {
    if (!confirm("Tem certeza que deseja fazer rollback desta execução?")) return;

    try {
      await executionMonitor.rollback({ executionId });
      // Refetch after rollback
      await getExecutionsQuery.refetch();
    } catch (error) {
      console.error("Rollback error:", error);
    }
  };

  const getStatusColor = (status: string | null) => {
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "deployed":
        return <CheckCircle2 className="w-5 h-5" />;
      case "deploying":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">⚡ Execution Monitor</h1>
            <div className="flex items-center gap-2">
              {executionMonitor.isConnected ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 border border-emerald-500 rounded text-emerald-400 text-sm">
                  <Wifi className="w-4 h-4" />
                  WebSocket Conectado
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 border border-yellow-500 rounded text-yellow-400 text-sm">
                  <WifiOff className="w-4 h-4" />
                  Polling (Fallback)
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-400">Monitore a execução em tempo real das propostas aprovadas</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            onClick={() => setUseWebSocket(!useWebSocket)}
            variant={useWebSocket ? "default" : "outline"}
            className={useWebSocket ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Wifi className="w-4 h-4 mr-2" />
            {useWebSocket ? "WebSocket ON" : "WebSocket OFF"}
          </Button>
          <Button
            onClick={() => getExecutionsQuery.refetch()}
            disabled={getExecutionsQuery.isLoading}
            variant="outline"
          >
            {getExecutionsQuery.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Refresh Execuções
          </Button>
          <Button
            onClick={() => executionMonitor.refetch()}
            disabled={executionMonitor.isLoading}
            variant="outline"
          >
            {executionMonitor.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Refresh Detalhes
          </Button>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Poll Interval:</label>
            <select
              value={pollInterval}
              onChange={(e) => setPollInterval(Number(e.target.value))}
              className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
            </select>
          </div>
        </div>

        {/* Error Messages */}
        {executionMonitor.error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded text-red-300">
            {executionMonitor.error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Executions List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white mb-4">📋 Execuções</h2>
              {executions.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhuma execução em andamento</p>
              ) : (
                <div className="space-y-2">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      onClick={() => setSelectedExecution(execution)}
                      className={`p-3 rounded cursor-pointer transition-all ${
                        selectedExecution?.id === execution.id
                          ? "bg-emerald-900/50 border border-emerald-500"
                          : "bg-slate-700/50 border border-slate-600 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white text-sm">
                          {execution.phaseName || "Fase Desconhecida"}
                        </p>
                        <span className={`${getStatusColor(execution.deployStatus)}`}>
                          {getStatusIcon(execution.deployStatus)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">
                        Fase {execution.phase}
                      </div>
                      <Progress
                        value={execution.progressPercent}
                        className="h-1 bg-slate-600"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {execution.progressPercent || 0}% completo
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Execution Details */}
          <div className="lg:col-span-2">
            {selectedExecution ? (
              <div className="space-y-6">
                {/* Status Card */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedExecution.phaseName || "Fase Desconhecida"}
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Fase {selectedExecution.phase || "?"}
                      </p>
                    </div>
                    <div
                      className={`text-4xl ${getStatusColor(
                        selectedExecution.deployStatus || "pending"
                      )}`}
                    >
                      {getStatusIcon(selectedExecution.deployStatus || "pending")}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Progresso</span>
                      <span className="text-sm font-semibold text-white">
                        {selectedExecution.progressPercent || 0}%
                      </span>
                    </div>
                    <Progress
                      value={selectedExecution.progressPercent || 0}
                      className="h-2 bg-slate-700"
                    />
                  </div>

                  {/* Status Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <p
                        className={`${getStatusColor(
                          selectedExecution.deployStatus || "pending"
                        )}`}
                      >
                        {(selectedExecution.deployStatus || "pending").toUpperCase()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400 mb-1">Tempo Restante</p>
                      <p className="font-semibold text-white">
                        {selectedExecution.estimatedTimeRemaining &&
                        selectedExecution.estimatedTimeRemaining > 0
                          ? `${Math.ceil(
                              selectedExecution.estimatedTimeRemaining / 60
                            )}min`
                          : "Calculando..."}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400 mb-1">Testes</p>
                      <p
                        className={
                          selectedExecution.testsPassed
                            ? "text-emerald-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {selectedExecution.testsPassed === true
                          ? "✓ Passou"
                          : "✗ Falhou"}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400 mb-1">Rollback</p>
                      <p
                        className={
                          selectedExecution.canRollback
                            ? "text-emerald-400 font-semibold"
                            : "text-slate-400 font-semibold"
                        }
                      >
                        {selectedExecution.canRollback
                          ? "✓ Disponível"
                          : "✗ Indisponível"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedExecution.deployStatus === "failed" &&
                    selectedExecution.canRollback && (
                      <Button
                        onClick={() => handleRollback(selectedExecution.id)}
                        disabled={executionMonitor.isRollingBack}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {executionMonitor.isRollingBack ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Fazer Rollback
                      </Button>
                    )}
                </Card>

                {/* Logs */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📝 Logs de Execução</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedExecution.logs && selectedExecution.logs.length > 0 ? (
                      selectedExecution.logs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-3 rounded text-sm font-mono ${
                            log.level === "error"
                              ? "bg-red-900/30 text-red-300"
                              : log.level === "warning"
                              ? "bg-yellow-900/30 text-yellow-300"
                              : log.level === "success"
                              ? "bg-emerald-900/30 text-emerald-300"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                            </span>
                            <span className="flex-1">{log.message}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">Nenhum log disponível</p>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                <p className="text-slate-400">Selecione uma execução para ver detalhes</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
