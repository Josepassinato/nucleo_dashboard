import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const planId = (urlParams.get("plan") as "starter" | "pro" | "enterprise" | "license") || "starter";
  
  const createCheckout = trpc.stripe.createCheckout.useMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleCheckout = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await createCheckout.mutateAsync({
        planId,
        successUrl: `${window.location.origin}/success?plan=${planId}`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (result.url) {
        // Open checkout in new tab
        window.open(result.url, "_blank");
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to create checkout session");
    } finally {
      setIsProcessing(false);
    }
  };

  const planDetails = {
    starter: { name: "Starter", price: "R$ 99", period: "/mês", features: ["1 negócio", "Suporte por email", "Dashboard básico"] },
    pro: { name: "Pro", price: "R$ 299", period: "/mês", features: ["5 negócios", "Suporte prioritário", "Analytics avançado"] },
    enterprise: { name: "Enterprise", price: "R$ 999", period: "/mês", features: ["Ilimitado", "Suporte dedicado", "Integrações customizadas"] },
    license: { name: "Licença Única", price: "R$ 2.999", period: "único", features: ["Ilimitado", "Suporte vitalício", "Atualizações grátis"] },
  };

  const plan = planDetails[planId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{plan.name}</h1>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-emerald-400">{plan.price}</span>
            <span className="text-slate-400">{plan.period}</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={isProcessing || createCheckout.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {isProcessing || createCheckout.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Pagar Agora"
          )}
        </Button>

        <p className="text-center text-slate-400 text-sm mt-4">
          Você será redirecionado para o Stripe para completar o pagamento
        </p>

        <Button
          variant="outline"
          onClick={() => navigate("/pricing")}
          className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Voltar
        </Button>
      </Card>
    </div>
  );
}
