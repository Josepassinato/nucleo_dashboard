import DashboardHeader from "@/components/DashboardHeader";
import HeroBlock from "@/components/HeroBlock";
import StatusCards from "@/components/StatusCards";
import OrganizationalChart from "@/components/OrganizationalChart";
import ActionTimeline from "@/components/ActionTimeline";
import DashboardFooter from "@/components/DashboardFooter";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
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
            <p className="text-sm text-muted-foreground mb-2">Deseja ver o design alternativo?</p>
            <p className="text-xs text-muted-foreground">Temos uma segunda versão com design mais ousado e moderno.</p>
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
