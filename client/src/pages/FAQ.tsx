import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    id: "payment-1",
    category: "Pagamentos",
    question: "Como faço para fazer upgrade de plano?",
    answer:
      "Para fazer upgrade de plano, acesse a página de Pagamentos, clique em 'Mudar Plano' e selecione o novo plano desejado. O valor será ajustado proporcionalmente no seu próximo ciclo de cobrança.",
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "payment-2",
    category: "Pagamentos",
    question: "Qual é a política de reembolso?",
    answer:
      "Oferecemos reembolso total em até 14 dias após a compra, sem perguntas. Após esse período, o reembolso é avaliado caso a caso. Entre em contato com nosso suporte para solicitar um reembolso.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "payment-3",
    category: "Pagamentos",
    question: "Meu pagamento foi recusado. O que fazer?",
    answer:
      "Se seu pagamento foi recusado, verifique se: 1) O cartão está ativo e com saldo, 2) Os dados estão corretos, 3) Não há bloqueios de segurança. Tente novamente ou use outro cartão. Se o problema persistir, entre em contato com seu banco.",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  {
    id: "auth-1",
    category: "Autenticação",
    question: "Como faço login na plataforma?",
    answer:
      "Clique em 'Entrar com Manus' na página inicial. Você será redirecionado para o portal de login onde pode usar Google, Microsoft, Apple ou email. Após autenticar, você será redirecionado para seu dashboard.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "auth-2",
    category: "Autenticação",
    question: "Esqueci minha senha. Como recupero?",
    answer:
      "Na página de login, clique em 'Esqueceu a senha?'. Você receberá um email com instruções para redefinir sua senha. O link é válido por 24 horas.",
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "auth-3",
    category: "Autenticação",
    question: "Posso usar a mesma conta em múltiplos dispositivos?",
    answer:
      "Sim! Você pode acessar sua conta de qualquer dispositivo. Suas sessões são sincronizadas automaticamente. Se detectarmos atividade suspeita, você será solicitado a fazer login novamente por segurança.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "features-1",
    category: "Features",
    question: "Quantos agentes posso usar no plano Starter?",
    answer:
      "No plano Starter, você tem acesso a todos os 9 agentes especializados (CEO, CMO, CFO, COO, CPO, CHRO, Coach, Analista e Otimizador). A diferença entre planos é o número de negócios que você pode gerenciar.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "features-2",
    category: "Features",
    question: "Qual é a diferença entre os planos?",
    answer:
      "Starter: 1 negócio, R$99/mês. Pro: 5 negócios, R$299/mês + agentes customizados + API. Enterprise: Negócios ilimitados, R$999/mês + suporte dedicado. Licença Única: Compra única de R$2.999 para uso perpétuo.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "features-3",
    category: "Features",
    question: "Os agentes funcionam 24/7?",
    answer:
      "Sim! Os agentes funcionam 24/7 de forma autônoma. Você pode visualizar suas ações, decisões e resultados em tempo real no dashboard. Há limites de gastos configuráveis para garantir controle.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "integration-1",
    category: "Integrações",
    question: "Quais plataformas são suportadas?",
    answer:
      "Atualmente suportamos Mercado Livre, Amazon, Stripe, Twilio, WhatsApp e Gmail. Mais integrações estão sendo adicionadas. Você pode solicitar uma integração específica através do formulário de contato.",
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "integration-2",
    category: "Integrações",
    question: "Como configuro uma integração?",
    answer:
      "Acesse Configurações > Integrações e selecione a plataforma desejada. Você será guiado através de um wizard de autenticação. Após conectar, os agentes terão acesso automático aos dados e poderão executar ações.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "support-1",
    category: "Suporte",
    question: "Como entro em contato com o suporte?",
    answer:
      "Você pode nos contatar através de: Email (support@nucleoventures.com), Chat (disponível no dashboard), ou Discord (comunidade). Tempo de resposta: Starter 48h, Pro 24h, Enterprise 2h.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    id: "support-2",
    category: "Suporte",
    question: "Há documentação disponível?",
    answer:
      "Sim! Temos documentação completa em docs.nucleoventures.com, incluindo guias de setup, API documentation, e tutoriais em vídeo. Também temos uma comunidade ativa no Discord.",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
];

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const categories = ["Todos", ...Array.from(new Set(faqItems.map((item) => item.category)))];
  const filteredItems =
    selectedCategory === "Todos" ? faqItems : faqItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold text-foreground">Perguntas Frequentes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Encontre respostas para as dúvidas mais comuns sobre Núcleo Ventures
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border border-border bg-card hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
                      <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedId === item.id ? (
                      <ChevronUp className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Answer */}
                {expandedId === item.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-foreground leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Não encontrou sua resposta?</h2>
            <p className="text-muted-foreground mb-6">
              Entre em contato com nosso time de suporte. Estamos aqui para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg">
                Enviar Email
              </Button>
              <Button variant="outline" size="lg">
                Chat ao Vivo
              </Button>
              <Button variant="outline" size="lg">
                Discord
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-500 mb-2">{faqItems.length}</div>
            <p className="text-muted-foreground">Perguntas Respondidas</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{categories.length - 1}</div>
            <p className="text-muted-foreground">Categorias</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
            <p className="text-muted-foreground">Suporte Disponível</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
