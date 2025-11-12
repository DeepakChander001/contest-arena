// Google OAuth Configuration
// This file centralizes all Google OAuth settings

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 
  (typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : '');

export const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// OAuth configuration
export const googleOAuthConfig = {
  client_id: GOOGLE_CLIENT_ID,
  redirect_uri: GOOGLE_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid email profile',
  access_type: 'offline',
  prompt: 'consent'
};

// Generate OAuth URL (for backend OAuth flow if needed)
export const getGoogleOAuthURL = () => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ GOOGLE_CLIENT_ID is not configured');
    return '';
  }
  const params = new URLSearchParams(googleOAuthConfig as any);
  return `${GOOGLE_OAUTH_ENDPOINT}?${params.toString()}`;
};

// Parse user from JWT token
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

// Domain configuration
export const DOMAIN = 'https://leaderboard.1to10x.com';
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${DOMAIN}/api`;

