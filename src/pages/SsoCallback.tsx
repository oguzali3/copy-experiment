// src/pages/SsoCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';

const SsoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (!token) {
          setError('No authentication token found in the URL');
          toast.error('Authentication failed: No token received');
          setTimeout(() => navigate('/signin'), 4000);
          return;
        }

        // Handle the SSO callback
        await AuthService.handleSsoCallback(token);

        // Success message
        toast.success('Successfully authenticated');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error processing SSO callback:', err);
        setError('An error occurred during authentication');
        toast.error('Authentication failed: Please try again');
        setTimeout(() => navigate('/signin'), 4000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-gray-500 mt-2">Please wait while we finish setting up your account</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <p>Redirecting you back to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p>Authentication successful!</p>
      </div>
      <p>Redirecting you to your dashboard...</p>
    </div>
  );
};

export default SsoCallback;