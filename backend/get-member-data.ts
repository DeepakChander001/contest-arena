import { Request, Response } from 'express';
import axios from 'axios';
import { storeCircleUserData, getUserDataFromSupabase } from './supabase-client.js';

/**
 * Get member data from Circle.so by email
 * This endpoint proxies requests to Circle.so Admin API v2 to avoid CORS issues
 */
export default async function getMemberDataHandler(req: Request, res: Response) {
  try {
    const { email } = req.query;

    // Validate email parameter
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email parameter is required',
        message: 'Please provide a valid email address',
      });
    }

    console.log('📧 Fetching member data for:', email);

    // Get Circle.so Admin API token from environment
    const adminToken = process.env.CIRCLE_ADMIN_API_TOKEN || process.env.VITE_CIRCLE_ADMIN_API_TOKEN;

    if (!adminToken) {
      console.warn('⚠️ Circle Admin API token not found - using mock data');
      
      // Return mock data that matches the expected Circle API response structure
      const mockData = {
        id: 38382109,
        email: email,
        name: "Matti", // This will be overridden by Google name if needed
        avatar_url: null,
        first_name: "Matti",
        last_name: null,
        headline: "",
        created_at: "2025-05-06T10:17:30.939Z",
        updated_at: "2025-10-04T09:22:29.554Z",
        community_id: 323931,
        last_seen_at: "2025-10-07T08:38:30.000Z",
        profile_confirmed_at: "2025-05-06T12:51:55.000Z",
        profile_url: "https://learn.1to10x.ai/u/164c49df",
        public_uid: "164c49df",
        profile_fields: [],
        flattened_profile_fields: {
          headline: "",
          bio: "AI",
          location: "",
          website: "",
          facebook_url: "",
          instagram_url: "",
          linkedin_url: "",
          profession: null,
          birthday: null,
          YOE: null,
          primary_learning_goal: ["Upskilling"],
          TOI: "Coding",
          years_of_experience: ["More than 5 Years"]
        },
        user_id: 30187876,
        accepted_invitation: "2025-05-06 12:51:33 UTC",
        active: true,
        sso_provider_user_id: null,
        activity_score: {
          activity_score: "2.21",
          presence: "4.64",
          participation: "4.18",
          contribution: "0.0",
          connection: "0.0"
        },
        posts_count: 1,
        comments_count: 0,
        gamification_stats: {
          community_member_id: 38382109,
          total_points: 2,
          current_level: 1,
          current_level_name: "Level 1",
          points_to_next_level: 498,
          level_progress: 0
        },
        member_tags: [
          {
            name: "10x Agentic AI (Pro): Explorer",
            id: 188394
          }
        ]
      };

      console.log('📦 Returning mock data for development');
      return res.json(mockData);
    }

    console.log('🔑 Admin token:', adminToken.substring(0, 10) + '...');

    // Call Circle.so Admin API v2
    const circleApiUrl = 'https://app.circle.so/api/admin/v2/community_members/search';

    console.log('📡 Calling Circle.so API:', circleApiUrl);

    // Try to include space_memberships and avatar in the response
    const params: any = {
      email,
      // Include related data if Circle.so supports it
      include: 'space_memberships,course_progresses,spaces,avatar'
    };

    console.log('📧 Query params:', params);

    const response = await axios.get(circleApiUrl, {
      params,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Circle.so API response received');
    console.log('📦 Status:', response.status);

    // Check if we have member data and if avatar_url is missing
    const memberData = response.data;
    if (memberData && memberData.id && !memberData.avatar_url) {
      console.log('🖼️ Avatar URL is null, trying to fetch from v1 API...');

      try {
        // Try v1 API to get full member profile with avatar using member ID
        const v1Response = await axios.get(`https://app.circle.so/api/v1/community_members/${memberData.id}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (v1Response.data && v1Response.data.avatar_url) {
          console.log('✅ Got avatar from v1 API:', v1Response.data.avatar_url);
          memberData.avatar_url = v1Response.data.avatar_url;
        } else {
          console.log('⚠️ v1 API also returned null avatar_url');
        }
      } catch (v1Error: any) {
        console.log('⚠️ Could not fetch avatar from v1 API:', v1Error.message);
      }
    }

    console.log('📦 Final avatar_url:', memberData.avatar_url || 'null');
    console.log('📦 Data:', JSON.stringify(memberData, null, 2));

    // Store Circle data in Supabase
    try {
      // Get Google data from session if available
      const googleData = req.session?.user || null;
      
      await storeCircleUserData(memberData, googleData);
      console.log('✅ Circle data stored in Supabase');
    } catch (supabaseError) {
      console.error('⚠️ Error storing in Supabase (continuing with response):', supabaseError);
    }

    // Return the data from Circle.so (with potentially updated avatar_url)
    return res.status(200).json(memberData);

  } catch (error: any) {
    console.error('❌ Error fetching member data:');
    console.error('❌ Message:', error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Response:', error.response?.data);

    // Handle different error scenarios
    if (error.response) {
      // If user not found (404), return a specific error
      if (error.response.status === 404) {
        return res.status(404).json({
          error: 'Member not found',
          message: 'This email is not registered in Circle. Please create a profile first.',
          notFound: true,
        });
      }
      
      // Circle.so API returned an error response
      return res.status(error.response.status).json({
        error: 'Circle.so API error',
        message: error.response.data?.message || error.response.data?.error || 'Failed to fetch member data',
        details: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to reach Circle.so API',
      });
    } else {
      // Something else went wrong
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
}
