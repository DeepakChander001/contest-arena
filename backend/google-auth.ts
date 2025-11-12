import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request, Response } from 'express';

// Configure Google OAuth Strategy
export const configureGoogleAuth = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_REDIRECT_URI || 'https://leaderboard.1to10x.com/api/auth/google/callback';

  if (!clientID || !clientSecret || clientID === 'your_google_client_id_here') {
    console.warn('⚠️ Google OAuth credentials not configured - OAuth endpoints will return errors');
    console.warn('📝 Please add your Google OAuth credentials to the .env file');
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
        avatar: profile.photos?.[0]?.value,
      });

      // Here you would typically save/update user in your database
      // For now, we'll create a user object from the Google profile
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
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

// Get Google OAuth URL
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    console.log('🔐 GET /api/auth/google/url - Request received');
    console.log('🔐 Request origin:', req.get('origin'));
    console.log('🔐 Request headers:', req.headers);
    
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const redirectURI = process.env.GOOGLE_REDIRECT_URI || 'https://leaderboard.1to10x.com/api/auth/google/callback';
    
    console.log('🔐 Client ID present:', !!clientID);
    console.log('🔐 Redirect URI:', redirectURI);
    
    if (!clientID || clientID === 'your_google_client_id_here' || clientID.trim() === '') {
      console.error('❌ Google OAuth not configured - Client ID missing or invalid');
      return res.status(500).json({
        error: 'Google OAuth not configured',
        message: 'Please add your Google OAuth credentials to the .env file. See ENV_FORMAT.md for instructions.',
        details: {
          hasClientID: !!clientID,
          clientIDLength: clientID?.length || 0,
        },
      });
    }

    const scope = 'profile email';
    const state = 'random_state_string'; // In production, use a proper state parameter
    
    // Add prompt=select_account to force account selection dialog
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientID}&` +
      `redirect_uri=${encodeURIComponent(redirectURI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}&` +
      `prompt=select_account`; // Force account selection

    console.log('✅ OAuth URL generated successfully');
    console.log('✅ Redirect URI:', redirectURI);
    
    // Ensure we're sending JSON
    res.setHeader('Content-Type', 'application/json');
    res.json({ url: authUrl });
  } catch (error: any) {
    console.error('❌ Error generating Google OAuth URL:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: 'Failed to generate OAuth URL',
      message: error.message,
    });
  }
};

// Handle Google OAuth callback
export const handleGoogleCallback = async (req: Request, res: Response) => {
  passport.authenticate('google', async (err: any, user: any) => {
    if (err) {
      console.error('❌ Google OAuth callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com'}/auth?error=oauth_error`);
    }

    if (!user) {
      console.error('❌ No user returned from Google OAuth');
      return res.redirect(`${process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com'}/auth?error=no_user`);
    }

    // Store user in session with proper structure
    req.session.user = {
      id: user.id,
      email: user.email, // This is already set correctly from the Google profile
      googleEmail: user.email,
      name: (user.firstName + ' ' + user.lastName).trim(),
      googleId: user.id,
      googleName: (user.firstName + ' ' + user.lastName).trim(),
      googleAvatarUrl: user.avatarUrl
    };
    
    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('❌ Error saving session:', err);
      } else {
        console.log('✅ Session saved successfully');
      }
    });
    
    console.log('✅ User stored in session:', req.session.user);
    console.log('✅ Session user email:', req.session.user.email);

    // Check if user exists in Circle before redirecting
    try {
      const axios = (await import('axios')).default;
      const adminToken = process.env.CIRCLE_ADMIN_API_TOKEN || process.env.VITE_CIRCLE_ADMIN_API_TOKEN;
      
      if (adminToken) {
        console.log('🔍 Checking Circle membership for:', user.email);
        const circleApiUrl = 'https://app.circle.so/api/admin/v2/community_members/search';
        
        try {
          const circleResponse = await axios.get(circleApiUrl, {
            params: { email: user.email },
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (circleResponse.data && circleResponse.data.id) {
            console.log('✅ User found in Circle, redirecting to dashboard');
            const frontendUrl = process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com';
            res.redirect(`${frontendUrl}/dashboard?success=true&user=${encodeURIComponent(JSON.stringify(user))}&circleMember=true`);
            return;
          }
        } catch (circleError: any) {
          // If 404 or user not found, redirect to profile creation
          if (circleError.response?.status === 404 || !circleError.response?.data?.id) {
            console.log('⚠️ User not found in Circle, redirecting to profile creation');
            const frontendUrl = process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com';
            res.redirect(`${frontendUrl}/create-profile?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent((user.firstName + ' ' + user.lastName).trim())}`);
            return;
          }
          console.error('❌ Error checking Circle membership:', circleError.message);
        }
      }
    } catch (error: any) {
      console.error('❌ Error during Circle check:', error.message);
    }

    // Fallback: redirect to profile creation if Circle check fails
    console.log('⚠️ Circle check failed, redirecting to profile creation');
    const frontendUrl = process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com';
    res.redirect(`${frontendUrl}/create-profile?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent((user.firstName + ' ' + user.lastName).trim())}`);
  })(req, res);
};

// Get current user from session
export const getCurrentUser = (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No user session found',
      });
    }

    res.json(req.session.user);
  } catch (error: any) {
    console.error('❌ Error getting current user:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
    });
  }
};

// Logout
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error destroying session:', err);
      return res.status(500).json({
        error: 'Logout failed',
        message: err.message,
      });
    }

    res.json({ message: 'Logged out successfully' });
  });
};
