import DashboardHeader from "@/components/DashboardHeader";
import HeroBlock from "@/components/HeroBlock";
import StatusCards from "@/components/StatusCards";
import OrganizationalChart from "@/components/OrganizationalChart";
import ActionTimeline from "@/components/ActionTimeline";
import DashboardFooter from "@/components/DashboardFooter";

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
        <DashboardFooter />
      </main>
    </div>
  );
}
