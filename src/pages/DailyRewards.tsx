import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Gift, 
  Zap, 
  Trophy, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  Flame,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DailyReward {
  day: number;
  xp: number;
  claimed: boolean;
  available: boolean;
  isToday: boolean;
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  totalXpEarned: number;
  weekProgress: number;
}

const DailyRewards = () => {
  const { user, isAuthenticated, updateUserXP, refreshUserData } = useAuth();
  const [rewards, setRewards] = useState<DailyReward[]>([]);
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Weekly reward structure (repeats every 7 days)
  const weeklyRewards = [
    { day: 1, xp: 5, bonus: "Welcome back!" },
    { day: 2, xp: 10, bonus: "Keep it up!" },
    { day: 3, xp: 15, bonus: "You're on fire!" },
    { day: 4, xp: 20, bonus: "Halfway there!" },
    { day: 5, xp: 25, bonus: "Almost there!" },
    { day: 6, xp: 30, bonus: "One more day!" },
    { day: 7, xp: 50, bonus: "Week Complete! 🎉" },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDailyRewards();
    }
  }, [isAuthenticated, user]);

  const refreshSession = async () => {
    if (!user || !user.email) {
      console.error('❌ No user or email available for session refresh');
      return false;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userData: {
            id: user.id || user.googleId,
            email: user.email, // Ensure email is always set
            name: user.name || 'User',
            googleId: user.googleId || user.id,
            googleName: user.name || 'User',
            googleEmail: user.email, // Add googleEmail explicitly
            avatarUrl: user.avatarUrl,
            googleAvatarUrl: user.avatarUrl
          }
        })
      });

      if (response.ok) {
        console.log('✅ Session refreshed successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to refresh session:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      return false;
    }
  };

  const fetchDailyRewards = async () => {
    try {
      setIsLoading(true);
      
      // First try to refresh the session
      await refreshSession();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/daily-rewards`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
        setUserStreak(data.streak);
      } else {
        // If API fails, show mock data
        generateMockRewards();
      }
    } catch (error) {
      console.error('Error fetching daily rewards:', error);
      generateMockRewards();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockRewards = () => {
    // For new users, only Day 1 should be available
    const mockRewards = weeklyRewards.map((reward, index) => ({
      day: reward.day,
      xp: reward.xp,
      claimed: false, // No days claimed yet
      available: index === 0, // Only Day 1 is available for new users
      isToday: index === 0, // Day 1 is today for new users
    }));

    setRewards(mockRewards);
    setUserStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      totalXpEarned: 0,
      weekProgress: 0,
    });
  };

  const claimReward = async (day: number) => {
    if (!user) return;

    try {
      setIsClaiming(true);
      
      // First refresh the session
      await refreshSession();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/daily-rewards/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ day }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`🎉 Claimed ${data.xpEarned} XP! Keep the streak going!`);
        
        // Update user's XP locally
        if (data.xpEarned) {
          updateUserXP(data.xpEarned);
        }
        
        // Refresh user data from server to get updated XP
        await refreshUserData();
        
        // Refresh rewards data to show updated state
        await fetchDailyRewards();
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to claim reward. Please try again." }));
        console.error('❌ Error claiming reward:', errorData);
        toast.error(errorData.message || errorData.error || "Failed to claim reward. Please try again.");
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error("Failed to claim reward. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const getRewardIcon = (day: number) => {
    if (day === 7) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (day >= 5) return <Star className="w-6 h-6 text-purple-500" />;
    if (day >= 3) return <Zap className="w-6 h-6 text-blue-500" />;
    return <Gift className="w-6 h-6 text-green-500" />;
  };

  const getRewardStatus = (reward: DailyReward) => {
    if (reward.claimed) return "claimed";
    if (reward.available) return "available";
    return "locked";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="glass-card-premium max-w-md hover-glow">
          <CardContent className="p-8 text-center">
            <div className="icon-gradient mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4 gradient-text">Daily Rewards</h2>
            <p className="text-muted-foreground mb-6">
              Login daily to earn XP and build your streak! Each week brings new rewards.
            </p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full btn-premium">
              Login to Start Earning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header - PREMIUM ENHANCEMENT */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            Daily Rewards
          </h1>
          <p className="text-lg text-muted-foreground">
            Login daily to earn XP and build your streak! Rewards reset every week.
          </p>
        </div>

        {/* Streak Stats - PREMIUM ENHANCEMENT */}
        {userStreak && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Flame, label: "Current Streak", value: `${userStreak.currentStreak} days`, color: "text-orange-500" },
              { icon: Trophy, label: "Longest Streak", value: `${userStreak.longestStreak} days`, color: "text-yellow-500" },
              { icon: Zap, label: "Total XP Earned", value: userStreak.totalXpEarned.toString(), color: "text-primary" },
              { icon: Target, label: "Week Progress", value: `${userStreak.weekProgress}/7`, color: "text-green-500" },
            ].map((stat, idx) => (
              <Card key={idx} className="stat-card-premium glass-card hover-glow hover:scale-105 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="icon-gradient mx-auto mb-2 w-12 h-12 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} gradient-text`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Weekly Progress - PREMIUM ENHANCEMENT */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Calendar className="w-5 h-5" />
              This Week's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Progress</span>
                <span className="text-sm text-muted-foreground">
                  {userStreak?.weekProgress || 0}/7 days
                </span>
              </div>
              <Progress 
                value={((userStreak?.weekProgress || 0) / 7) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Complete all 7 days to earn the weekly bonus!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Rewards Grid - PREMIUM ENHANCEMENT */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Gift className="w-5 h-5" />
              Daily Rewards
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Claim your reward for today! Miss a day and you'll restart from Day 1.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {rewards.map((reward) => {
                const status = getRewardStatus(reward);
                const weeklyReward = weeklyRewards[reward.day - 1];
                
                return (
                  <div
                    key={reward.day}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      status === 'claimed'
                        ? 'border-green-500 bg-green-500/10'
                        : status === 'available'
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'border-gray-300 bg-gray-100/10'
                    }`}
                  >
                    {/* Day Badge */}
                    <div className="text-center mb-3">
                      <Badge 
                        variant={status === 'available' ? 'default' : status === 'claimed' ? 'secondary' : 'outline'}
                        className="mb-2"
                      >
                        Day {reward.day}
                      </Badge>
                      {reward.isToday && (
                        <Badge variant="destructive" className="text-xs">
                          Today
                        </Badge>
                      )}
                    </div>

                    {/* Reward Icon */}
                    <div className="flex justify-center mb-3">
                      {getRewardIcon(reward.day)}
                    </div>

                    {/* XP Amount */}
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-primary">
                        {reward.xp} XP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {weeklyReward.bonus}
                      </p>
                    </div>

                    {/* Status Icon */}
                    <div className="flex justify-center">
                      {status === 'claimed' && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {status === 'available' && (
                        <Button
                          size="sm"
                          onClick={() => claimReward(reward.day)}
                          disabled={isClaiming}
                          className="w-full"
                        >
                          {isClaiming ? 'Claiming...' : 'Claim'}
                        </Button>
                      )}
                      {status === 'locked' && (
                        <XCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Special indicator for day 7 */}
                    {reward.day === 7 && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="destructive" className="text-xs">
                          Bonus!
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>How Daily Rewards Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Keep Your Streak</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Login daily to claim rewards</li>
                  <li>• Each day gives more XP than the last</li>
                  <li>• Day 7 gives a bonus 50 XP!</li>
                  <li>• Complete the week for maximum rewards</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">⚠️ Miss a Day</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your streak resets to Day 1</li>
                  <li>• You'll start earning from 5 XP again</li>
                  <li>• Don't worry - the cycle repeats weekly</li>
                  <li>• Build your longest streak record!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyRewards;
