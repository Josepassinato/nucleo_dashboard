import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, Circle, Play, Award, Zap, Rocket, Target } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface QuickWin {
  id: "viewedOnboarding" | "createdFirstAgent" | "configuredFirstIntegration" | "completedFirstAction";
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  videoUrl?: string;
}

interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  tips: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: "Bem-vindo ao Núcleo Ventures",
    description: "Conheça a plataforma e seus principais recursos",
    duration: "2 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tips: [
      "Explore o dashboard principal",
      "Conheça os 9 agentes especializados",
      "Entenda o fluxo de automação",
    ],
  },
  {
    step: 2,
    title: "Criando seu Primeiro Agente",
    description: "Aprenda a criar e configurar um agente CEO",
    duration: "3 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tips: [
      "Defina os objetivos do agente",
      "Configure permissões de acesso",
      "Teste com uma ação simples",
    ],
  },
  {
    step: 3,
    title: "Integrando suas Primeiras Ferramentas",
    description: "Conecte Stripe, Google Analytics e Mercado Livre",
    duration: "4 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tips: [
      "Obtenha as credenciais das plataformas",
      "Teste a conexão antes de usar",
      "Configure permissões mínimas necessárias",
    ],
  },
  {
    step: 4,
    title: "Automatizando sua Primeira Ação",
    description: "Configure uma automação end-to-end",
    duration: "5 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tips: [
      "Escolha um processo simples",
      "Defina triggers e ações",
      "Monitore a execução",
    ],
  },
];

export default function OnboardingInteractive() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const initializeMutation = trpc.onboarding.initialize.useMutation();
  const getProgressQuery = trpc.onboarding.getProgress.useQuery();
  const markQuickWinMutation = trpc.onboarding.markQuickWin.useMutation();
  const trackVideoMutation = trpc.onboarding.trackVideo.useMutation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Initialize onboarding
  useEffect(() => {
    if (user && !getProgressQuery.data) {
      initializeMutation.mutate();
    }
  }, [user]);

  // Update quick wins from progress data
  useEffect(() => {
    if (getProgressQuery.data?.progress) {
      const progress = getProgressQuery.data.progress;
      const wins: QuickWin[] = [
        {
          id: "viewedOnboarding",
          title: "Visualizar Onboarding",
          description: "Assista aos vídeos de introdução",
          icon: <Play className="w-5 h-5" />,
          completed: progress.viewedOnboarding || false,
        },
        {
          id: "createdFirstAgent",
          title: "Criar Primeiro Agente",
          description: "Configure um agente CEO",
          icon: <Zap className="w-5 h-5" />,
          completed: progress.createdFirstAgent || false,
        },
        {
          id: "configuredFirstIntegration",
          title: "Primeira Integração",
          description: "Conecte uma ferramenta externa",
          icon: <Rocket className="w-5 h-5" />,
          completed: progress.configuredFirstIntegration || false,
        },
        {
          id: "completedFirstAction",
          title: "Primeira Automação",
          description: "Execute uma ação automatizada",
          icon: <Target className="w-5 h-5" />,
          completed: progress.completedFirstAction || false,
        },
      ];

      setQuickWins(wins);
      setCompletionPercentage(progress.completionPercentage || 0);
    }
  }, [getProgressQuery.data]);

  const handleMarkQuickWin = async (winId: QuickWin["id"]) => {
    try {
      await markQuickWinMutation.mutateAsync(winId);
      toast.success("Parabéns! Você completou uma etapa!");
      getProgressQuery.refetch();
    } catch (error) {
      toast.error("Erro ao marcar etapa como completa");
    }
  };

  const handleVideoWatched = async () => {
    try {
      await trackVideoMutation.mutateAsync();
      toast.success("Vídeo registrado!");
      getProgressQuery.refetch();
    } catch (error) {
      toast.error("Erro ao registrar vídeo");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao Núcleo Ventures!</h1>
          <p className="text-slate-400">Complete as etapas abaixo para dominar a plataforma</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Seu Progresso</h2>
            <span className="text-2xl font-bold text-emerald-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Wins Checklist */}
          <div className="md:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Quick Wins
              </h2>

              <div className="space-y-3">
                {quickWins.map((win) => (
                  <div
                    key={win.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      win.completed
                        ? "bg-emerald-900/20 border-emerald-500"
                        : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => !win.completed && handleMarkQuickWin(win.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {win.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${win.completed ? "text-emerald-400" : "text-white"}`}>
                          {win.title}
                        </h3>
                        <p className="text-sm text-slate-400">{win.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {completionPercentage === 100 && (
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Ir para Dashboard
                </Button>
              )}
            </Card>
          </div>

          {/* Video Tutorial */}
          <div className="md:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
                <p className="text-slate-400">{currentStepData.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="inline-block bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
                  </span>
                  <span className="text-slate-400">⏱️ {currentStepData.duration}</span>
                </div>
              </div>

              {/* Video Placeholder */}
              <div className="bg-slate-900 rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <p className="text-slate-400">Vídeo de Tutorial</p>
                  <p className="text-sm text-slate-500 mt-2">{currentStepData.duration}</p>
                </div>
              </div>

              <Button
                onClick={handleVideoWatched}
                disabled={trackVideoMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 mb-6"
              >
                {trackVideoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Marcar como Assistido"
                )}
              </Button>

              {/* Tips */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h3 className="font-semibold text-white mb-3">💡 Dicas Importantes</h3>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← Anterior
              </Button>

              <Button
                onClick={() => setCurrentStep(Math.min(ONBOARDING_STEPS.length - 1, currentStep + 1))}
                disabled={currentStep === ONBOARDING_STEPS.length - 1}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Próximo →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
