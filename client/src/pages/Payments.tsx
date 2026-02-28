import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function PaymentsPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const getSubscription = trpc.stripe.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
  });

  const getPayments = trpc.stripe.getPayments.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
  });

  const cancelSubscription = trpc.stripe.cancelSubscription.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!getSubscription.isLoading && !getPayments.isLoading) {
      setIsLoading(false);
    }
  }, [getSubscription.isLoading, getPayments.isLoading]);

  const handleCancelSubscription = async () => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
      try {
        await cancelSubscription.mutateAsync();
        getSubscription.refetch();
      } catch (error) {
        console.error("Cancel error:", error);
      }
    }
  };

  const planNames: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    license: "Licença Única",
  };

  const planPrices: Record<string, string> = {
    starter: "R$ 99/mês",
    pro: "R$ 299/mês",
    enterprise: "R$ 999/mês",
    license: "R$ 2.999",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Pagamentos e Assinatura</h1>

        {/* Current Subscription */}
        {getSubscription.data ? (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Assinatura Ativa</h2>
                <p className="text-slate-400">Plano: {planNames[getSubscription.data.planId]}</p>
              </div>
              <div className="bg-emerald-900/30 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Status</p>
                <p className="text-lg font-semibold capitalize">
                  {getSubscription.data.status === "active" ? "Ativa" : getSubscription.data.status}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Preço</p>
                <p className="text-lg font-semibold">{planPrices[getSubscription.data.planId]}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Próxima Renovação</p>
                <p className="text-lg font-semibold">
                  {new Date(getSubscription.data.currentPeriodEnd).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {getSubscription.data.cancelAtPeriodEnd && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-semibold">Assinatura será cancelada</p>
                  <p className="text-yellow-200 text-sm">
                    Você pode usar até {new Date(getSubscription.data.currentPeriodEnd).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!getSubscription.data.cancelAtPeriodEnd && (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={cancelSubscription.isPending}
                  variant="outline"
                  className="border-red-700 text-red-400 hover:bg-red-900/20"
                >
                  {cancelSubscription.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar Assinatura"
                  )}
                </Button>
              )}
              <Button className="bg-emerald-600 hover:bg-emerald-700">Atualizar Plano</Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-slate-400" />
              <div>
                <h2 className="text-xl font-bold">Sem Assinatura Ativa</h2>
                <p className="text-slate-400">Escolha um plano para começar</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/landing")}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              Ver Planos
            </Button>
          </Card>
        )}

        {/* Payment History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Histórico de Pagamentos</h2>

          {getPayments.data && getPayments.data.length > 0 ? (
            <div className="space-y-3">
              {getPayments.data.map((payment) => (
                <Card key={payment.id} className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-900/30 p-3 rounded-lg">
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{planNames[payment.planId]}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">{planPrices[payment.planId]}</p>
                      <p className="text-slate-400 text-sm">Pago</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-6 text-center">
              <p className="text-slate-400">Nenhum pagamento registrado</p>
            </Card>
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Precisa de Ajuda?</h3>
          <div className="space-y-2 text-slate-300">
            <p>📧 Email: support@nucleoventures.com</p>
            <p>💬 Chat: Disponível no dashboard</p>
            <p>📚 Documentação: https://github.com/Josepassinato/nucleo-ventures</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
