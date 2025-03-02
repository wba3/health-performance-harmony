import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Login from "./pages/Login";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
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
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/sleep"
                  element={
                    isAuthenticated ? <Sleep /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/training"
                  element={
                    isAuthenticated ? <Training /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/ai-coach"
                  element={
                    isAuthenticated ? <AICoach /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isAuthenticated ? <Settings /> : <Navigate to="/login" />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
