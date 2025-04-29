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
import PublicRoute from "./components/auth/PublicRoute"; // Create this component
import SsoCallback from "./pages/SsoCallback";
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import { apolloClient } from "./lib/graphql/client";
import PostDetail from "./components/social/PostDetail";

// For Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentPage from "./components/payment/PaymentPage";
import SubscriptionPage from "./components/payment/SubscriptionPage";
import SubscriptionSuccessPage from "./components/payment/SubscriptionSuccessPage";
import CreatorPaymentsPage from "./components/payment/CreatorPaymentsPage";
import PortfolioPricingManager from "./components/payment/PortfolioPricingManager";
import PortfolioSubscriptionPage from "./components/payment/PortfolioSubscriptionPage";
import PortfolioAccessView from "./components/portfolio/PortfolioAccessView";
import PortfolioBrowser from "./components/portfolio/PortfolioBrowser";
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error("⚠️ Stripe publishable key is missing! Check your .env file.");
  // You might want to handle this case in your UI
}

// Only initialize Stripe if we have a key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;
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
                <Elements stripe={stripePromise}>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public routes that don't require authentication */}
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
                    <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
                
                    {/* Protected Dashboard Layout Routes */}
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/company/:ticker/news" element={<CompanyNews />} />
                      <Route path="/charting" element={<Charting />} />
                      <Route path="/screening" element={<Screening />} />
                      <Route path="/watchlists" element={<Watchlists />} />
                      

                      <Route path="/portfolios/public" element={<PortfolioBrowser />} />
                      <Route path="/portfolio/view/:portfolioId" element={<PortfolioAccessView />} />

                      {/* Portfolio management (requires auth) */}
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/portfolio/:id" element={<Portfolio />} />
                      
                      <Route path="/portfolio-subscriptions" element={<PortfolioSubscriptionPage />} />
                      <Route path="/portfolio-pricing" element={<PortfolioPricingManager />} />
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Payment and Subscription Routes */}
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/subscriptions" element={<SubscriptionPage />} />
                      <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
                      
                      {/* Creator Dashboard Routes */}
                      <Route path="/creator/payments" element={<CreatorPaymentsPage />} />
                      <Route path="/creator/connect" element={<CreatorPaymentsPage />} />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                </Elements>
              </SidebarProvider>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;