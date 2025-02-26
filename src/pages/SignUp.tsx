// src/pages/SignUp.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { SignUpForm } from "@/components/auth/SignUpForm";

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      // The redirect will be handled by the provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Error signing up with Google");
      console.error("Google sign up error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-grow pt-32 pb-32 flex items-center justify-center">
        <SignUpForm onGoogleSignUp={handleGoogleSignUp} />
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;