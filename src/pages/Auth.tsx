import { useGoogleLogin } from "@react-oauth/google";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const Auth = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, user, handleGoogleLogin: handleAuthLogin } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Use useGoogleLogin hook instead of GoogleLogin component to avoid width issues
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setMessage(null);
      
      console.log('✅ Google OAuth Success');
      console.log('📝 Token Response:', tokenResponse);
      
      try {
        // Fetch user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo: GoogleUserInfo = await response.json();
        console.log('👤 User Info:', userInfo);
        
        // Map Google user info to the format expected by handleAuthLogin
        const googleUserData = {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          sub: userInfo.sub,
        };
        
        // Call AuthContext handler to process the login (fetches Circle data)
        await handleAuthLogin(googleUserData);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
        
      } catch (error: any) {
        console.error('❌ Error:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to complete login. Please try again.' });
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('❌ Google Login Failed:', error);
      setMessage({ type: 'error', text: 'Google login failed. Please try again.' });
      setLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-card-premium p-12 text-center space-y-8 hover-glow card-shimmer">
          {/* Logo - PREMIUM ENHANCEMENT */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse-glow">
              <img 
                src="/logo.png" 
                alt="1to10x Contest Arena" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Heading - PREMIUM ENHANCEMENT */}
          <div>
            <h1 className="text-4xl font-bold mb-3 gradient-text">1to10x Contest Arena</h1>
            <p className="text-xl text-muted-foreground">
              Compete. Level Up. Win Rewards.
            </p>
          </div>

          <div className="space-y-4">
            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}

            <button
              onClick={() => login()}
              disabled={loading}
              className={`w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 border border-gray-300 shadow-lg hover:shadow-xl ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Sign in with your Google account</p>
            <p>Powered by 10X AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
