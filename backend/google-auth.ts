// backend/google-auth.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request, Response } from 'express';

// Configure Google OAuth Strategy
export const configureGoogleAuth = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // FIXED: Use the correct production callback URL
  const callbackURL = 'https://leaderboard.1to10x.com/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.error('⚠️ Google OAuth credentials not configured');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔐 Google OAuth profile received:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
      });

      const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        avatarUrl: profile.photos?.[0]?.value || '',
        googleId: profile.id,
        accessToken,
        refreshToken,
      };

      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, false);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

// Get Google OAuth URL
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientID) {
      return res.status(500).json({
        error: 'Google OAuth not configured'
      });
    }

    // FIXED: Use the correct redirect URI
    const redirectURI = 'https://leaderboard.1to10x.com/api/auth/google/callback';
    const scope = 'profile email';
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientID}&` +
      `redirect_uri=${encodeURIComponent(redirectURI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}&` +
      `prompt=select_account`;

    res.json({ url: authUrl });
  } catch (error: any) {
    console.error('❌ Error generating Google OAuth URL:', error);
    res.status(500).json({
      error: 'Failed to generate OAuth URL'
    });
  }
};

// Handle Google OAuth callback - SIMPLIFIED VERSION
export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('https://leaderboard.1to10x.com/auth?error=no_code');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: 'https://leaderboard.1to10x.com/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser = await userResponse.json();

    // Store user in session
    req.session.user = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.id,
      googleEmail: googleUser.email,
      googleName: googleUser.name,
      googleAvatarUrl: googleUser.picture
    };
    
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Redirect to frontend with user data
    const userData = encodeURIComponent(JSON.stringify({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    }));

    res.redirect(`https://leaderboard.1to10x.com/dashboard?success=true&user=${userData}`);
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    res.redirect('https://leaderboard.1to10x.com/auth?error=oauth_failed');
  }
};

// Get current user from session
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
};

// Logout
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};