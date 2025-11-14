import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

const Auth = () => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  const [scriptLoadAttempts, setScriptLoadAttempts] = useState(0);
  
  const navigate = useNavigate();
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  // Handle Google callback - make it available globally and stable with useCallback
  const handleGoogleCallback = useCallback(async (response: any) => {
    console.log('🎯 Google callback triggered!');
    
    // Handle user cancellation
    if (response.error === 'user_cancel' || response.error === 'popup_closed') {
      console.log('User cancelled sign-in');
      return;
    }

    if (response.error) {
      setMessage({ type: 'error', text: `Sign-in failed: ${response.error}` });
      return;
    }

    if (!response.credential) {
      setMessage({ type: 'error', text: 'No credential received' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Get backend API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.1to10x.com';
      const backendUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
      
      console.log('📡 Calling backend auth endpoint:', `${backendUrl}/auth/complete`);
      
      // Call backend to process Circle data and save to Supabase
      const authResponse = await fetch(`${backendUrl}/auth/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify({
          credential: response.credential
        })
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({ error: 'Authentication failed' }));
        const errorMessage = errorData.error || errorData.message || 'Authentication failed';
        
        // Handle specific error cases
        if (authResponse.status === 404 && (errorData.notFound || errorMessage.includes('Circle'))) {
          throw new Error('Not a Circle member');
        }
        
        throw new Error(errorMessage);
      }

      const { user } = await authResponse.json();
      
      if (!user || !user.email) {
        throw new Error('Invalid user data received from server');
      }
      
      // Save complete user data from Circle/Supabase
      localStorage.setItem('10x-contest-user', JSON.stringify(user));
      
      console.log('✅ User authenticated:', user.email);
      console.log('✅ Sign-in complete, navigating to dashboard...');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error('❌ Authentication error:', err);
      
      let errorMessage = 'Failed to complete sign-in';
      if (err.message.includes('Circle') || err.message.includes('Not a Circle member')) {
        errorMessage = 'You must be a Circle member to access this platform';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
      setLoading(false);
    }
  }, []);

  // Make callback available globally so Google's iframe can call it
  useEffect(() => {
    window.handleGoogleCallback = handleGoogleCallback;
    console.log('✅ Global callback function set');
    
    return () => {
      delete window.handleGoogleCallback;
    };
  }, [handleGoogleCallback]);


  // CRITICAL: Add global styles to ensure button is clickable
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'google-signin-clickable-styles';
    style.innerHTML = `
      /* Ensure Google Sign-In button is clickable */
      #google-signin-container,
      #google-signin-container * {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 999 !important;
      }
      
      /* Specific Google button iframe styles */
      #google-signin-container iframe {
        pointer-events: auto !important;
        z-index: 999 !important;
        position: relative !important;
      }
      
      /* Google's button container */
      .nsm7Bb-HzV7m-LgbsSe {
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 999 !important;
        position: relative !important;
      }
      
      /* Ensure no overlays block the button */
      .g_id_signin {
        pointer-events: auto !important;
        z-index: 999 !important;
      }
      
      /* Remove any potential overlays */
      div[role="button"] {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('google-signin-clickable-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // IMPROVED Google Script Loading with retry logic
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
      return;
    }

    let mounted = true;

    const loadGoogleScript = () => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        console.log('✅ Google already loaded');
        initializeGoogleSignIn();
        return;
      }

      // Check if script tag exists
      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
      
      if (!script) {
        console.log('📥 Creating Google script tag...');
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = false; // Changed to false for immediate loading
        script.id = 'google-signin-script';
        
        // Add multiple event handlers
        script.onload = () => {
          console.log('✅ Script tag loaded');
          if (typeof window !== 'undefined') {
            (window as any).gsiScriptLoaded = true;
          }
          // Wait a bit for Google object to initialize
          setTimeout(() => {
            if (mounted) checkGoogleObject();
          }, 100);
        };

        script.onerror = (error) => {
          console.error('❌ Script loading error:', error);
          if (mounted && scriptLoadAttempts < 3) {
            const currentAttempts = scriptLoadAttempts + 1;
            console.log(`🔄 Retrying script load (attempt ${currentAttempts}/3)...`);
            // Remove failed script and retry
            script.remove();
            setTimeout(() => {
              if (mounted) {
                setScriptLoadAttempts(currentAttempts);
                loadGoogleScript();
              }
            }, 2000);
          } else {
            setMessage({ type: 'error', text: 'Failed to load Google Sign-In. Please refresh the page.' });
          }
        };

        // Add to head instead of body
        document.head.appendChild(script);
      } else {
        console.log('📜 Script tag exists, checking Google object...');
        checkGoogleObject();
      }
    };

    const checkGoogleObject = () => {
      let checkAttempts = 0;
      const maxChecks = 20; // Increased from 10

      const checkInterval = setInterval(() => {
        checkAttempts++;
        console.log(`🔍 Checking for Google object (${checkAttempts}/${maxChecks})...`);

        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          console.log('✅ Google object found!');
          if (mounted) {
            initializeGoogleSignIn();
          }
        } else if (checkAttempts >= maxChecks) {
          clearInterval(checkInterval);
          console.error('❌ Google object not available after maximum attempts');
          
          // Try one more time with a fresh script load
          if (mounted && scriptLoadAttempts < 3) {
            const currentAttempts = scriptLoadAttempts + 1;
            console.log('🔄 Attempting fresh script reload...');
            const oldScript = document.getElementById('google-signin-script');
            if (oldScript) oldScript.remove();
            if (typeof window !== 'undefined') {
              (window as any).gsiScriptLoaded = false;
            }
            setTimeout(() => {
              if (mounted) {
                setScriptLoadAttempts(currentAttempts);
                loadGoogleScript();
              }
            }, 1000);
          } else {
            setMessage({ type: 'error', text: 'Google Sign-In is not loading. Please try refreshing the page or use a different browser.' });
          }
        }
      }, 500);
    };

    const initializeGoogleSignIn = () => {
      if (!googleButtonRef.current || !mounted) {
        console.log('❌ Button ref not ready');
        return;
      }

      try {
        console.log('🔧 Initializing Google Sign-In...');
        
        // Clear container
        googleButtonRef.current.innerHTML = '';

        // Initialize Google Sign-In with global callback (FedCM DISABLED)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: window.handleGoogleCallback, // Use global callback
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: true,
          use_fedcm_for_prompt: false // CRITICAL: Disable FedCM to avoid callback issues
        });

        console.log('🎨 Rendering button...');

        // Render button with fixed width (pixels, not percentage)
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 320,
            logo_alignment: 'left',
            locale: 'en'
          }
        );

        setButtonReady(true);
        console.log('✅ Google Sign-In button rendered successfully!');

        // Optional: Enable One Tap
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.()) {
            const reason = notification.getNotDisplayedReason?.();
            if (reason !== 'suppressed_by_user') {
              console.log('One Tap not displayed:', reason);
            }
          } else {
            console.log('📱 One Tap status:', notification?.getMomentType?.() || notification);
          }
        });
        
        // Debug: Check if button is actually rendered
        setTimeout(() => {
          const iframe = googleButtonRef.current?.querySelector('iframe');
          if (iframe) {
            console.log('✅ Google iframe found:', iframe);
            console.log('Iframe src:', iframe.src);
            // Ensure iframe is interactive
            iframe.style.pointerEvents = 'auto';
            iframe.style.position = 'relative';
            iframe.style.zIndex = '9999';
          } else {
            console.warn('⚠️ Google iframe not found');
          }
        }, 1000);
        
       } catch (err) {
         console.error('❌ Initialization error:', err);
         if (mounted) {
           setMessage({ type: 'error', text: 'Failed to initialize Google Sign-In. Please refresh and try again.' });
         }
       }
     };

    // Start the loading process
    console.log('🚀 Starting Google Sign-In setup...');
    loadGoogleScript();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [GOOGLE_CLIENT_ID, scriptLoadAttempts]);

  // Fallback: Manual reload button
  const handleManualReload = () => {
    console.log('🔄 Manual reload triggered');
    setMessage(null);
    setScriptLoadAttempts(0);
    // Force reload the page
    window.location.reload();
  };

  // Manual OAuth redirect fallback
  const handleManualSignIn = () => {
    console.log('🔄 Manual sign-in triggered');
    
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
      return;
    }

    // Try One Tap first
    if (window.google?.accounts?.id) {
      console.log('📱 Triggering One Tap...');
      window.google.accounts.id.prompt();
    } else {
      // Fallback to OAuth redirect
      const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });

      console.log('🔗 Redirecting to:', `${authUrl}?${params.toString()}`);
      window.location.href = `${authUrl}?${params.toString()}`;
    }
  };

  // OAuth redirect fallback
  const handleOAuthRedirect = () => {
    console.log('🔄 Using OAuth redirect fallback');
    
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
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
      include_granted_scopes: 'true'
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  // Debug function to check Google Sign-In status
  const debugGoogleSignIn = () => {
    console.group('🔍 Debug Information');
    console.log('Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('Google object:', window.google ? '✅ Loaded' : '❌ Not loaded');
    console.log('Google accounts:', window.google?.accounts ? '✅ Available' : '❌ Not available');
    console.log('Google ID:', window.google?.accounts?.id ? '✅ Ready' : '❌ Not ready');
    console.log('Button container:', googleButtonRef.current ? '✅ Exists' : '❌ Missing');
    console.log('Global callback:', window.handleGoogleCallback ? '✅ Set' : '❌ Not set');
    
    if (googleButtonRef.current) {
      const iframe = googleButtonRef.current.querySelector('iframe');
      console.log('Iframe:', iframe ? '✅ Found' : '❌ Not found');
      if (iframe) {
        console.log('Iframe src:', iframe.src);
        console.log('Iframe computed style:', window.getComputedStyle(iframe));
      }
    }
    console.groupEnd();
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
                 <div className="flex gap-2 mt-2">
                   <button 
                     onClick={() => setMessage(null)} 
                     className="text-xs underline hover:opacity-80"
                   >
                     Dismiss
                   </button>
                   <button 
                     onClick={handleManualReload}
                     className="text-xs underline hover:opacity-80"
                   >
                     Reload Page
                   </button>
                 </div>
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

            {/* Google Sign-In Button Container - DO NOT ADD ANY REACT CHILDREN HERE */}
            <div 
              id="google-signin-container"
              ref={googleButtonRef}
              className="flex justify-center"
              style={{
                minHeight: '50px',
                position: 'relative',
                zIndex: 999,
                pointerEvents: 'auto'
              }}
            />

             {/* Show loading message outside the button container */}
             {!buttonReady && !message && (
               <div className="text-center">
                 <div className="text-muted-foreground text-sm animate-pulse mb-2">
                   Loading Google Sign-In...
                 </div>
                 {scriptLoadAttempts > 0 && (
                   <div className="text-xs text-muted-foreground">
                     Retry attempt {scriptLoadAttempts}/3
                   </div>
                 )}
               </div>
             )}

             {/* Fallback button if script fails to load */}
             {message && message.type === 'error' && (
               <button
                 onClick={handleManualReload}
                 className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
               >
                 Reload and Try Again
               </button>
             )}

            {/* Manual trigger button - Always available as fallback */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-muted-foreground">or try</span>
              </div>
            </div>

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

            {/* Debug button */}
            <button
              onClick={debugGoogleSignIn}
              className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
              type="button"
            >
              🔍 Debug Info (Check Console)
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
