import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY) {
        setShow(false); // Scrolling down
      } else {
        setShow(true); // Scrolling up
      }
      
      // Add background when scrolled
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent",
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
            <a href="#product" className="text-black hover:text-[#077dfa] transition-colors">
              Product
            </a>
            <a href="#pricing" className="text-black hover:text-[#077dfa] transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-black hover:text-[#077dfa] transition-colors">
              About Us
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex"
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
          </div>
        </div>
      </div>
    </header>
  );
};