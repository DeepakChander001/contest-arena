import { AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  
  const { isAuthenticated, user, handleGoogleLogin: handleAuthLogin } = useAuth();
  const navigate = useNavigate();
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Fetch Circle member data (optional, non-blocking)
  const fetchCircleMemberData = async (email: string) => {
    try {
      const CIRCLE_API_KEY = import.meta.env.VITE_CIRCLE_API_KEY;
      const CIRCLE_COMMUNITY_ID = import.meta.env.VITE_CIRCLE_COMMUNITY_ID;
      
      if (!CIRCLE_API_KEY || !CIRCLE_COMMUNITY_ID) {
        console.log('ℹ️ Circle.so not configured, skipping member fetch');
        return;
      }

      console.log('🔄 Fetching Circle member data...');
      
      // Use the correct Circle API endpoint
      const response = await fetch(`https://app.circle.so/api/v1/community_members?community_id=${CIRCLE_COMMUNITY_ID}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${CIRCLE_API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Check response
      if (!response.ok) {
        console.warn(`⚠️ Circle API returned status ${response.status}`);
        
        // Check if it's a CORS or network error
        if (response.status === 0) {
          console.log('ℹ️ Circle API blocked by CORS - this is expected for client-side calls');
          // You might need to make this call from your backend instead
          return;
        }
        
        return;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('⚠️ Circle API returned non-JSON response');
        return;
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('✅ Circle member found');
        localStorage.setItem('circle_member', JSON.stringify(data[0]));
      } else {
        console.log('ℹ️ User not found in Circle community');
      }
      
    } catch (error) {
      // Don't block sign-in for Circle errors
      console.log('ℹ️ Circle member fetch failed (non-blocking):', error);
    }
  };

  // Handle Google callback - make it available globally and stable with useCallback
  const handleGoogleCallback = useCallback(async (response: any) => {
    console.log('🎯 Google callback triggered!');
    
    // Handle FedCM abort gracefully
    if (response.error === 'user_cancel' || response.error === 'popup_closed') {
      console.log('User cancelled sign-in');
      return;
    }

    if (response.error) {
      console.error('❌ Google Sign-In error:', response.error);
      setMessage({ type: 'error', text: `Sign-in failed: ${response.error}` });
      setLoading(false);
      return;
    }

    if (!response.credential) {
      console.error('❌ No credential in response');
      setMessage({ type: 'error', text: 'No credential received from Google' });
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Decode JWT token
      const credential = response.credential;
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('✅ User authenticated:', userInfo.email);

      // Save basic user data first
      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
        email_verified: userInfo.email_verified,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('google_credential', credential);

      // Try to fetch Circle member data (optional, non-blocking)
      await fetchCircleMemberData(userInfo.email);

      // Map to format expected by AuthContext
      const googleUserData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      // Try to process login with Circle data (with graceful fallback)
      try {
        await handleAuthLogin(googleUserData);
        // If successful, redirect will happen in handleAuthLogin
        console.log('✅ Login processed successfully');
      } catch (circleError: any) {
        console.warn('⚠️ Circle API error, continuing with basic Google data:', circleError);
        
        // Check if it's a "not found" error - redirect to profile creation
        if (circleError?.message?.includes('not found') || 
            circleError?.message?.includes('404') || 
            circleError?.notFound) {
          console.log('⚠️ User not found in Circle, redirecting to profile creation');
          window.location.href = `/create-profile?email=${encodeURIComponent(userInfo.email)}&name=${encodeURIComponent(userInfo.name || '')}`;
          return;
        }
        
        // For other errors (like HTML responses), continue with basic data
        console.log('⚠️ Circle API returned error, using basic Google data');
        // User data already saved, just redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
      
    } catch (err: any) {
      console.error('❌ Error processing sign-in:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to complete sign-in. Please try again.' });
      setLoading(false);
    }
  }, [handleAuthLogin]);

  // Make callback available globally so Google's iframe can call it
  useEffect(() => {
    window.handleGoogleCallback = handleGoogleCallback;
    console.log('✅ Global callback function set');
    
    return () => {
      delete window.handleGoogleCallback;
    };
  }, [handleGoogleCallback]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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

  // Load and initialize Google Sign-In with complete DOM isolation using useRef
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
      return;
    }

    let isMounted = true;
    let initAttempts = 0;
    const maxAttempts = 10;

    const loadGoogleScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      
      if (existingScript) {
        console.log('📜 Google script already loaded');
        waitForGoogle();
        return;
      }

      console.log('📥 Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Script loaded successfully');
        if (isMounted) {
          waitForGoogle();
        }
      };

      script.onerror = (err) => {
        console.error('❌ Failed to load script:', err);
        if (isMounted) {
          setMessage({ type: 'error', text: 'Failed to load Google Sign-In script' });
        }
      };

      document.head.appendChild(script);
    };

    const waitForGoogle = () => {
      const checkInterval = setInterval(() => {
        initAttempts++;
        
        if (window.google?.accounts?.id && isMounted) {
          clearInterval(checkInterval);
          console.log('✅ Google object ready');
          initializeGoogleSignIn();
        } else if (initAttempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('❌ Google object not available after retries');
          if (isMounted) {
            setMessage({ type: 'error', text: 'Google Sign-In took too long to load' });
          }
        } else {
          console.log(`⏳ Waiting for Google object... (${initAttempts}/${maxAttempts})`);
        }
      }, 500);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current || !isMounted) {
        // Retry if Google object not ready yet
        setTimeout(() => {
          if (isMounted) initializeGoogleSignIn();
        }, 500);
        return;
      }

      try {
        console.log('🔧 Initializing Google Sign-In...');
        
        // Clear container
        googleButtonRef.current.innerHTML = '';

        // Initialize Google Sign-In with global callback and FedCM support
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: window.handleGoogleCallback, // Use global callback
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: true,
          use_fedcm_for_prompt: true // Enable FedCM (Federated Credential Management)
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
        console.log('✅ Google Sign-In button ready!');

        // Optional: Try One Tap (with FedCM)
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            // One Tap not shown or skipped
            const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.();
            console.log('One Tap not shown:', reason);
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
        console.error('❌ Failed to initialize Google Sign-In:', err);
        if (isMounted) {
          setMessage({ type: 'error', text: 'Failed to initialize Google Sign-In' });
        }
      }
    };

    // Start loading
    loadGoogleScript();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [GOOGLE_CLIENT_ID]);

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
              <div className="text-center text-muted-foreground text-sm animate-pulse mt-2">
                Loading Google Sign-In...
              </div>
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
