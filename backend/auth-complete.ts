import { Request, Response } from 'express';
import axios from 'axios';
import { storeCircleUserData } from './supabase-client.js';
import getMemberDataHandler from './get-member-data.js';

/**
 * Handle Google OAuth completion
 * This endpoint receives the Google JWT credential, decodes it,
 * fetches Circle member data, stores it in Supabase, and returns the user object
 */
export default async function authCompleteHandler(req: Request, res: Response) {
  try {
    console.log('🔐 POST /api/auth/complete - Request received');
    
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        error: 'Credential required',
        message: 'Google OAuth credential is missing'
      });
    }

    // Decode Google JWT credential
    let googleUser;
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      
      googleUser = JSON.parse(jsonPayload);
      console.log('✅ Google user decoded:', googleUser.email);
    } catch (decodeError: any) {
      console.error('❌ Error decoding Google credential:', decodeError);
      return res.status(400).json({ 
        error: 'Invalid credential',
        message: 'Failed to decode Google OAuth credential'
      });
    }

    // Store Google user data in session for later use
    if (req.session) {
      req.session.user = {
        id: googleUser.sub,
        email: googleUser.email,
        googleEmail: googleUser.email,
        name: googleUser.name || (googleUser.given_name + ' ' + googleUser.family_name).trim(),
        googleId: googleUser.sub,
        googleName: googleUser.name || (googleUser.given_name + ' ' + googleUser.family_name).trim(),
        googleAvatarUrl: googleUser.picture
      };
    }

    // Fetch Circle member data using the email
    console.log('📧 Fetching Circle member data for:', googleUser.email);
    
    const adminToken = process.env.CIRCLE_ADMIN_API_TOKEN || process.env.VITE_CIRCLE_ADMIN_API_TOKEN;

    if (!adminToken) {
      console.error('❌ Circle Admin API token not found');
      return res.status(500).json({ 
        error: 'Circle API not configured',
        message: 'Circle Admin API token is missing'
      });
    }

    // Use the existing getMemberDataHandler logic to fetch Circle data
    // We'll call Circle API directly here to get full member data
    const circleApiUrl = 'https://app.circle.so/api/admin/v2/community_members/search';
    
    let circleMember;
    try {
      const circleResponse = await axios.get(circleApiUrl, {
        params: { email: googleUser.email },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!circleResponse.data || !circleResponse.data.id) {
        console.log('⚠️ User not found in Circle');
        return res.status(404).json({ 
          error: 'Not a Circle member',
          message: 'This email is not registered in Circle. Please create a profile first.',
          notFound: true
        });
      }

      circleMember = circleResponse.data;
      console.log('✅ Circle member found:', circleMember.id);

      // Try to get avatar from v1 API if missing
      if (circleMember && !circleMember.avatar_url) {
        try {
          const v1Response = await axios.get(
            `https://app.circle.so/api/v1/community_members/${circleMember.id}`,
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (v1Response.data && v1Response.data.avatar_url) {
            circleMember.avatar_url = v1Response.data.avatar_url;
          }
        } catch (v1Error) {
          console.warn('⚠️ Could not fetch avatar from v1 API');
        }
      }
    } catch (circleError: any) {
      console.error('❌ Error fetching Circle data:', circleError.message);
      
      if (circleError.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Not a Circle member',
          message: 'This email is not registered in Circle. Please create a profile first.',
          notFound: true
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to fetch Circle data',
        message: circleError.message || 'Unable to fetch member data from Circle'
      });
    }

    // Store Circle data in Supabase using existing function
    let userProfile;
    try {
      const googleData = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name || (googleUser.given_name + ' ' + googleUser.family_name).trim(),
        avatarUrl: googleUser.picture
      };
      
      userProfile = await storeCircleUserData(circleMember, googleData);
      console.log('✅ Circle data stored in Supabase');
    } catch (supabaseError: any) {
      console.error('⚠️ Error storing in Supabase:', supabaseError);
      // Continue even if Supabase storage fails - we still return the data
    }

    // Fetch member spaces
    let spaces: any[] = [];
    try {
      const spacesResponse = await axios.get(
        `https://app.circle.so/api/v1/space_memberships?user_id=${circleMember.id}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (spacesResponse.data) {
        const spacesArray = Array.isArray(spacesResponse.data) 
          ? spacesResponse.data 
          : (spacesResponse.data.records || []);
        
        spaces = spacesArray.map((space: any) => ({
          id: space.space?.id || space.id,
          name: space.space?.name || space.name,
          description: space.space?.description || space.description || null
        }));
      }
    } catch (spacesError) {
      console.warn('⚠️ Could not fetch spaces:', spacesError);
    }

    // Build complete user object matching frontend User interface
    const completeUser = {
      id: circleMember.id.toString(),
      email: circleMember.email || googleUser.email,
      name: circleMember.name || googleUser.name || (googleUser.given_name + ' ' + googleUser.family_name).trim(),
      avatarUrl: circleMember.avatar_url || googleUser.picture || null,
      googleId: googleUser.sub,
      level: circleMember.gamification_stats?.current_level || 1,
      currentXP: circleMember.gamification_stats?.total_points || 0,
      currentLevelXP: circleMember.gamification_stats?.total_points || 0,
      nextLevelXP: circleMember.gamification_stats?.points_to_next_level || 1000,
      progressPct: typeof circleMember.gamification_stats?.level_progress === 'number' 
        ? circleMember.gamification_stats.level_progress * 100 
        : (circleMember.gamification_stats?.level_progress || 0),
      badges: (circleMember.member_tags || []).map((tag: any) => ({ 
        id: tag.id, 
        name: tag.name
      })),
      postsCount: circleMember.posts_count || 0,
      commentsCount: circleMember.comments_count || 0,
      activityScore: circleMember.activity_score?.activity_score || "0",
      bio: circleMember.flattened_profile_fields?.bio || circleMember.bio || null,
      profileFields: circleMember.flattened_profile_fields || {},
      createdAt: circleMember.created_at,
      lastSeenAt: circleMember.last_seen_at,
      completedLessons: 0,
      totalLessons: 0,
      streak: 0,
      spaces: spaces
    };

    console.log('✅ User data prepared, returning to frontend');
    
    return res.status(200).json({ user: completeUser });

  } catch (error: any) {
    console.error('❌ Error in auth complete handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred during authentication'
    });
  }
}

