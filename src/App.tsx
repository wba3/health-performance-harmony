
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/navbar/Navbar";
import Dashboard from "./pages/Dashboard";
import Sleep from "./pages/Sleep";
import Training from "./pages/Training";
import AICoach from "./pages/AICoach";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/training" element={<Training />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
