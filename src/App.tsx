// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApolloProvider } from "@apollo/client";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import CompanyNews from "./pages/CompanyNews";
import Charting from "./pages/Charting";
import Screening from "./pages/Screening";
import Watchlists from "./pages/Watchlists";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SsoCallback from "./pages/SsoCallback";
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import { apolloClient } from "./lib/graphql/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Navigate to="/feed" replace />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/auth/sso/callback" element={<SsoCallback />} />
                  
                  {/* Social Routes - Direct components without layout wrapper */}
                  <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/feed/explore" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/feed/notifications" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/feed/messages" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/feed/create" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/feed/*" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/activity" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  
                  {/* Protected Dashboard Layout Routes */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/company/:ticker/news" element={<CompanyNews />} />
                    <Route path="/charting" element={<Charting />} />
                    <Route path="/screening" element={<Screening />} />
                    <Route path="/watchlists" element={<Watchlists />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </SidebarProvider>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;