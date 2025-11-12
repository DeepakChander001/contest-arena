import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { apiService, MemberData, MemberSpaces } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  googleId?: string;
  level: number;
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPct: number;
  badges: Array<{ id: number; name: string }>;
  postsCount: number;
  commentsCount: number;
  activityScore: string;
  bio: string | null;
  profileFields: Record<string, any>;
  createdAt?: string;
  lastSeenAt?: string;
  completedLessons: number;
  totalLessons: number;
  streak: number;
  spaces: MemberSpaces[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUserData: (email?: string) => Promise<void>;
  updateUserXP: (xpEarned: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const oAuthProcessedRef = useRef(false);
  const isProcessingOAuthRef = useRef(false);

  const isAuthenticated = !!user;

  // Listen for storage changes (when user is set from other components)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('10x-contest-user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.email) {
            console.log('📦 User data updated in localStorage, updating state');
            setUser(userData);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ Error parsing stored user data:', error);
        }
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage event (for same-window updates)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        // Check for OAuth callback parameters
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (success === 'true' && userParam && !oAuthProcessedRef.current && !isProcessingOAuthRef.current) {
          // Mark as processing to prevent race conditions
          isProcessingOAuthRef.current = true;
          oAuthProcessedRef.current = true;
          
          // IMMEDIATELY clean up URL parameters to prevent re-processing
          // This must happen BEFORE any async operations
          const currentPath = window.location.pathname;
          window.history.replaceState({}, document.title, currentPath);
          console.log('🧹 URL params cleaned immediately');
          
          // Handle OAuth callback
          let googleUserData;
          try {
            googleUserData = JSON.parse(decodeURIComponent(userParam));
          } catch (parseError) {
            console.error('❌ Error parsing user param:', parseError);
            isProcessingOAuthRef.current = false;
            setIsLoading(false);
            return;
          }
          
          console.log('🔄 Processing OAuth callback for:', googleUserData.email);
          
          // Always fetch Circle data - never use Google data as fallback
          try {
            const memberData = await apiService.getMemberData(googleUserData.email);
            
            // If member data is found, proceed with Circle data
            if (memberData && memberData.id) {
              console.log('✅ Circle member found, fetching full profile data...');
              
              // Fetch spaces and calculate stats
              let spaces: MemberSpaces[] = [];
              try {
                const spacesData = await apiService.getMemberSpaces(memberData.id.toString());
                // Ensure spaces is always an array
                spaces = Array.isArray(spacesData) ? spacesData : [];
              } catch (spaceError) {
                console.warn('⚠️ Could not fetch spaces:', spaceError);
                // Keep spaces as empty array on error
                spaces = [];
              }
              
              const stats = apiService.calculateUserStats(memberData, spaces);

              const fullUser: User = {
                id: memberData.id.toString(),
                email: memberData.email,
                name: memberData.name || googleUserData.name || 'User',
                avatarUrl: memberData.avatar_url || googleUserData.avatarUrl || null,
                googleId: googleUserData.googleId || googleUserData.id,
                level: memberData.gamification_stats?.current_level || 1,
                currentXP: memberData.gamification_stats?.total_points || 0,
                currentLevelXP: memberData.gamification_stats?.total_points || 0,
                nextLevelXP: memberData.gamification_stats?.points_to_next_level || 1000,
                progressPct: memberData.gamification_stats?.level_progress || 0,
                badges: memberData.member_tags?.map((tag: any) => ({
                  id: tag.id,
                  name: tag.name,
                })) || [],
                postsCount: memberData.posts_count || 0,
                commentsCount: memberData.comments_count || 0,
                activityScore: memberData.activity_score?.activity_score || "0",
                bio: memberData.flattened_profile_fields?.bio || null,
                profileFields: memberData.flattened_profile_fields || {},
                createdAt: memberData.created_at,
                lastSeenAt: memberData.last_seen_at,
                completedLessons: stats.completedLessons,
                totalLessons: stats.totalLessons,
                streak: stats.streak,
                spaces,
              };

              console.log('✅ User data prepared:', { id: fullUser.id, email: fullUser.email, name: fullUser.name });
              
              // CRITICAL: Set user state FIRST using functional update to ensure it's set
              setUser(prevUser => {
                // If user is already set, don't overwrite (prevents race conditions)
                if (prevUser && prevUser.email === fullUser.email) {
                  console.log('⚠️ User already set, skipping update');
                  return prevUser;
                }
                return fullUser;
              });
              
              // Save to localStorage
              localStorage.setItem('10x-contest-user', JSON.stringify(fullUser));
              
              // Mark processing as complete
              isProcessingOAuthRef.current = false;
              
              // Mark loading as complete AFTER everything is set
              // Use setTimeout to ensure state update is processed
              setTimeout(() => {
                setIsLoading(false);
                console.log('✅ OAuth processing complete - user state set, ready to render');
              }, 0);
              
              return;
            } else {
              // User not found in Circle - redirect to profile creation
              console.log('⚠️ User not found in Circle, redirecting to profile creation');
              isProcessingOAuthRef.current = false;
              setIsLoading(false);
              // Only redirect if not already on create-profile page
              if (window.location.pathname !== '/create-profile') {
                window.location.href = `/create-profile?email=${encodeURIComponent(googleUserData.email)}&name=${encodeURIComponent(googleUserData.name || (googleUserData.firstName + ' ' + googleUserData.lastName).trim() || '')}`;
              }
              return;
            }
          } catch (error: any) {
            console.error('❌ Error fetching Circle data:', error);
            
            // If error is "not found", redirect to profile creation
            if (error.message?.includes('not found') || error.message?.includes('404') || error.notFound) {
              console.log('⚠️ User not found in Circle, redirecting to profile creation');
              isProcessingOAuthRef.current = false;
              setIsLoading(false);
              if (window.location.pathname !== '/create-profile') {
                window.location.href = `/create-profile?email=${encodeURIComponent(googleUserData.email)}&name=${encodeURIComponent((googleUserData.firstName + ' ' + googleUserData.lastName).trim() || googleUserData.name || '')}`;
              }
              return;
            }
            
            // For other errors, show error message but don't set user
            console.error('❌ Failed to fetch Circle data. User must be a Circle member to access the platform.');
            isProcessingOAuthRef.current = false;
            setIsLoading(false);
            return;
          }
        } else if (error) {
          console.error('OAuth error:', error);
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          isProcessingOAuthRef.current = false;
          setIsLoading(false);
        } else {
          // Load from localStorage
          const storedUser = localStorage.getItem('10x-contest-user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              console.log('📦 Loading user from localStorage:', userData.email);
              setUser(userData);
              
              // Refresh user data from API in background (don't block)
              setTimeout(() => {
                refreshUserData().catch(err => {
                  console.warn('⚠️ Could not refresh user data:', err);
                });
              }, 500);
            } catch (parseError) {
              console.error('❌ Error parsing stored user data:', parseError);
              localStorage.removeItem('10x-contest-user');
            }
          }
          isProcessingOAuthRef.current = false;
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('10x-contest-user');
        isProcessingOAuthRef.current = false;
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      // Verify member with Circle.so
      const verification = await apiService.verifyMember(email);
      
      if (!verification.authorized) {
        return {
          success: false,
          message: verification.message,
        };
      }

      // After email-login flow (legacy), immediately fetch real Circle data
      await refreshUserData();

      return {
        success: true,
        message: verification.message,
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logout button clicked - starting logout process...');
    try {
      // Call backend logout endpoint
      console.log('📡 Calling backend logout endpoint...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('✅ Backend logout successful');
      } else {
        console.error('❌ Backend logout failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error logging out from backend:', error);
    } finally {
      // Always clear local state
      console.log('🧹 Clearing local user data...');
      setUser(null);
      localStorage.removeItem('10x-contest-user');
      oAuthProcessedRef.current = false;
      isProcessingOAuthRef.current = false;
      
      // Redirect to homepage (landing page)
      console.log('🏠 Redirecting to homepage...');
      window.location.href = '/';
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      // Use the correct endpoint: /api/auth/google/url
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/auth/google/url`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to get Google OAuth URL');
      }

      const data = await response.json();
      const url = data.url;
      
      if (!url) {
        throw new Error('No OAuth URL returned from server');
      }
      
      // Redirect to Google OAuth
      window.location.href = url;
      
      return {
        success: true,
        message: 'Redirecting to Google...',
      };

    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        message: error.message || 'Google OAuth failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async (emailParam?: string) => {
    // Get email from parameter, current user, or localStorage
    let emailToFetch = emailParam || user?.email;
    
    // If still no email, try to get from localStorage
    if (!emailToFetch) {
      try {
        const storedUser = localStorage.getItem('10x-contest-user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          emailToFetch = parsed.email;
        }
      } catch (e) {
        console.warn('⚠️ Could not parse stored user data');
      }
    }
    
    if (!emailToFetch) {
      console.warn('⚠️ No email available for refreshUserData');
      return;
    }

    try {
      console.log('🔄 Refreshing user data for:', emailToFetch);
      
      // Get fresh member data (session-aware)
      const memberData: any = await apiService.getMemberData(emailToFetch);

      if (!memberData || !memberData.id) {
        console.warn('⚠️ No member data returned from API');
        return;
      }

      // Get spaces
      let spaces: MemberSpaces[] = [];
      try {
        spaces = await apiService.getMemberSpaces(memberData.id.toString());
      } catch (spaceError) {
        console.warn('⚠️ Could not fetch spaces:', spaceError);
      }

      const stats = apiService.calculateUserStats(memberData, spaces);

      // Map Circle response to our User model exactly per spec
      const level = Number(memberData?.gamification_stats?.current_level ?? 1);
      const totalPoints = Number(memberData?.gamification_stats?.total_points ?? 0);
      const pointsToNext = Number(memberData?.gamification_stats?.points_to_next_level ?? 1000);
      const progressRaw = memberData?.gamification_stats?.level_progress ?? 0;
      const progressPct = typeof progressRaw === 'number' && progressRaw <= 1 ? progressRaw * 100 : Number(progressRaw);

      const mapped: User = {
        id: String(memberData?.id ?? user?.id ?? ''),
        email: memberData?.email ?? emailToFetch,
        name: memberData?.name ?? user?.name ?? 'User',
        avatarUrl: memberData?.avatar_url ?? user?.avatarUrl ?? null,
        googleId: user?.googleId,

        level,
        currentXP: totalPoints,
        currentLevelXP: totalPoints,
        nextLevelXP: pointsToNext,
        progressPct,

        badges: (memberData?.member_tags || []).map((t: any) => ({ id: t.id, name: t.name })),

        postsCount: memberData?.posts_count ?? 0,
        commentsCount: memberData?.comments_count ?? 0,
        activityScore: memberData?.activity_score?.activity_score,

        bio: memberData?.flattened_profile_fields?.bio ?? null,
        profileFields: memberData?.flattened_profile_fields ?? {},
        createdAt: memberData?.created_at,
        lastSeenAt: memberData?.last_seen_at,

        completedLessons: stats.completedLessons,
        totalLessons: stats.totalLessons,
        streak: user?.streak ?? stats.streak ?? 0,
        spaces,
      };

      setUser(mapped);
      localStorage.setItem('10x-contest-user', JSON.stringify(mapped));
      console.log('✅ User data refreshed');
    } catch (error: any) {
      console.error('❌ Error refreshing user data:', error);
      throw error;
    }
  };

  const updateUserXP = (xpEarned: number) => {
    setUser((prevUser) => {
      if (!prevUser) return null;

      const newXP = prevUser.currentXP + xpEarned;
      const newLevelXP = prevUser.currentLevelXP + xpEarned;
      
      // Calculate new level if XP exceeds next level threshold
      let newLevel = prevUser.level;
      let newNextLevelXP = prevUser.nextLevelXP;
      let newProgressPct = prevUser.progressPct;
      
      if (newLevelXP >= newNextLevelXP) {
        newLevel += 1;
        newNextLevelXP = newLevel * 1000; // Simple level progression
        newProgressPct = ((newLevelXP - (newLevel - 1) * 1000) / 1000) * 100;
      } else {
        newProgressPct = (newLevelXP / newNextLevelXP) * 100;
      }

      const updatedUser = {
        ...prevUser,
        level: newLevel,
        currentXP: newXP,
        currentLevelXP: newLevelXP,
        nextLevelXP: newNextLevelXP,
        progressPct: newProgressPct,
      };

      localStorage.setItem('10x-contest-user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        loginWithGoogle,
        logout,
        refreshUserData,
        updateUserXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
