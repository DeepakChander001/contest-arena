import { AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google: any;
  }
}

const Auth = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  
  const { isAuthenticated, user, handleGoogleLogin: handleAuthLogin } = useAuth();
  const navigate = useNavigate();
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle credential response
  const handleCredentialResponse = useCallback(async (response: any) => {
    console.log("✅ Credential received");
    setLoading(true);
    setMessage(null);

    try {
      const credential = response.credential;
      
      if (!credential) {
        throw new Error('No credential received');
      }

      // Decode JWT token
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      const userInfo = JSON.parse(jsonPayload);
      console.log("✅ User authenticated:", userInfo.email);

      // Map to format expected by AuthContext
      const googleUserData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      // Call AuthContext handler to process the login (fetches Circle data)
      await handleAuthLogin(googleUserData);
      
      // Important: Use window.location instead of navigate to avoid React conflicts
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to sign in. Please try again.' });
      setLoading(false);
    }
  }, [handleAuthLogin]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    let mounted = true;
    let scriptElement: HTMLScriptElement | null = null;

    const initializeGoogle = () => {
      if (!mounted) return;

      console.log("🔄 Initializing Google Sign-In...");

      // Check if already initialized
      if (window.google?.accounts?.id) {
        try {
          // Initialize
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Create a container div that React won't touch
          const buttonContainer = document.createElement('div');
          buttonContainer.id = 'g_id_signin_container';
          
          // Find the placeholder and append container
          const placeholder = document.getElementById('google-signin-placeholder');
          if (placeholder && mounted) {
            // Clear placeholder first
            placeholder.innerHTML = '';
            placeholder.appendChild(buttonContainer);

            // Render button in the isolated container
            window.google.accounts.id.renderButton(
              buttonContainer,
              {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 280,
              }
            );

            console.log("✅ Google button rendered");
            setGoogleReady(true);
          }
        } catch (err) {
          console.error("❌ Failed to initialize:", err);
          if (mounted) {
            setMessage({ type: 'error', text: 'Failed to initialize Google Sign-In' });
          }
        }
      }
    };

    const loadScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        initializeGoogle();
        return;
      }

      scriptElement = document.createElement('script');
      scriptElement.src = 'https://accounts.google.com/gsi/client';
      scriptElement.async = true;
      scriptElement.defer = true;

      scriptElement.onload = () => {
        if (mounted) {
          initializeGoogle();
        }
      };

      scriptElement.onerror = () => {
        if (mounted) {
          setMessage({ type: 'error', text: 'Failed to load Google Sign-In' });
        }
      };

      document.head.appendChild(scriptElement);
    };

    if (GOOGLE_CLIENT_ID) {
      loadScript();
    } else {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
    }

    // Cleanup function
    return () => {
      mounted = false;
      // Don't remove the script as it might be used elsewhere
    };
  }, [GOOGLE_CLIENT_ID, handleCredentialResponse]);

  // Alternative OAuth flow
  const handleAlternativeSignIn = () => {
    console.log("🔄 Alternative sign-in method");
    setLoading(true);

    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Sign-In is not configured.' });
      setLoading(false);
      return;
    }

    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: Math.random().toString(36).substring(7),
    });

    window.location.href = `${authUrl}?${params.toString()}`;
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
                <span className="flex-1">{message.text}</span>
                <button 
                  onClick={() => setMessage(null)} 
                  className="text-xs underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {loading && (
              <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm">Signing you in...</p>
                </div>
              </div>
            )}

            {/* Google Sign-In Button Placeholder */}
            <div 
              id="google-signin-placeholder" 
              className="flex justify-center min-h-[50px] items-center"
              // Important: Don't let React manage this div's children
              suppressHydrationWarning={true}
            >
              {!googleReady && !message && (
                <div className="text-muted-foreground text-sm animate-pulse">
                  Loading Google Sign-In...
                </div>
              )}
            </div>

            {/* Show alternative only if Google button fails */}
            {(message?.type === 'error' || !googleReady) && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-muted-foreground">or</span>
                  </div>
                </div>

                <button
                  onClick={handleAlternativeSignIn}
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
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </>
            )}
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
