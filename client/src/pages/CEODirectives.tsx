import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Mic, Square, Play, Download, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Directive {
  id: number;
  directive: string;
  audioUrl: string | null;
  audioTranscript: string | null;
  strategicDirection: string | null;
  businessModel: string | null;
  targetMarkets: string | null;
  targetChannels: string | null;
  status: ("pending" | "approved" | "rejected" | "in_progress" | "completed") | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Proposal {
  id: number;
  directiveId: number;
  architecture?: string;
  integrations?: any[];
  features?: any[];
  totalEstimatedHours?: number;
  estimatedDays?: number;
  risks?: string[];
  recommendations?: string[];
  status: "pending" | "approved" | "rejected" | "in_progress";
}

export default function CEODirectives() {
  const { user, isAuthenticated } = useAuth();
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedDirective, setSelectedDirective] = useState<Directive | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDirectivesQuery = trpc.ceoAgent.getDirectives.useQuery();
  const sendDirectiveMutation = trpc.ceoAgent.sendDirective.useMutation();
  const generateProposalMutation = trpc.ceoAgent.generateProposal.useMutation();
  const approveProposalMutation = trpc.ceoAgent.approveProposal.useMutation();

  // Load directives
  useEffect(() => {
    if (getDirectivesQuery.data) {
      setDirectives(getDirectivesQuery.data);
    }
  }, [getDirectivesQuery.data]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await handleAudioSubmit(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Erro ao acessar microfone");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Send text directive
  const handleSendDirective = async () => {
    if (!inputValue.trim()) return;

    try {
      await sendDirectiveMutation.mutateAsync({
        content: inputValue,
        messageType: "text",
      });
      setInputValue("");
      toast.success("Direção enviada para análise do CTO");
      getDirectivesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao enviar direção");
    }
  };

  // Send audio directive
  const handleAudioSubmit = async (audioBlob: Blob) => {
    try {
      await sendDirectiveMutation.mutateAsync({
        content: "", // Will be filled by transcription
        messageType: "audio",
        audioBlob,
      });
      toast.success("Áudio enviado para transcrição e análise");
      getDirectivesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao enviar áudio");
    }
  };

  // Generate proposal
  const handleGenerateProposal = async (directiveId: number) => {
    try {
      const proposal = await generateProposalMutation.mutateAsync({
        directiveId,
      });
      setProposal(proposal);
      toast.success("Proposta gerada pelo CTO");
    } catch (error) {
      toast.error("Erro ao gerar proposta");
    }
  };

  // Approve proposal
  const handleApproveProposal = async () => {
    if (!proposal) return;

    try {
      await approveProposalMutation.mutateAsync({
        proposalId: proposal.id,
      });
      toast.success("Proposta aprovada! CTO começando execução...");
      setProposal(null);
      getDirectivesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao aprovar proposta");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 CEO Directives</h1>
          <p className="text-slate-400">
            Dê direções estratégicas ao seu CTO Agent. Ele analisará e criará um plano técnico de execução.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Area */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">📝 Nova Direção</h2>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-500 rounded px-3 py-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-300">Gravando... {formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Text Input */}
              <Textarea
                placeholder="Descreva sua direção estratégica. Ex: 'Vamos vender seguros via WhatsApp com pagamento Stripe'"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isRecording || sendDirectiveMutation.isPending}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mb-4 min-h-[120px]"
              />

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSendDirective}
                  disabled={!inputValue.trim() || isRecording || sendDirectiveMutation.isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {sendDirectiveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Direção
                </Button>

                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={inputValue.length > 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Gravar Áudio
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Parar
                  </Button>
                )}
              </div>
            </Card>

            {/* Directives List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">📋 Suas Direções</h2>
              {directives.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                  <p className="text-slate-400">Nenhuma direção ainda. Comece a falar com seu CTO!</p>
                </Card>
              ) : (
                directives.map((directive) => (
                  <Card
                    key={directive.id}
                    className={`bg-slate-800 border-slate-700 p-6 cursor-pointer transition-all ${
                      selectedDirective?.id === directive.id ? "ring-2 ring-emerald-500" : ""
                    }`}
                    onClick={() => setSelectedDirective(directive)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-2">{directive.directive.substring(0, 100)}...</p>
                        {directive.audioTranscript && (
                          <p className="text-sm text-slate-400 italic mb-2">🎤 {directive.audioTranscript}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {directive.strategicDirection && (
                            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                              {directive.strategicDirection}
                            </span>
                          )}
                          {directive.businessModel && (
                            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                              {directive.businessModel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {directive.status === "pending" && (
                          <span className="flex items-center gap-1 text-xs text-yellow-400">
                            <Clock className="w-4 h-4" /> Pendente
                          </span>
                        )}
                        {directive.status === "approved" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> Aprovada
                          </span>
                        )}
                        {directive.status === "in_progress" && (
                          <span className="flex items-center gap-1 text-xs text-blue-400">
                            <Loader2 className="w-4 h-4 animate-spin" /> Executando
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(directive.createdAt).toLocaleString("pt-BR")}</p>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Proposal Area */}
          <div className="lg:col-span-1">
            {selectedDirective && !proposal ? (
              <Card className="bg-slate-800 border-slate-700 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-white mb-4">🤖 CTO Agent</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Clique para gerar uma proposta técnica do CTO Agent baseada nesta direção.
                </p>
                <Button
                  onClick={() => handleGenerateProposal(selectedDirective.id)}
                  disabled={generateProposalMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generateProposalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Gerar Proposta
                </Button>
              </Card>
            ) : proposal ? (
              <Card className="bg-slate-800 border-slate-700 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-white mb-4">📊 Proposta do CTO</h2>

                {/* Estimates */}
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-slate-700/50 rounded">
                    <p className="text-xs text-slate-400">Tempo Estimado</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {proposal.totalEstimatedHours}h
                    </p>
                    <p className="text-xs text-slate-400">({proposal.estimatedDays} dias)</p>
                  </div>

                  {proposal.integrations && proposal.integrations.length > 0 && (
                    <div className="p-3 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400 mb-2">Integrações Necessárias</p>
                      <div className="space-y-1">
                        {proposal.integrations.map((integration: any, idx: number) => (
                          <p key={idx} className="text-sm text-slate-300">
                            • {integration.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposal.risks && proposal.risks.length > 0 && (
                    <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                      <p className="text-xs text-yellow-300 font-semibold mb-2">⚠️ Riscos</p>
                      <ul className="space-y-1">
                        {proposal.risks.map((risk: string, idx: number) => (
                          <li key={idx} className="text-xs text-yellow-200">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleApproveProposal}
                    disabled={approveProposalMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {approveProposalMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Aprovar & Executar
                  </Button>
                  <Button
                    onClick={() => setProposal(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Rejeitar
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-white mb-4">💡 Dicas</h2>
                <div className="space-y-3 text-sm text-slate-400">
                  <p>
                    <strong className="text-white">📝 Texto:</strong> Descreva sua direção estratégica
                  </p>
                  <p>
                    <strong className="text-white">🎤 Áudio:</strong> Fale naturalmente para maior contexto
                  </p>
                  <p>
                    <strong className="text-white">🤖 CTO:</strong> IA analisará e criará plano técnico
                  </p>
                  <p>
                    <strong className="text-white">✅ Aprovação:</strong> Você aprova antes de executar
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
