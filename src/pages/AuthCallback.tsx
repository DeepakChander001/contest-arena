import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      window.location.href = '/auth?error=oauth_failed';
      return;
    }

    if (code) {
      // For now, mock the authentication
      // In production, exchange this code with your backend
      console.log('OAuth code received:', code);
      
      // Mock user data (replace with actual API call to exchange code for token)
      const mockUser = {
        email: 'user@contestarena.com',
        name: 'Contest User',
        picture: '',
        sub: Date.now().toString(),
        email_verified: true
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth?error=no_code';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
      
      <div className="relative z-10 glass-card-premium p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground font-medium">Completing sign-in...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

