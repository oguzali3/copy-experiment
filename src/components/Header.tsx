
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useSessionContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession && !isLoading) {
          // Clear any stale session data
          await supabase.auth.signOut();
          
          const protectedRoutes = ['/portfolio', '/dashboard', '/watchlists'];
          if (protectedRoutes.includes(location.pathname)) {
            toast.error("Session expired. Please sign in again.");
            navigate('/signin');
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Only show error toast if we're on a protected route
        const protectedRoutes = ['/portfolio', '/dashboard', '/watchlists'];
        if (protectedRoutes.includes(location.pathname)) {
          toast.error("Authentication error. Please sign in again.");
          navigate('/signin');
        }
      }
    };

    checkAndRefreshSession();
  }, [session, isLoading, location.pathname, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        console.error("Error:", error.message);
      } else {
        // Clear any stored session data
        localStorage.removeItem('supabase.auth.token');
        toast.success("Signed out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error:", error);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b dark:bg-[#1c1c20]/95 dark:border-gray-800" : "bg-transparent",
        show ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#077dfa]">Logo</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#product" className="text-black hover:text-[#077dfa] transition-colors dark:text-gray-200 dark:hover:text-[#077dfa]">
              Product
            </a>
            <a href="#pricing" className="text-black hover:text-[#077dfa] transition-colors dark:text-gray-200 dark:hover:text-[#077dfa]">
              Pricing
            </a>
            <a href="#about" className="text-black hover:text-[#077dfa] transition-colors dark:text-gray-200 dark:hover:text-[#077dfa]">
              About Us
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button 
                  className="bg-[#077dfa] hover:bg-[#077dfa]/90"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-[#077dfa] hover:bg-[#077dfa]/90"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
