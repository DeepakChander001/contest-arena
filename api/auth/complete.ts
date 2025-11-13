import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Credential required' });
  }

  try {
    // Decode Google JWT
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    
    const googleUser = JSON.parse(jsonPayload);
    
    // Fetch Circle member data
    const circleApiToken = process.env.CIRCLE_API_TOKEN || process.env.CIRCLE_HEADLESS_API_KEY;
    
    if (!circleApiToken) {
      console.error('CIRCLE_API_TOKEN not configured');
      return res.status(500).json({ error: 'Circle API not configured' });
    }

    const circleResponse = await fetch(
      `https://app.circle.so/api/v1/community_members?email=${encodeURIComponent(googleUser.email)}`,
      {
        headers: {
          'Authorization': `Token ${circleApiToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!circleResponse.ok) {
      if (circleResponse.status === 404) {
        return res.status(404).json({ error: 'Not a Circle member' });
      }
      const errorText = await circleResponse.text();
      console.error('Circle API error:', errorText);
      return res.status(circleResponse.status).json({ error: 'Failed to fetch Circle data' });
    }

    const circleData = await circleResponse.json();
    const circleMember = Array.isArray(circleData) ? circleData[0] : circleData;

    if (!circleMember || !circleMember.id) {
      return res.status(404).json({ error: 'Circle member not found' });
    }

    // Save/Update user in Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        circle_id: circleMember.id,
        email: circleMember.email || googleUser.email,
        name: circleMember.name || googleUser.name,
        first_name: circleMember.first_name || googleUser.given_name,
        last_name: circleMember.last_name || googleUser.family_name,
        avatar_url: circleMember.avatar_url || googleUser.picture,
        bio: circleMember.bio || null,
        google_id: googleUser.sub,
        google_email: googleUser.email,
        google_name: googleUser.name,
        google_avatar_url: googleUser.picture,
        created_at: circleMember.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_seen_at: circleMember.last_seen_at || new Date().toISOString()
      }, {
        onConflict: 'circle_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return res.status(500).json({ error: 'Failed to save profile', details: profileError.message });
    }

    // Save gamification stats
    if (circleMember.gamification_stats) {
      await supabase.from('user_gamification').upsert({
        user_profile_id: userProfile.id,
        circle_member_id: circleMember.id,
        current_level: circleMember.gamification_stats.current_level || 1,
        total_points: circleMember.gamification_stats.total_points || 0,
        points_to_next_level: circleMember.gamification_stats.points_to_next_level || 1000,
        level_progress: circleMember.gamification_stats.level_progress || 0
      }, {
        onConflict: 'circle_member_id'
      });
    }

    // Save activity data
    await supabase.from('user_activity').upsert({
      user_profile_id: userProfile.id,
      circle_member_id: circleMember.id,
      posts_count: circleMember.posts_count || 0,
      comments_count: circleMember.comments_count || 0,
      activity_score: circleMember.activity_score?.activity_score || 0
    }, {
      onConflict: 'circle_member_id'
    });

    // Save badges
    if (circleMember.member_tags && circleMember.member_tags.length > 0) {
      const badges = circleMember.member_tags.map((tag: any) => ({
        user_profile_id: userProfile.id,
        circle_member_id: circleMember.id,
        badge_id: tag.id,
        badge_name: tag.name,
        earned: true
      }));

      await supabase.from('user_badges').upsert(badges, {
        onConflict: 'circle_member_id,badge_id'
      });
    }

    // Fetch and save spaces
    try {
      const spacesResponse = await fetch(
        `https://app.circle.so/api/v1/space_memberships?user_id=${circleMember.id}`,
        {
          headers: {
            'Authorization': `Token ${circleApiToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (spacesResponse.ok) {
        const spacesData = await spacesResponse.json();
        const spacesArray = Array.isArray(spacesData) ? spacesData : (spacesData.records || []);
        
        if (spacesArray.length > 0) {
          const spaces = spacesArray.map((space: any) => ({
            user_profile_id: userProfile.id,
            circle_member_id: circleMember.id,
            space_id: space.space?.id || space.id,
            space_name: space.space?.name || space.name,
            space_description: space.space?.description || space.description || null
          }));

          await supabase.from('user_spaces').upsert(spaces, {
            onConflict: 'circle_member_id,space_id'
          });
        }
      }
    } catch (spacesError) {
      console.warn('Could not fetch spaces:', spacesError);
    }

    // Build complete user object
    const completeUser = {
      id: circleMember.id.toString(),
      email: circleMember.email || googleUser.email,
      name: circleMember.name || googleUser.name,
      avatarUrl: circleMember.avatar_url || googleUser.picture,
      googleId: googleUser.sub,
      level: circleMember.gamification_stats?.current_level || 1,
      currentXP: circleMember.gamification_stats?.total_points || 0,
      currentLevelXP: circleMember.gamification_stats?.total_points || 0,
      nextLevelXP: circleMember.gamification_stats?.points_to_next_level || 1000,
      progressPct: (circleMember.gamification_stats?.level_progress || 0) * 100,
      badges: (circleMember.member_tags || []).map((tag: any) => ({ 
        id: tag.id, 
        name: tag.name,
        earned: true
      })),
      postsCount: circleMember.posts_count || 0,
      commentsCount: circleMember.comments_count || 0,
      activityScore: circleMember.activity_score?.activity_score || "0",
      bio: circleMember.bio || null,
      profileFields: circleMember.flattened_profile_fields || {},
      createdAt: circleMember.created_at,
      lastSeenAt: circleMember.last_seen_at,
      completedLessons: 0,
      totalLessons: 0,
      streak: 0,
      spaces: []
    };

    return res.status(200).json({ user: completeUser });

  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
