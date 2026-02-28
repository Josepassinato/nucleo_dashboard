import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const [, navigate] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get("plan") || "unknown";

  const planNames: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    license: "Licença Única",
  };

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-emerald-900/30 rounded-full">
            <CheckCircle className="w-16 h-16 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Pagamento Confirmado!</h1>
        <p className="text-slate-300 mb-6">
          Obrigado por escolher o plano <span className="font-semibold">{planNames[plan]}</span>
        </p>

        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 mb-6">
          <p className="text-emerald-300 text-sm">
            ✓ Sua assinatura está ativa
            <br />
            ✓ Você pode começar a usar agora
            <br />
            ✓ Recebeu um email de confirmação
          </p>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Você será redirecionado para o dashboard em alguns segundos...
        </p>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg"
        >
          Ir para o Dashboard Agora
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Voltar para Home
        </Button>
      </Card>
    </div>
  );
}
