import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Index from "./pages/Index";
import RideDetail from "./pages/RideDetail";
import OfferRide from "./pages/OfferRide";
import Profile from "./pages/Profile";
import TravelPlanner from "./pages/TravelPlanner";
import PinkCorridor from "./pages/PinkCorridor";
import Transit from "./pages/Transit";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WorkflowDownload from "@/components/WorkflowDownload";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/ride/:id" element={<RideDetail />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/travel-planner" element={<TravelPlanner />} />
            <Route path="/pink-corridor" element={<PinkCorridor />} />
            <Route path="/transit" element={<Transit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WorkflowDownload />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
