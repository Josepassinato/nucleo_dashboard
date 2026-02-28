import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ApiConfig {
  region: "br" | "us" | null;
  ecommerce: {
    platform: "mercadolivre" | "amazon" | null;
    apiKey: string;
    apiSecret: string;
  };
  payment: {
    provider: "stripe" | null;
    secretKey: string;
    publishableKey: string;
  };
  ai: {
    provider: "gemini" | null;
    apiKey: string;
  };
  communication: {
    twilio: {
      accountSid: string;
      authToken: string;
    };
    whatsapp: {
      businessAccountId: string;
      accessToken: string;
    };
    gmail: {
      clientId: string;
      clientSecret: string;
    };
  };
}

const steps = [
  { id: 1, title: "Bem-vindo", description: "Escolha sua região" },
  { id: 2, title: "E-commerce", description: "Configure sua loja" },
  { id: 3, title: "Pagamentos", description: "Stripe" },
  { id: 4, title: "IA", description: "Gemini" },
  { id: 5, title: "Comunicação", description: "Twilio, WhatsApp, Gmail" },
  { id: 6, title: "Pronto!", description: "Comece a usar" },
];

const apiLinks = {
  br: {
    mercadolivre: "https://developers.mercadolivre.com.br",
    mercadolivreGuide: "https://developers.mercadolivre.com.br/pt_br/autenticacao",
  },
  us: {
    amazon: "https://developer.amazon.com",
    amazonGuide: "https://docs.developer.amazon.com/sp-api/docs/sp-api-overview",
  },
  stripe: "https://dashboard.stripe.com/apikeys",
  stripeGuide: "https://stripe.com/docs/keys",
  gemini: "https://aistudio.google.com/app/apikey",
  geminiGuide: "https://ai.google.dev/docs",
  twilio: "https://console.twilio.com",
  twilioGuide: "https://www.twilio.com/docs/usage/api",
  gmail: "https://console.cloud.google.com/apis/credentials",
  gmailGuide: "https://developers.google.com/gmail/api/guides",
  download: "https://github.com/seu-usuario/nucleo-ventures/releases",
};

const ApiLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
  >
    {label}
    <ExternalLink className="w-4 h-4" />
  </a>
);

