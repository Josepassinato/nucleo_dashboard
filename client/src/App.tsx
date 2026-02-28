import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardV2 from "./pages/DashboardV2";
import OnboardingPage from "./pages/OnboardingPage";
import LandingPage from "./pages/LandingPage";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Payments from "./pages/Payments";
import AdminDashboard from "./pages/AdminDashboard";
import FAQ from "./pages/FAQ";
import OnboardingInteractive from "./pages/OnboardingInteractive";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/landing"} component={LandingPage} />
      <Route path={"/"} component={Home} />
      <Route path={"/v2"} component={DashboardV2} />
      <Route path={"/onboarding-new"} component={OnboardingPage} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/success"} component={Success} />
      <Route path={"/payments"} component={Payments} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/onboarding-interactive"} component={OnboardingInteractive} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
