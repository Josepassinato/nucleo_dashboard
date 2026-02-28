import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Zap, Shield, Rocket, Users, TrendingUp, Code } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const plans = [
    {
      name: "Starter",
      price: "99",
      period: "/mês",
      description: "Para começar",
      features: [
        "1 negócio",
        "Dashboard completo",
        "9 agentes",
        "Integração Mercado Livre/Amazon",
        "Suporte comunidade",
        "Atualizações grátis"
      ],
      cta: "Começar Agora",
      highlighted: false
    },
    {
      name: "Pro",
      price: "299",
      period: "/mês",
      description: "Para crescer",
      features: [
        "5 negócios",
        "Tudo do Starter +",
        "Agentes customizados",
        "API acesso total",
        "Suporte email 24h",
        "Analytics avançado"
      ],
      cta: "Começar Agora",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "999",
      period: "/mês",
      description: "Para escalar",
      features: [
        "Negócios ilimitados",
        "Tudo do Pro +",
        "Suporte dedicado",
        "Onboarding personalizado",
        "SLA 99.9%",
        "Integrações customizadas"
      ],
      cta: "Fale Conosco",
      highlighted: false
    },
    {
      name: "Licença Única",
      price: "2.999",
      period: "único",
      description: "Para sempre",
      features: [
        "Negócios ilimitados",
        "Sem mensalidades",
        "Atualizações vitalícias",
        "Código-fonte",
        "Suporte comunitário",
        "Use comercialmente"
      ],
      cta: "Comprar Agora",
      highlighted: false
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "100% Autônomo",
      description: "Seus agentes decidem, executam e otimizam sem intervenção humana"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "9 Agentes Especializados",
      description: "CEO, CMO, CFO, COO, CPO, CHRO, Coach, Analista e Otimizador"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Integração Total",
      description: "Mercado Livre, Amazon, Stripe, Twilio, WhatsApp, Gmail e mais"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "LGPD, CCPA, criptografia AES-256, auditoria completa"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Open Source",
      description: "Código-fonte disponível, customize como quiser"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Deploy em 5 Minutos",
      description: "Instale com 1 comando, configure com wizard interativo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Núcleo Ventures
          </div>
          <div className="flex gap-4">
            <Link href="/onboarding-new">
              <a className="px-4 py-2 rounded-lg hover:bg-slate-700 transition">
                Dashboard
              </a>
            </Link>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <motion.div className="max-w-4xl mx-auto text-center" {...fadeInUp}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Sua Diretoria de IA
            <span className="block text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text">
              100% Autônoma
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Crie agentes inteligentes que decidem, executam, pagam e otimizam seu negócio — tudo sozinho, com cara humana pro mundo externo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/onboarding-new">
              <a className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold flex items-center gap-2 transition">
                Começar Grátis <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
            <button className="px-8 py-4 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition">
              Ver Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-4xl font-bold text-center mb-16" {...fadeInUp}>
            Por Que Núcleo Ventures?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-emerald-500 transition"
              >
                <div className="text-emerald-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-4xl font-bold text-center mb-4" {...fadeInUp}>
            Planos e Preços
          </motion.h2>
          <motion.p className="text-center text-slate-300 mb-16" {...fadeInUp}>
            Escolha o plano perfeito para seu negócio. Todos incluem 14 dias grátis.
          </motion.p>

          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-lg p-8 flex flex-col ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-emerald-500 to-blue-600 ring-2 ring-emerald-400 scale-105"
                    : "bg-slate-700/50 border border-slate-600"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-300 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-sm text-slate-300">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/checkout?plan=${plan.name.toLowerCase().replace(" ", "-")}`}>
                  <a className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? "bg-white text-emerald-600 hover:bg-slate-100"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}>
                    {plan.cta}
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
        <motion.div className="max-w-2xl mx-auto text-center" {...fadeInUp}>
          <h2 className="text-4xl font-bold mb-6">Pronto para Revolucionar Seu Negócio?</h2>
          <p className="text-lg mb-8 text-white/90">
            Comece grátis hoje. Sem cartão de crédito necessário. Cancele a qualquer momento.
          </p>
          <Link href="/onboarding-new">
            <a className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-slate-100 transition">
              Começar Agora <ArrowRight className="w-5 h-5 inline ml-2" />
            </a>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">Produto</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Preços</a></li>
              <li><a href="#" className="hover:text-white">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white">Sobre</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white">Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Termos</a></li>
              <li><a href="#" className="hover:text-white">LGPD</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Comunidade</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="https://github.com/Josepassinato/nucleo-ventures" className="hover:text-white">GitHub</a></li>
              <li><a href="#" className="hover:text-white">Discord</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 Núcleo Ventures. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
