import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * Create a new user profile for users not yet in Circle
 * This endpoint creates a profile in our database and can be used to invite users to Circle
 */
export default async function createProfileHandler(req: Request, res: Response) {
  try {
    console.log('📝 Creating new user profile...');
    
    const {
      email,
      name,
      bio,
      headline,
      location,
      website,
      linkedin_url,
      instagram_url,
      facebook_url,
      profession,
      birthday,
      years_of_experience,
      topics_of_interest,
      primary_learning_goal,
    } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and name are required',
      });
    }

    // Get session user data
    const sessionUser = req.session?.user;

    // Get Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Supabase credentials not found');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Database connection not configured',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return res.status(409).json({
        error: 'Profile already exists',
        message: 'A profile with this email already exists',
      });
    }

    // Create user profile with provided data
    const now = new Date().toISOString();
    
    // Generate a temporary circle_id for users not yet in Circle
    // Since circle_id is an integer type, we use a negative number as placeholder
    // This will be updated when they are added to Circle with their real Circle member ID
    // Using a timestamp-based negative integer to ensure uniqueness (Circle IDs are positive integers)
    // Convert timestamp to negative integer: -Math.floor(Date.now() / 1000)
    const tempCircleId = -Math.floor(Date.now() / 1000);
    
    const profileData: any = {
      circle_id: tempCircleId, // Required field - using negative timestamp as temporary ID until added to Circle
      email,
      name,
      google_email: email,
      google_name: name,
      bio: bio || null,
      headline: headline || null,
      location: location || null,
      website: website || null,
      linkedin_url: linkedin_url || null,
      instagram_url: instagram_url || null,
      facebook_url: facebook_url || null,
      profession: profession || null,
      birthday: birthday || null,
      years_of_experience: years_of_experience || null,
      topics_of_interest: topics_of_interest || null,
      primary_learning_goal: primary_learning_goal ? [primary_learning_goal] : null,
      created_at: now,
      updated_at: now,
      updated_at_db: now,
    };

    // Add Google data from session if available
    if (sessionUser) {
      if (sessionUser.id || sessionUser.googleId) {
        profileData.google_id = sessionUser.id || sessionUser.googleId;
      }
      if (sessionUser.googleAvatarUrl || sessionUser.avatarUrl) {
        profileData.google_avatar_url = sessionUser.googleAvatarUrl || sessionUser.avatarUrl;
        profileData.avatar_url = sessionUser.googleAvatarUrl || sessionUser.avatarUrl;
      }
    }

    // Insert profile
    console.log('💾 Inserting profile data:', { email, name, ...profileData });
    
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select('id, email, name')
      .single();

    if (createError) {
      console.error('❌ Error creating profile:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint,
      });
      
      // Handle duplicate key error
      if (createError.code === '23505') {
        return res.status(409).json({
          error: 'Profile already exists',
          message: 'A profile with this email already exists',
        });
      }
      
      return res.status(500).json({
        error: 'Failed to create profile',
        message: createError.message || 'Could not create user profile',
        details: createError.details || null,
      });
    }

    if (!newProfile) {
      console.error('❌ No profile returned after insert');
      return res.status(500).json({
        error: 'Failed to create profile',
        message: 'Profile was not created successfully',
      });
    }

    // Create initial gamification data
    const { error: gamificationError } = await supabase
      .from('user_gamification')
      .insert({
        user_profile_id: newProfile.id,
        circle_member_id: tempCircleId, // Use temporary circle_id until user is added to Circle
        current_level: 1,
        current_level_name: 'Level 1',
        total_points: 0,
        points_to_next_level: 500,
        level_progress: 0,
        updated_at: new Date().toISOString(),
      });

    if (gamificationError) {
      console.error('⚠️ Error creating gamification data:', gamificationError);
      // Don't fail the request, gamification can be created later
    }

    console.log('✅ Profile created successfully:', newProfile.id);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
      },
    });

  } catch (error: any) {
    console.error('❌ Exception in createProfileHandler:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

