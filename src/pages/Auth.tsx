import { AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

const Auth = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, user, handleGoogleLogin: handleAuthLogin } = useAuth();
  const navigate = useNavigate();
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google credential response
  const handleCredentialResponse = async (response: any) => {
    console.log("✅ Credential received:", response);
    setLoading(true);
    setMessage(null);

    try {
      const credential = response.credential;
      
      if (!credential) {
        throw new Error('No credential received');
      }

      // Decode JWT token to get user info
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      const userInfo = JSON.parse(jsonPayload);
      console.log("✅ User info decoded:", userInfo);

      // Map to format expected by AuthContext
      const googleUserData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      // Call AuthContext handler to process the login (fetches Circle data)
      await handleAuthLogin(googleUserData);
      
      // Redirect to dashboard (AuthContext will handle this, but ensure it happens)
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Error processing credential:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to sign in. Please try again.' });
      setLoading(false);
    }
  };

  // Make function available globally
  useEffect(() => {
    window.handleCredentialResponse = handleCredentialResponse;
  }, [handleCredentialResponse]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    console.log("🔄 Initializing Google Sign-In...");
    console.log("✅ Google Client ID found:", GOOGLE_CLIENT_ID ? 'Yes' : 'No');

    if (!GOOGLE_CLIENT_ID) {
      setMessage({ 
        type: 'error', 
        text: 'Google Sign-In is not configured properly.' 
      });
      return;
    }

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      
      if (existingScript) {
        console.log("✅ Google script already loaded");
        initializeGoogleSignIn();
        return;
      }

      console.log("📥 Loading Google Identity Services script...");
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("✅ Google script loaded successfully");
        initializeGoogleSignIn();
      };

      script.onerror = () => {
        console.error("❌ Failed to load Google script");
        setMessage({ type: 'error', text: 'Failed to load Google Sign-In. Please refresh the page.' });
      };

      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      // Wait for google object to be available
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle);
          
          console.log("🔧 Initializing Google accounts...");
          
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: window.handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
              ux_mode: 'popup',
              itp_support: true
            });

            console.log("✅ Google accounts initialized");
            
            // Render the button
            if (googleButtonRef.current) {
              console.log("🎨 Rendering Google button...");
              
              window.google.accounts.id.renderButton(
                googleButtonRef.current,
                {
                  type: 'standard',
                  theme: 'outline',
                  size: 'large',
                  text: 'signin_with',
                  shape: 'rectangular',
                  logo_alignment: 'left',
                  width: 280
                }
              );
              
              console.log("✅ Google button rendered");
              setGoogleLoaded(true);
            }
          } catch (err) {
            console.error("❌ Error initializing Google Sign-In:", err);
            setMessage({ type: 'error', text: 'Failed to initialize Google Sign-In' });
          }
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google?.accounts?.id) {
          console.error("❌ Google Sign-In failed to load after 5 seconds");
          setMessage({ type: 'error', text: 'Google Sign-In took too long to load. Please refresh.' });
        }
      }, 5000);
    };

    loadGoogleScript();
  }, [GOOGLE_CLIENT_ID]);

  // Manual fallback login method
  const handleManualSignIn = () => {
    console.log("🔄 Manual sign-in triggered");
    
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Sign-In is not configured.' });
      return;
    }

    setLoading(true);
    
    // Try to trigger Google prompt
    if (window.google?.accounts?.id) {
      console.log("📤 Triggering Google One Tap...");
      window.google.accounts.id.prompt();
    } else {
      // Fallback to OAuth redirect
      console.log("🔄 Falling back to OAuth redirect...");
      
      const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/auth/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });

      window.location.href = `${authUrl}?${params.toString()}`;
    }
  };

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

            {/* Google Identity Services Button */}
            <div 
              ref={googleButtonRef}
              id="googleButton"
              className="flex justify-center min-h-[44px] w-full"
            >
              {!googleLoaded && !loading && (
                <div className="text-muted-foreground text-sm">Loading Google Sign-In...</div>
              )}
            </div>

            {/* Manual Fallback Button */}
            <button
              onClick={handleManualSignIn}
              disabled={loading}
              className={`w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 border border-gray-300 shadow-lg hover:shadow-xl ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="button"
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
                  <span>Sign in with Google (Alternative)</span>
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
