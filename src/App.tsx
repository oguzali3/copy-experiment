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
import apolloClient from "./integrations/apollo/apolloClient";
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
                <div className="min-h-screen flex w-full dark:bg-[#1c1c20] dark:text-white">
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/auth/sso/callback" element={<SsoCallback />} />
                    
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
                      <Route path="/feed" element={<Feed />} />
                      <Route path="/feed/*" element={<Feed />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/profile" element={<Profile />} />

                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                </div>
              </SidebarProvider>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;
