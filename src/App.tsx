import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
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
import { useState, useEffect } from 'react';
import { ApolloProvider } from "@apollo/client";
import client from "./integrations/apollo/apolloClient";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [initialSession, setInitialSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setInitialSession(session);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={initialSession}
      >
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full dark:bg-[#1c1c20] dark:text-white">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  
                  {/* Dashboard Layout Routes */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/company/:ticker/news" element={<CompanyNews />} />
                    <Route path="/charting" element={<Charting />} />
                    {/* ApolloProvider for Screening */}
                    <Route
                      path="/screening"
                      element={
                        <ApolloProvider client={client}>
                          <Screening />
                        </ApolloProvider>
                      }
                    />                    <Route path="/watchlists" element={<Watchlists />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;