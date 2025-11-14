// src/pages/Auth.tsx
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

  // FIXED: Simplified Google callback handler
  const handleGoogleCallback = useCallback(async (response: any) => {
    console.log('🎯 Google callback triggered!');
    
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
      // Decode the JWT to get user info
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('✅ User authenticated:', userInfo.email);

      // Create user object
      const userData = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
        googleId: userInfo.sub,
        level: 1,
        currentXP: 0,
        currentLevelXP: 0,
        nextLevelXP: 1000,
        progressPct: 0,
        badges: [],
        postsCount: 0,
        commentsCount: 0,
        activityScore: "0",
        bio: null,
        profileFields: {},
        completedLessons: 0,
        totalLessons: 0,
        streak: 0,
        spaces: []
      };

      // Save to localStorage
      localStorage.setItem('10x-contest-user', JSON.stringify(userData));
      localStorage.setItem('google_credential', response.credential);

      console.log('✅ Sign-in complete, redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to complete sign-in. Please try again.'
      });
      setLoading(false);
    }
  }, []);

  // Make callback globally available
  useEffect(() => {
    window.handleGoogleCallback = handleGoogleCallback;
    console.log('✅ Global callback function set');
    
    return () => {
      delete window.handleGoogleCallback;
    };
  }, [handleGoogleCallback]);

  // Google Sign-In styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'google-signin-styles';
    style.innerHTML = `
      #google-signin-container,
      #google-signin-container * {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 999 !important;
      }
      
      #google-signin-container iframe {
        pointer-events: auto !important;
        z-index: 999 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('google-signin-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setMessage({ type: 'error', text: 'Google Client ID not configured' });
      return;
    }

    let mounted = true;

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        console.log('✅ Google already loaded');
        initializeGoogleSignIn();
        return;
      }

      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
      
      if (!script) {
        console.log('📥 Creating Google script tag...');
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = false;
        script.id = 'google-signin-script';
        
        script.onload = () => {
          console.log('✅ Script tag loaded');
          setTimeout(() => {
            if (mounted) checkGoogleObject();
          }, 100);
        };

        script.onerror = () => {
          console.error('❌ Script loading error');
          setMessage({ type: 'error', text: 'Failed to load Google Sign-In' });
        };

        document.head.appendChild(script);
      } else {
        checkGoogleObject();
      }
    };

    const checkGoogleObject = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          console.log('✅ Google object found!');
          if (mounted) initializeGoogleSignIn();
        } else if (attempts >= 20) {
          clearInterval(interval);
          setMessage({ type: 'error', text: 'Google Sign-In failed to load' });
        }
      }, 500);
    };

    const initializeGoogleSignIn = () => {
      if (!googleButtonRef.current || !mounted) return;

      try {
        console.log('🔧 Initializing Google Sign-In...');
        
        googleButtonRef.current.innerHTML = '';

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: window.handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: true,
          use_fedcm_for_prompt: false
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 320,
            logo_alignment: 'left'
          }
        );

        setButtonReady(true);
        console.log('✅ Google Sign-In ready');
        
      } catch (err) {
        console.error('❌ Init error:', err);
        setMessage({ type: 'error', text: 'Failed to initialize Google Sign-In' });
      }
    };

    loadGoogleScript();

    return () => {
      mounted = false;
    };
  }, [GOOGLE_CLIENT_ID]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-card-premium p-12 text-center space-y-8">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Logo" className="w-20 h-20" />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-3">1to10x Contest Arena</h1>
            <p className="text-xl text-muted-foreground">
              Compete. Level Up. Win Rewards.
            </p>
          </div>

          <div className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {message.text}
              </div>
            )}

            {loading && (
              <div className="text-sm">Signing you in...</div>
            )}

            <div 
              id="google-signin-container"
              ref={googleButtonRef}
              className="flex justify-center"
              style={{ minHeight: '50px' }}
            />

            {!buttonReady && !message && (
              <div className="text-sm animate-pulse">
                Loading Google Sign-In...
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Sign in with your Google account</p>
            <p>Powered by 10X AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;