const CopyButton = ({ text }: { text: string }) => (
  <button
    onClick={() => {
      navigator.clipboard.writeText(text);
      toast.success("Copiado!");
    }}
    className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
  >
    <Copy className="w-4 h-4" />
  </button>
);

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ApiConfig>({
    region: null,
    ecommerce: { platform: null, apiKey: "", apiSecret: "" },
    payment: { provider: null, secretKey: "", publishableKey: "" },
    ai: { provider: null, apiKey: "" },
    communication: {
      twilio: { accountSid: "", authToken: "" },
      whatsapp: { businessAccountId: "", accessToken: "" },
      gmail: { clientId: "", clientSecret: "" },
    },
  });

  const handleNext = async () => {
    if (currentStep === 1 && !config.region) {
      toast.error("Selecione uma região");
      return;
    }

    if (currentStep === 2 && (!config.ecommerce.apiKey || !config.ecommerce.apiSecret)) {
      toast.error("Preencha todas as chaves de E-commerce");
      return;
    }

    if (currentStep === 5) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      toast.success("Configurações salvas!");
    }

    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">🚀 Núcleo Ventures</h1>
              <p className="text-sm text-slate-400">Configure seu negócio autônomo</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Passo {currentStep} de 6</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden"
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: step.id <= currentStep ? 1 : 0.5,
                  backgroundColor: step.id <= currentStep ? "#10b981" : "#334155",
                }}
              >
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: step.id < currentStep ? "100%" : step.id === currentStep ? "50%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome & Region Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo ao Núcleo Ventures! 👋</h2>
                <p className="text-slate-300 mb-8">
                  Vamos configurar seu negócio autônomo em poucos minutos. Escolha sua região para começar.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setConfig({ ...config, region: "br" });
                      handleNext();
                    }}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      config.region === "br"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-4xl mb-2">🇧🇷</div>
                    <h3 className="text-xl font-bold text-white">Brasil</h3>
                    <p className="text-sm text-slate-400 mt-2">Mercado Livre, LGPD, Real</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setConfig({ ...config, region: "us" });
                      handleNext();
                    }}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      config.region === "us"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-4xl mb-2">🇺🇸</div>
                    <h3 className="text-xl font-bold text-white">United States</h3>
                    <p className="text-sm text-slate-400 mt-2">Amazon, CCPA, Dollar</p>
                  </motion.button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-300">Primeira vez?</p>
                      <p className="text-xs text-blue-200 mt-1">
                        Você pode mudar de região depois. Escolha onde está seu negócio agora.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: E-commerce Configuration */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {config.region === "br" ? "🇧🇷 Mercado Livre" : "🇺🇸 Amazon"}
                </h2>
                <p className="text-slate-400 mb-6">Configure sua plataforma de e-commerce</p>

                <div className="space-y-4">
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {config.region === "br" ? "Obter credenciais Mercado Livre" : "Obter credenciais Amazon"}
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                          {config.region === "br"
                            ? "Acesse o console de desenvolvedores do Mercado Livre para criar uma aplicação"
                            : "Acesse o Seller Central da Amazon para gerar suas chaves"}
                        </p>
                        <div className="flex gap-3">
                          <ApiLink
                            href={config.region === "br" ? apiLinks.br.mercadolivre : apiLinks.us.amazon}
                            label={config.region === "br" ? "Ir para Mercado Livre" : "Ir para Amazon"}
                          />
                          <span className="text-slate-500">•</span>
                          <ApiLink
                            href={config.region === "br" ? apiLinks.br.mercadolivreGuide : apiLinks.us.amazonGuide}
                            label="Ver documentação"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">
                      {config.region === "br" ? "Client ID (Mercado Livre)" : "AWS Access Key ID"}
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        placeholder="Sua chave aqui"
                        value={config.ecommerce.apiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ecommerce: { ...config.ecommerce, apiKey: e.target.value },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <CopyButton text={config.ecommerce.apiKey} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">
                      {config.region === "br" ? "Client Secret" : "AWS Secret Access Key"}
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        placeholder="Sua chave aqui"
                        value={config.ecommerce.apiSecret}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ecommerce: { ...config.ecommerce, apiSecret: e.target.value },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <CopyButton text={config.ecommerce.apiSecret} />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600 mt-4"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando conexão...
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Payment Configuration */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">💳 Stripe</h2>
                <p className="text-slate-400 mb-6">Configure pagamentos com Stripe</p>

                <div className="space-y-4">
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">Obter chaves Stripe</h3>
                        <p className="text-sm text-slate-400 mb-3">
                          Acesse seu dashboard do Stripe para copiar suas chaves de API
                        </p>
                        <div className="flex gap-3">
                          <ApiLink href={apiLinks.stripe} label="Ir para Stripe Dashboard" />
                          <span className="text-slate-500">•</span>
                          <ApiLink href={apiLinks.stripeGuide} label="Ver documentação" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Secret Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        placeholder="sk_live_..."
                        value={config.payment.secretKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: { ...config.payment, secretKey: e.target.value },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <CopyButton text={config.payment.secretKey} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Publishable Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        placeholder="pk_live_..."
                        value={config.payment.publishableKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: { ...config.payment, publishableKey: e.target.value },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <CopyButton text={config.payment.publishableKey} />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600 mt-4"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando conexão...
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: AI Configuration */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">🤖 Google Gemini</h2>
                <p className="text-slate-400 mb-6">Configure a IA que vai gerenciar seu negócio</p>

                <div className="space-y-4">
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">Obter API Key Gemini</h3>
                        <p className="text-sm text-slate-400 mb-3">
                          Acesse o Google AI Studio para gerar sua chave de API (100% grátis)
                        </p>
                        <div className="flex gap-3">
                          <ApiLink href={apiLinks.gemini} label="Ir para Google AI Studio" />
                          <span className="text-slate-500">•</span>
                          <ApiLink href={apiLinks.geminiGuide} label="Ver documentação" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        placeholder="Sua chave Gemini"
                        value={config.ai.apiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ai: { ...config.ai, apiKey: e.target.value },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                      />
                      <CopyButton text={config.ai.apiKey} />
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">Grátis até 60 requisições/minuto</p>
                        <p className="text-xs text-emerald-300">Perfeito para começar seu negócio</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600 mt-4"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando conexão...
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Communication Configuration */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">📱 Comunicação</h2>
                <p className="text-slate-400 mb-6">Configure canais de comunicação (opcional)</p>

                <div className="space-y-6">
                  {/* Twilio */}
                  <div className="border-b border-slate-700 pb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Twilio (SMS/WhatsApp)</h3>
                        <p className="text-sm text-slate-400 mt-1">Envie mensagens automaticamente</p>
                      </div>
                      <ApiLink href={apiLinks.twilio} label="Ir para Twilio" />
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Account SID"
                        value={config.communication.twilio.accountSid}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            communication: {
                              ...config.communication,
                              twilio: { ...config.communication.twilio, accountSid: e.target.value },
                            },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Auth Token"
                        type="password"
                        value={config.communication.twilio.authToken}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            communication: {
                              ...config.communication,
                              twilio: { ...config.communication.twilio, authToken: e.target.value },
                            },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Gmail */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Gmail</h3>
                        <p className="text-sm text-slate-400 mt-1">Envie e-mails automaticamente</p>
                      </div>
                      <ApiLink href={apiLinks.gmail} label="Ir para Google Cloud" />
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Client ID"
                        value={config.communication.gmail.clientId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            communication: {
                              ...config.communication,
                              gmail: { ...config.communication.gmail, clientId: e.target.value },
                            },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Client Secret"
                        type="password"
                        value={config.communication.gmail.clientSecret}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            communication: {
                              ...config.communication,
                              gmail: { ...config.communication.gmail, clientSecret: e.target.value },
                            },
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-300">Opcional por enquanto</p>
                        <p className="text-xs text-blue-200">Você pode configurar depois</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 6: Success */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6"
                >
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">Tudo Configurado! 🎉</h2>
                <p className="text-slate-400 mb-8">
                  Seu negócio autônomo está pronto para começar. Vamos ao dashboard!
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">O que vem agora?</h3>
                  <ul className="text-sm text-emerald-300 space-y-2 text-left">
                    <li>✓ Seus agentes de IA começam a trabalhar</li>
                    <li>✓ Dashboard mostra métricas em tempo real</li>
                    <li>✓ Automação de vendas e marketing</li>
                    <li>✓ Relatórios diários de performance</li>
                  </ul>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-8">
                  <p className="text-sm text-slate-300 mb-3">
                    <strong>Próximo passo:</strong> Baixe o framework CLI para gerenciar seu negócio via terminal
                  </p>
                  <a
                    href={apiLinks.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Baixar Núcleo CLI
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Ir para o Dashboard
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
