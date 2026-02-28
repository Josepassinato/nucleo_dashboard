import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface APIConfig {
  name: string;
  key: string;
  secret?: string;
  status: "pending" | "testing" | "connected" | "error";
  error?: string;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  apis: string[];
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Escolha sua Região",
    description: "Brasil ou Estados Unidos",
    apis: [],
    icon: "🌍",
  },
  {
    id: 2,
    title: "E-commerce",
    description: "Mercado Livre (BR) ou Amazon (US)",
    apis: ["mercadolivre", "amazon"],
    icon: "🛒",
  },
  {
    id: 3,
    title: "Pagamentos",
    description: "Configure Stripe para processar vendas",
    apis: ["stripe"],
    icon: "💳",
  },
  {
    id: 4,
    title: "IA & Automação",
    description: "Gemini para processamento inteligente",
    apis: ["gemini"],
    icon: "🤖",
  },
  {
    id: 5,
    title: "Comunicação",
    description: "Twilio, WhatsApp, Gmail",
    apis: ["twilio", "whatsapp", "gmail"],
    icon: "📱",
  },
  {
    id: 6,
    title: "Pronto!",
    description: "Seu dashboard está configurado",
    apis: [],
    icon: "🎉",
  },
];

const API_CONFIGS: Record<string, any> = {
  mercadolivre: {
    name: "Mercado Livre",
    fields: [
      { label: "Access Token", placeholder: "Seu token de acesso", type: "password" },
      { label: "Refresh Token", placeholder: "Token de renovação", type: "password" },
    ],
    docs: "https://developers.mercadolivre.com.br",
  },
  amazon: {
    name: "Amazon Seller Central",
    fields: [
      { label: "Access Key", placeholder: "Sua chave de acesso", type: "password" },
      { label: "Secret Key", placeholder: "Sua chave secreta", type: "password" },
    ],
    docs: "https://developer.amazonservices.com",
  },
  stripe: {
    name: "Stripe",
    fields: [
      { label: "API Key", placeholder: "sk_live_...", type: "password" },
      { label: "Publishable Key", placeholder: "pk_live_...", type: "password" },
    ],
    docs: "https://stripe.com/docs",
  },
  gemini: {
    name: "Google Gemini",
    fields: [
      { label: "API Key", placeholder: "Sua chave de API", type: "password" },
    ],
    docs: "https://ai.google.dev",
  },
  twilio: {
    name: "Twilio",
    fields: [
      { label: "Account SID", placeholder: "Seu SID", type: "password" },
      { label: "Auth Token", placeholder: "Seu token", type: "password" },
    ],
    docs: "https://www.twilio.com/docs",
  },
  whatsapp: {
    name: "WhatsApp Business",
    fields: [
      { label: "Phone Number ID", placeholder: "ID do seu número", type: "text" },
      { label: "Access Token", placeholder: "Token de acesso", type: "password" },
    ],
    docs: "https://developers.facebook.com/docs/whatsapp",
  },
  gmail: {
    name: "Gmail",
    fields: [
      { label: "Client ID", placeholder: "ID do cliente", type: "password" },
      { label: "Client Secret", placeholder: "Segredo do cliente", type: "password" },
    ],
    docs: "https://developers.google.com/gmail/api",
  },
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [region, setRegion] = useState<"br" | "us" | null>(null);
  const [apiConfigs, setApiConfigs] = useState<Record<string, APIConfig>>({});
  const [testingApi, setTestingApi] = useState<string | null>(null);

  const handleRegionSelect = (selectedRegion: "br" | "us") => {
    setRegion(selectedRegion);
    setCurrentStep(1);
    toast.success(`Região ${selectedRegion === "br" ? "Brasil" : "EUA"} selecionada!`);
  };

  const handleApiKeyChange = (apiName: string, field: string, value: string) => {
    setApiConfigs((prev) => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        [field]: value,
        status: "pending",
      },
    }));
  };

  const handleTestConnection = async (apiName: string) => {
    setTestingApi(apiName);
    
    try {
      // Simular teste de conexão
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setApiConfigs((prev) => ({
        ...prev,
        [apiName]: {
          ...prev[apiName],
          status: "connected",
        },
      }));
      
      toast.success(`${API_CONFIGS[apiName].name} conectado!`);
    } catch (error) {
      toast.error("Erro ao testar conexão");
    } finally {
      setTestingApi(null);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteOnboarding = () => {
    toast.success("Onboarding concluído! Bem-vindo ao Núcleo Ventures!");
    window.location.href = "/";
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isStepComplete = step.apis.length === 0 || step.apis.every((api) => apiConfigs[api]?.status === "connected");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Núcleo Ventures</h1>
              <p className="text-gray-400">Configuração Inicial - Passo {currentStep + 1} de {ONBOARDING_STEPS.length}</p>
            </div>
            {region && (
              <div className="text-4xl">
                {region === "br" ? "🇧🇷" : "🇺🇸"}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Region Selection */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black tracking-tighter mb-4 italic">{step.title}</h2>
                  <p className="text-xl text-gray-400">{step.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brasil */}
                  <motion.button
                    onClick={() => handleRegionSelect("br")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 rounded-2xl hover:border-green-500 transition-all group"
                  >
                    <div className="text-6xl mb-4">🇧🇷</div>
                    <h3 className="text-2xl font-black mb-2">Brasil</h3>
                    <p className="text-gray-400 mb-4">Mercado Livre, LGPD, Real</p>
                    <div className="flex items-center justify-center gap-2 text-green-400 font-bold group-hover:gap-3 transition-all">
                      Começar <ChevronRight className="w-5 h-5" />
                    </div>
                  </motion.button>

                  {/* EUA */}
                  <motion.button
                    onClick={() => handleRegionSelect("us")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-8 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 rounded-2xl hover:border-blue-500 transition-all group"
                  >
                    <div className="text-6xl mb-4">🇺🇸</div>
                    <h3 className="text-2xl font-black mb-2">Estados Unidos</h3>
                    <p className="text-gray-400 mb-4">Amazon, CCPA, Dólar</p>
                    <div className="flex items-center justify-center gap-2 text-blue-400 font-bold group-hover:gap-3 transition-all">
                      Começar <ChevronRight className="w-5 h-5" />
                    </div>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Steps 2-5: API Configuration */}
            {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <h2 className="text-5xl font-black tracking-tighter mb-4 italic">{step.title}</h2>
                  <p className="text-xl text-gray-400">{step.description}</p>
                </div>

                {/* API Fields */}
                <div className="space-y-6">
                  {step.apis.map((apiName) => {
                    const apiConfig = API_CONFIGS[apiName];
                    const config = apiConfigs[apiName];

                    return (
                      <motion.div
                        key={apiName}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">{apiConfig.name}</h3>
                          {config?.status === "connected" && (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          )}
                          {config?.status === "error" && (
                            <AlertCircle className="w-6 h-6 text-red-400" />
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          {apiConfig.fields.map((field: any, idx: number) => (
                            <div key={idx}>
                              <label className="block text-sm font-bold text-gray-300 mb-2">
                                {field.label}
                              </label>
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={(config as any)?.[field.label.toLowerCase().replace(" ", "_")] || ""}
                                onChange={(e) =>
                                  handleApiKeyChange(
                                    apiName,
                                    field.label.toLowerCase().replace(" ", "_"),
                                    e.target.value
                                  )
                                }
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => handleTestConnection(apiName)}
                            disabled={testingApi === apiName}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            {testingApi === apiName ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              "Testar Conexão"
                            )}
                          </motion.button>
                          <a
                            href={apiConfig.docs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
                          >
                            Docs
                          </a>
                        </div>

                        {config?.error && (
                          <p className="text-red-400 text-sm mt-2">{config.error}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-8">
                  <motion.button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    onClick={handleSkipStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
                  >
                    Pular
                  </motion.button>
                  <motion.button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!isStepComplete && step.apis.length > 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    Próximo <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Final Step */}
            {currentStep === ONBOARDING_STEPS.length - 1 && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-8xl"
                >
                  🎉
                </motion.div>
                <div>
                  <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Pronto!</h2>
                  <p className="text-xl text-gray-400 mb-8">
                    Seu dashboard está configurado e pronto para usar
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-xl p-8 mb-8">
                  <h3 className="text-lg font-bold mb-4">Próximos Passos:</h3>
                  <ul className="text-left space-y-2 text-gray-300">
                    <li>✅ Acesse seu dashboard</li>
                    <li>✅ Configure seus agentes</li>
                    <li>✅ Comece a automatizar seu negócio</li>
                  </ul>
                </div>

                <motion.button
                  onClick={handleCompleteOnboarding}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-lg rounded-lg transition-all"
                >
                  Ir para o Dashboard
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
