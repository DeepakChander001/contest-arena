// Supabase client for database operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oseqqlxgcxzngirrgeyu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXFxbHhnY3h6bmdpcnJnZXl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5NzQ4MywiZXhwIjoyMDc1NDczNDgzfQ.9wRB49qFw1k4qM4o2Ucy78aFmTslp1wDZYiINw17JNA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to store Circle user data in Supabase
export async function storeCircleUserData(circleData, googleData) {
  try {
    console.log('💾 Storing Circle user data in Supabase...');
    
    // Extract data from Circle API response
    const {
      id: circleId,
      email,
      name,
      first_name,
      last_name,
      avatar_url,
      bio,
      headline,
      location,
      website,
      facebook_url,
      instagram_url,
      linkedin_url,
      profession,
      birthday,
      years_of_experience,
      primary_learning_goal,
      TOI: topics_of_interest,
      community_id,
      profile_url,
      public_uid,
      accepted_invitation,
      active,
      sso_provider_user_id,
      created_at,
      updated_at,
      last_seen_at,
      profile_confirmed_at,
      user_id,
      gamification_stats,
      member_tags,
      posts_count,
      comments_count,
      activity_score
    } = circleData;

    // 1. Store user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        circle_id: circleId,
        email,
        name,
        first_name,
        last_name,
        avatar_url,
        bio,
        headline,
        location,
        website,
        facebook_url,
        instagram_url,
        linkedin_url,
        profession,
        birthday,
        years_of_experience,
        primary_learning_goal,
        topics_of_interest,
        community_id,
        profile_url,
        public_uid,
        accepted_invitation: accepted_invitation ? new Date(accepted_invitation) : null,
        active,
        sso_provider_user_id,
        created_at: created_at ? new Date(created_at) : null,
        updated_at: updated_at ? new Date(updated_at) : null,
        last_seen_at: last_seen_at ? new Date(last_seen_at) : null,
        profile_confirmed_at: profile_confirmed_at ? new Date(profile_confirmed_at) : null,
        user_id,
        // Google data for authentication
        google_id: googleData?.id,
        google_email: googleData?.email,
        google_name: googleData?.name,
        google_avatar_url: googleData?.avatarUrl,
        updated_at_db: new Date()
      }, {
        onConflict: 'circle_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error storing user profile:', profileError);
      throw profileError;
    }

    console.log('✅ User profile stored:', profileData.id);

    // 2. Store gamification data
    if (gamification_stats) {
      const { error: gamificationError } = await supabase
        .from('user_gamification')
        .upsert({
          user_profile_id: profileData.id,
          circle_member_id: circleId,
          current_level: gamification_stats.current_level || 1,
          current_level_name: gamification_stats.current_level_name || 'Level 1',
          total_points: gamification_stats.total_points || 0,
          points_to_next_level: gamification_stats.points_to_next_level || 500,
          level_progress: gamification_stats.level_progress || 0,
          updated_at: new Date()
        }, {
          onConflict: 'circle_member_id'
        });

      if (gamificationError) {
        console.error('❌ Error storing gamification data:', gamificationError);
      } else {
        console.log('✅ Gamification data stored');
      }
    }

    // 3. Store badges/tags
    if (member_tags && member_tags.length > 0) {
      // Delete existing badges first
      await supabase
        .from('user_badges')
        .delete()
        .eq('circle_member_id', circleId);

      // Insert new badges
      const badgesToInsert = member_tags.map(tag => ({
        user_profile_id: profileData.id,
        circle_member_id: circleId,
        badge_id: tag.id,
        badge_name: tag.name,
        badge_category: tag.name.includes('Explorer') ? 'Course' : 'General',
        earned: true,
        earned_at: new Date()
      }));

      const { error: badgesError } = await supabase
        .from('user_badges')
        .insert(badgesToInsert);

      if (badgesError) {
        console.error('❌ Error storing badges:', badgesError);
      } else {
        console.log('✅ Badges stored:', badgesToInsert.length);
      }
    }

    // 4. Store activity data
    const { error: activityError } = await supabase
      .from('user_activity')
      .upsert({
        user_profile_id: profileData.id,
        circle_member_id: circleId,
        posts_count: posts_count || 0,
        comments_count: comments_count || 0,
        activity_score: activity_score?.activity_score ? parseFloat(activity_score.activity_score) : 0,
        presence_score: activity_score?.presence ? parseFloat(activity_score.presence) : 0,
        participation_score: activity_score?.participation ? parseFloat(activity_score.participation) : 0,
        contribution_score: activity_score?.contribution ? parseFloat(activity_score.contribution) : 0,
        connection_score: activity_score?.connection ? parseFloat(activity_score.connection) : 0,
        updated_at: new Date()
      }, {
        onConflict: 'circle_member_id'
      });

    if (activityError) {
      console.error('❌ Error storing activity data:', activityError);
    } else {
      console.log('✅ Activity data stored');
    }

    return profileData;

  } catch (error) {
    console.error('❌ Error storing Circle user data:', error);
    throw error;
  }
}

// Helper function to get user data from Supabase
export async function getUserDataFromSupabase(email) {
  try {
    console.log('📖 Fetching user data from Supabase for:', email);
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_gamification(*),
        user_badges(*),
        user_activity(*),
        user_spaces(*)
      `)
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return null;
    }

    console.log('✅ User data fetched from Supabase');
    return profile;

  } catch (error) {
    console.error('❌ Error fetching user data from Supabase:', error);
    return null;
  }
}
