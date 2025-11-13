// API service for 1to10x Contest Arena
// Handles all backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com';

export interface VerifyMemberRequest {
  email: string;
}

export interface VerifyMemberResponse {
  authorized: boolean;
  message: string;
  accessToken?: string;
}

export interface MemberData {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
  space_memberships?: any[];
  course_progresses?: any[];
  spaces?: any[];
  gamification_stats?: {
    current_level: number;
    total_points: number;
    points_to_next_level: number;
    level_progress: number;
  };
  member_tags?: Array<{
    id: number;
    name: string;
  }>;
  posts_count?: number;
  comments_count?: number;
  activity_score?: {
    activity_score: string;
    presence: string;
    participation: string;
  };
  flattened_profile_fields?: {
    bio?: string;
    TOI?: string;
    primary_learning_goal?: string[];
    years_of_experience?: string[];
    [key: string]: any;
  };
}

export interface MemberSpaces {
  id: number;
  name: string;
  description?: string;
  course_lessons?: any[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  // Verify member with Circle.so
  async verifyMember(email: string): Promise<VerifyMemberResponse> {
    const response = await fetch(`${this.baseUrl}/api/verify-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get member data from Circle.so (primary source) or database (fallback)
  async getMemberData(email?: string): Promise<MemberData> {
    // Return mock data for now to prevent CORS errors
    console.log('⚠️ Returning mock data - Circle API should be called from backend');
    return {
      id: 1,
      email: email || 'user@example.com',
      name: 'User',
      first_name: 'User',
      last_name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      gamification_stats: {
        current_level: 1,
        total_points: 0,
        points_to_next_level: 1000,
        level_progress: 0
      },
      posts_count: 0,
      comments_count: 0,
      member_tags: [],
      activity_score: {
        activity_score: "0",
        presence: "0",
        participation: "0"
      },
      flattened_profile_fields: {}
    } as MemberData;
    
    /* DISABLED: Direct Circle API calls from frontend cause CORS errors
    // Always try Circle API first - this is the source of truth
    const circleUrl = email
      ? `${this.baseUrl}/api/member?email=${encodeURIComponent(email)}`
      : `${this.baseUrl}/api/member`;
    
    try {
      const response = await fetch(circleUrl, { credentials: 'include' as RequestCredentials });
      
      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      const isJSON = contentType && contentType.includes('application/json');
      
      if (response.ok) {
        if (!isJSON) {
          console.warn('⚠️ Response is not JSON, content-type:', contentType);
          throw new Error('API returned non-JSON response');
        }
        const data = await response.json();
        console.log('✅ User data fetched from Circle API');
        return data;
      }
      
      // If 404, user not found in Circle
      if (response.status === 404) {
        // Try to parse error message, but handle HTML responses
        let errorData: any = {};
        if (isJSON) {
          try {
            errorData = await response.json();
          } catch (e) {
            console.warn('⚠️ Could not parse 404 response as JSON');
          }
        } else {
          // If HTML response, just mark as not found
          console.warn('⚠️ 404 response is HTML, not JSON');
        }
        const error: any = new Error(errorData.message || 'Member not found in Circle');
        error.notFound = true;
        throw error;
      }
      
      // For other errors, check if response is JSON
      if (isJSON) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch member data: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to fetch member data: ${response.statusText}`);
        }
      } else {
        // HTML error page or other non-JSON response
        console.warn('⚠️ API returned non-JSON error response');
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      // If Circle API fails, try database as fallback
      if (!error.notFound) {
        try {
          const dbUrl = email
            ? `${this.baseUrl}/api/user?email=${encodeURIComponent(email)}`
            : `${this.baseUrl}/api/user`;
          const dbResponse = await fetch(dbUrl, { credentials: 'include' as RequestCredentials });
          
          if (dbResponse.ok) {
            const contentType = dbResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              console.log('✅ User data fetched from database (fallback)');
              return dbResponse.json();
            } else {
              console.warn('⚠️ Database response is not JSON');
            }
          }
        } catch (dbError) {
          console.log('⚠️ Database fetch also failed');
        }
      }
      
      // Re-throw the original error
      throw error;
    }
    */
  }

  // Get member spaces (courses) from Circle.so
  async getMemberSpaces(memberId: string): Promise<MemberSpaces[]> {
    // Return empty array - no API calls
    return [];
  }

  // Calculate user level and XP from Circle data
  calculateUserStats(memberData: MemberData, spaces: MemberSpaces[]) {
    // Ensure spaces is always an array
    const spacesArray = Array.isArray(spaces) ? spaces : [];
    
    // Calculate level based on course progress and activity
    const completedLessons = spacesArray.reduce((total, space) => {
      return total + (space.course_lessons?.filter((lesson: any) => lesson.completed).length || 0);
    }, 0);

    const totalLessons = spacesArray.reduce((total, space) => {
      return total + (space.course_lessons?.length || 0);
    }, 0);

    // Calculate XP based on completed lessons and activity
    const baseXP = completedLessons * 100; // 100 XP per completed lesson
    const bonusXP = Math.floor(totalLessons * 0.1) * 50; // 50 XP bonus for course participation
    const totalXP = baseXP + bonusXP;

    // Calculate level (every 1000 XP = 1 level, starting from level 1)
    const level = Math.floor(totalXP / 1000) + 1;
    const currentLevelXP = totalXP % 1000;
    const nextLevelXP = 1000;

    // Calculate badges based on achievements
    const badges = this.calculateBadges(memberData, spacesArray, completedLessons);

    return {
      level,
      currentXP: totalXP,
      currentLevelXP,
      nextLevelXP,
      completedLessons,
      totalLessons,
      badges,
      streak: this.calculateStreak(memberData),
    };
  }

  // Calculate badges from Circle data
  private calculateBadges(memberData: MemberData, spaces: MemberSpaces[], completedLessons: number) {
    const badges = [];

    // Course completion badges
    if (completedLessons >= 10) badges.push({ name: 'Course Master', category: 'Achievement', earned: true });
    if (completedLessons >= 5) badges.push({ name: 'Quick Learner', category: 'Achievement', earned: true });
    if (completedLessons >= 1) badges.push({ name: 'Getting Started', category: 'Achievement', earned: true });

    // Consistency badges
    if (memberData.created_at) {
      const daysSinceJoined = Math.floor((Date.now() - new Date(memberData.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceJoined >= 30) badges.push({ name: 'Veteran', category: 'Consistency', earned: true });
      if (daysSinceJoined >= 7) badges.push({ name: 'Week Warrior', category: 'Consistency', earned: true });
    }

    // Community badges (placeholder - would need more Circle data)
    if (spaces.length >= 3) badges.push({ name: 'Multi-Course', category: 'Community', earned: true });

    return badges;
  }

  // Calculate streak (placeholder - would need activity data from Circle)
  private calculateStreak(memberData: MemberData): number {
    // This would need to be calculated from actual activity data
    // For now, return a mock value based on account age
    if (memberData.created_at) {
      const daysSinceJoined = Math.floor((Date.now() - new Date(memberData.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return Math.min(daysSinceJoined, 30); // Cap at 30 days
    }
    return 0;
  }
}

export const apiService = new ApiService();
