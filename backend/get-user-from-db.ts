import { Request, Response } from 'express';
import { getUserDataFromSupabase, storeCircleUserData } from './supabase-client.js';
import getMemberDataHandler from './get-member-data.js';

// Helper function to transform user data from database to Circle API format
function transformUserData(userData: any) {
  return {
    id: userData.circle_id,
    email: userData.email,
    name: userData.name,
    first_name: userData.first_name,
    last_name: userData.last_name,
    avatar_url: userData.avatar_url,
    bio: userData.bio,
    headline: userData.headline,
    location: userData.location,
    website: userData.website,
    facebook_url: userData.facebook_url,
    instagram_url: userData.instagram_url,
    linkedin_url: userData.linkedin_url,
    profession: userData.profession,
    birthday: userData.birthday,
    years_of_experience: userData.years_of_experience,
    primary_learning_goal: userData.primary_learning_goal,
    TOI: userData.topics_of_interest,
    community_id: userData.community_id,
    profile_url: userData.profile_url,
    public_uid: userData.public_uid,
    accepted_invitation: userData.accepted_invitation,
    active: userData.active,
    sso_provider_user_id: userData.sso_provider_user_id,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_seen_at: userData.last_seen_at,
    profile_confirmed_at: userData.profile_confirmed_at,
    user_id: userData.user_id,
    // Gamification stats
    gamification_stats: userData.user_gamification?.[0] ? {
      community_member_id: userData.user_gamification[0].circle_member_id,
      total_points: userData.user_gamification[0].total_points,
      current_level: userData.user_gamification[0].current_level,
      current_level_name: userData.user_gamification[0].current_level_name,
      points_to_next_level: userData.user_gamification[0].points_to_next_level,
      level_progress: userData.user_gamification[0].level_progress
    } : null,
    // Member tags/badges
    member_tags: userData.user_badges?.map((badge: any) => ({
      id: badge.badge_id,
      name: badge.badge_name
    })) || [],
    // Activity stats
    posts_count: userData.user_activity?.[0]?.posts_count || 0,
    comments_count: userData.user_activity?.[0]?.comments_count || 0,
    activity_score: userData.user_activity?.[0] ? {
      activity_score: userData.user_activity[0].activity_score.toString(),
      presence: userData.user_activity[0].presence_score.toString(),
      participation: userData.user_activity[0].participation_score.toString(),
      contribution: userData.user_activity[0].contribution_score.toString(),
      connection: userData.user_activity[0].connection_score.toString()
    } : null,
    // Flattened profile fields
    flattened_profile_fields: {
      bio: userData.bio,
      TOI: userData.topics_of_interest,
      primary_learning_goal: userData.primary_learning_goal,
      years_of_experience: userData.years_of_experience,
      headline: userData.headline,
      location: userData.location,
      website: userData.website,
      facebook_url: userData.facebook_url,
      instagram_url: userData.instagram_url,
      linkedin_url: userData.linkedin_url,
      profession: userData.profession,
      birthday: userData.birthday,
      YOE: userData.years_of_experience
    }
  };
}

/**
 * Get user data from Supabase database
 * This endpoint returns user data stored in our database instead of calling Circle API
 */
export default async function getUserFromDbHandler(req: Request, res: Response) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email parameter',
        message: 'Email is required to fetch user data',
      });
    }

    console.log('📖 Fetching user data from database for:', email);

    // Get user data from Supabase
    const userData = await getUserDataFromSupabase(email as string);

    if (!userData) {
      console.log('📝 User not found in database, fetching from Circle API and storing...');
      
      // User not in database, fetch from Circle API and store
      try {
        // Get Circle API token
        const adminToken = process.env.CIRCLE_ADMIN_API_TOKEN || process.env.VITE_CIRCLE_ADMIN_API_TOKEN;
        
        if (!adminToken) {
          return res.status(500).json({
            error: 'Circle API not configured',
            message: 'Circle API token not found',
          });
        }

        // Call Circle API directly
        const axios = (await import('axios')).default;
        const circleApiUrl = 'https://app.circle.so/api/admin/v2/community_members/search';
        
        const response = await axios.get(circleApiUrl, {
          params: {
            email,
            include: 'space_memberships,course_progresses,spaces,avatar'
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        const circleData = response.data;
        console.log('✅ Circle API data fetched');

        // Store in database
        const googleData = (req as any).session?.user || null;
        await storeCircleUserData(circleData, googleData);
        console.log('✅ Circle data stored in database');

        // Fetch the stored data from database
        const newUserData = await getUserDataFromSupabase(email as string);
        
        if (!newUserData) {
          return res.status(500).json({
            error: 'Failed to store user data',
            message: 'Could not store user data in database',
          });
        }
        
        // Transform and return the newly stored data
        const transformedData = transformUserData(newUserData);
        console.log('✅ New user data stored and retrieved from database');
        return res.status(200).json(transformedData);
        
      } catch (circleError) {
        console.error('❌ Error fetching from Circle API:', circleError);
        return res.status(500).json({
          error: 'Failed to fetch user data',
          message: 'Could not fetch user data from Circle API',
        });
      }
    }

    // Transform Supabase data to match Circle API response format
    const transformedData = transformUserData(userData);

    console.log('✅ User data retrieved from database');
    return res.status(200).json(transformedData);

  } catch (error: any) {
    console.error('❌ Error fetching user data from database:', error);
    return res.status(500).json({
      error: 'Database error',
      message: error.message || 'Failed to fetch user data from database',
    });
  }
}
