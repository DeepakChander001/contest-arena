// src/contexts/AuthContext.tsx
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

interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  handleGoogleLogin: (googleUserData: GoogleUserData) => Promise<void>;
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

  const isAuthenticated = !!user;

  // Listen for storage changes
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

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem('10x-contest-user');
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('📦 Loading user from localStorage:', userData.email);
            setUser(userData);
          } catch (parseError) {
            console.error('❌ Error parsing stored user data:', parseError);
            localStorage.removeItem('10x-contest-user');
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('10x-contest-user');
      } finally {
        // Always set loading to false
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.1to10x.com'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('✅ Backend logout successful');
      } else {
        console.error('❌ Backend logout failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error logging out from backend:', error);
    } finally {
      // Always clear local state
      console.log('🧹 Clearing local user data...');
      setUser(null);
      localStorage.removeItem('10x-contest-user');
      localStorage.removeItem('google_credential');
      
      // Use window.location for logout since we're going to landing page
      window.location.href = '/';
    }
  };

  // FIXED: Frontend Google OAuth handler - no more window.location.href
  const handleGoogleLogin = async (googleUserData: GoogleUserData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Processing Google OAuth login for:', googleUserData.email);
      
      // For now, create user from Google data directly
      // You can add Circle/Supabase integration later when backend is ready
      const fullUser: User = {
        id: googleUserData.sub,
        email: googleUserData.email,
        name: googleUserData.name,
        avatarUrl: googleUserData.picture,
        googleId: googleUserData.sub,
        level: 1,
        currentXP: 0,
        currentLevelXP: 0,
        nextLevelXP: 1000,
        progressPct: 0,
        badges: [],
        postsCount: 0,
        commentsCount: 0,
        activityScore: "0",
        bio: null,
        profileFields: {},
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        completedLessons: 0,
        totalLessons: 0,
        streak: 0,
        spaces: []
      };

      console.log('✅ User authenticated successfully');
      
      // Set user in state
      setUser(fullUser);
      
      // Save to localStorage
      localStorage.setItem('10x-contest-user', JSON.stringify(fullUser));
      
      setIsLoading(false);
      
      // Don't navigate here - let Auth.tsx handle the navigation
      return;
      
    } catch (error: any) {
      console.error('❌ Error in handleGoogleLogin:', error);
      setIsLoading(false);
      throw error; // Throw error for Auth.tsx to handle
    }
  };

  // Legacy backend-based Google OAuth (kept for backward compatibility)
  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: 'Please use the Google Login button on the auth page.',
    };
  };

  const refreshUserData = async (emailParam?: string) => {
    // Get email from parameter, current user, or localStorage
    let emailToFetch = emailParam || user?.email;
    
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
      
      // For now, just keep existing data since we don't have working APIs
      // You can uncomment this when your backend is ready
      /*
      const memberData: any = await apiService.getMemberData(emailToFetch);

      if (!memberData || !memberData.id) {
        console.warn('⚠️ No member data returned from API');
        return;
      }

      let spaces: MemberSpaces[] = [];
      try {
        spaces = await apiService.getMemberSpaces(memberData.id.toString());
      } catch (spaceError) {
        console.warn('⚠️ Could not fetch spaces:', spaceError);
      }

      const stats = apiService.calculateUserStats(memberData, spaces);

      const mapped: User = {
        // ... map the data
      };

      setUser(mapped);
      localStorage.setItem('10x-contest-user', JSON.stringify(mapped));
      */
      
      console.log('✅ User data refreshed (using cached data)');
    } catch (error: any) {
      console.error('❌ Error refreshing user data:', error);
      // Don't throw - just log the error
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
        handleGoogleLogin,
        logout,
        refreshUserData,
        updateUserXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};