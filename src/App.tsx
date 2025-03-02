
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import pages
import Index from './pages/Index';
import Dashboard from '@/pages/Dashboard';
import Sleep from '@/pages/Sleep';
import Training from '@/pages/Training';
import AICoach from '@/pages/AICoach';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import TrainingDetailPage from '@/pages/TrainingDetailPage';

// Import the Navbar component
import Navbar from '@/components/navbar/Navbar';

// Import authentication context
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Protected route component to handle authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to the home page but preserve the intended destination
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="app">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sleep" 
          element={
            <ProtectedRoute>
              <Sleep />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/training" 
          element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/training/:id" 
          element={
            <ProtectedRoute>
              <TrainingDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ai-coach" 
          element={
            <ProtectedRoute>
              <AICoach />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
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
