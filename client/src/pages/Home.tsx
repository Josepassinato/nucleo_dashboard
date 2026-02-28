import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import HeroBlock from "@/components/HeroBlock";
import StatusCards from "@/components/StatusCards";
import OrganizationalChart from "@/components/OrganizationalChart";
import ActionTimeline from "@/components/ActionTimeline";
import DashboardFooter from "@/components/DashboardFooter";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  // If not authenticated, show login prompt
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <h1 className="text-4xl font-bold mb-4">🚀 Núcleo Ventures</h1>
          <p className="text-lg text-slate-300 mb-8">
            Seu negócio 100% automatizado com IA
          </p>
          <Button
            size="lg"
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
          >
            Entrar com Manus
          </Button>
        </motion.div>
      </div>
    );
  }

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-20 bg-slate-700" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <div className="h-32 bg-slate-700 rounded" />
          <div className="h-40 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      {/* Main content container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <HeroBlock />
        <StatusCards />
        <OrganizationalChart />
        <ActionTimeline />

        {/* Version Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="border-t border-slate-700 pt-8 pb-20 mt-12 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Deseja ver o design alternativo?
            </p>
            <p className="text-xs text-muted-foreground">
              Temos uma segunda versão com design mais ousado e moderno.
            </p>
          </div>
          <Link href="/v2">
            <motion.a
              whileHover={{ x: 4 }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-8 py-3 rounded-lg gap-2 group flex items-center transition-all"
            >
              Ver Dashboard V2
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </Link>
        </motion.div>

        <DashboardFooter />
      </main>
    </div>
  );
}
