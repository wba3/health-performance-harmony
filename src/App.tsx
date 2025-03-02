
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useToast } from "@/components/ui/use-toast";

// Import pages directly instead of from an index file
import Index from './pages/Index';
import Dashboard from '@/pages/Dashboard';
import Sleep from '@/pages/Sleep';
import Training from '@/pages/Training';
import AICoach from '@/pages/AICoach';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import TrainingDetailPage from '@/pages/TrainingDetailPage';

// Import the Navbar component from the correct location
import Navbar from '@/components/navbar/Navbar';

// Create an AuthContext for user authentication
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function App() {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      toast({
        title: "Please login",
        description: "You must be logged in to access this page.",
      });
    }
  }, [isLoggedIn, navigate, toast]);

  return (
    <div className="app">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/training" element={<Training />} />
        <Route path="/training/:id" element={<TrainingDetailPage />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </div>
  );
}

// Wrap the default export with the AuthProvider
const AppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;
