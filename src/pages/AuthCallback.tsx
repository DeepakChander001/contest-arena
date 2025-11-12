import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const state = searchParams.get('state');

      console.log('📥 OAuth Callback received:', { code, error: errorParam, state });

      if (errorParam) {
        setError('Authorization failed');
        setStatus('Authorization failed. Redirecting...');
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }

      if (code) {
        try {
          setStatus('Completing sign in...');
          
          // Exchange code for token (this should be done on your backend)
          // For now, we'll show an error since we need backend support
          setError('OAuth callback requires backend support. Please use the Sign in with Google button on the auth page.');
          setStatus('Redirecting to auth page...');
          
          setTimeout(() => navigate('/auth'), 3000);
          
        } catch (err) {
          console.error('Error processing callback:', err);
          setError('Authentication failed');
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/auth'), 2000);
        }
      } else {
        setError('No authorization code received');
        setStatus('No authorization code. Redirecting...');
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
      
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          {error ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">{error}</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            </>
          )}
          <p className="text-gray-700 font-medium text-center">{status}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

