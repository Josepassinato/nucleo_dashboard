import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Code2,
  TestTube,
  Rocket,
  RotateCcw,
} from "lucide-react";

interface TimelinePhase {
  id: number;
  name: string;
  status: "completed" | "active" | "pending" | "failed";
  timestamp?: Date;
  duration?: number;
}

interface ExecutionTimelineProps {
  phases: TimelinePhase[];
  currentPhase?: number;
}

const PHASE_ICONS: Record<string, React.ReactNode> = {
  "Code Generation": <Code2 className="w-4 h-4" />,
  Testing: <TestTube className="w-4 h-4" />,
  Deployment: <Rocket className="w-4 h-4" />,
  Rollback: <RotateCcw className="w-4 h-4" />,
};

const PHASE_COLORS: Record<
  "completed" | "active" | "pending" | "failed",
  string
> = {
  completed: "bg-emerald-500 text-white",
  active: "bg-blue-500 text-white animate-pulse",
  pending: "bg-slate-600 text-slate-300",
  failed: "bg-red-500 text-white",
};

const PHASE_BORDER_COLORS: Record<
  "completed" | "active" | "pending" | "failed",
  string
> = {
  completed: "border-emerald-500",
  active: "border-blue-500",
  pending: "border-slate-600",
  failed: "border-red-500",
};

export function ExecutionTimeline({
  phases,
  currentPhase,
}: ExecutionTimelineProps) {
  if (phases.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Nenhuma fase disponível</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-slate-600 to-slate-600" />

      {/* Phases */}
      <div className="space-y-6">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;
          const isActive = phase.status === "active";
          const isCompleted = phase.status === "completed";
          const isFailed = phase.status === "failed";

          return (
            <div key={phase.id} className="relative pl-20">
              {/* Phase indicator */}
              <div
                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${PHASE_COLORS[phase.status]} ${PHASE_BORDER_COLORS[phase.status]} transition-all`}
              >
                {isCompleted && <CheckCircle2 className="w-6 h-6" />}
                {isActive && <Loader2 className="w-6 h-6 animate-spin" />}
                {isFailed && <AlertCircle className="w-6 h-6" />}
                {phase.status === "pending" && <Clock className="w-6 h-6" />}
              </div>

              {/* Phase content */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? "bg-blue-900/20 border-blue-500/50"
                    : isCompleted
                    ? "bg-emerald-900/20 border-emerald-500/30"
                    : isFailed
                    ? "bg-red-900/20 border-red-500/30"
                    : "bg-slate-700/20 border-slate-600/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {phase.name}
                    </span>
                    {PHASE_ICONS[phase.name] && (
                      <span className="text-slate-400">
                        {PHASE_ICONS[phase.name]}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-300 rounded">
                      Em andamento
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded">
                      Concluído
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-xs px-2 py-1 bg-red-500/30 text-red-300 rounded">
                      Falhou
                    </span>
                  )}
                </div>

                {/* Timestamp and duration */}
                {phase.timestamp && (
                  <div className="text-xs text-slate-400">
                    <p>
                      {phase.timestamp.toLocaleTimeString("pt-BR")}
                      {phase.duration && ` • ${phase.duration}s`}
                    </p>
                  </div>
                )}
              </div>

              {/* Connecting line to next phase */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-1 h-6 bg-gradient-to-b from-slate-600 to-slate-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
