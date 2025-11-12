import { useState, useEffect } from "react";
import { TrendingUp, Trophy, Target, Award, Loader2, Activity, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProgressData {
  xpOverTime: {
    daily: Array<{ date: string; xp: number; transactions: number }>;
    monthly: Array<{ month: string; xp: number; transactions: number }>;
  };
  circleActivity: {
    scores: Array<{
      date: string;
      activity_score: number;
      presence: number;
      participation: number;
      contribution: number;
      connection: number;
      posts: number;
      comments: number;
    }>;
    current: any;
    history: any[];
  };
  webAppActivity: {
    dailyLogins: Array<{ date: string; streak_count: number; xp_earned: number }>;
    xpTransactions: any[];
    activityByType: {
      daily_login: number;
      contest: number;
      badge: number;
      other: number;
    };
  };
  recentActivities: Array<{
    type: string;
    description: string;
    xp: number;
    time: string;
    timeAgo: string;
  }>;
  currentStats: {
    totalXP: number;
    currentLevel: number;
    streak: number;
    circleActivityScore: number;
    postsCount: number;
    commentsCount: number;
    totalTransactions: number;
    totalLogins: number;
  };
  user: {
    email: string;
    joinedDate: string;
  };
}

const MyProgress = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh session
  const refreshSession = async () => {
    if (!user) return false;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userData: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
            googleId: user?.googleId || user?.id,
            googleName: user?.name,
            googleEmail: user?.email,
            avatarUrl: user?.avatarUrl
          }
        })
      });

      if (response.ok) {
        console.log('✅ Progress session refreshed successfully');
        return true;
      } else {
        console.error('❌ Failed to refresh progress session');
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing progress session:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchProgressData = async (isInitialLoad = false) => {
      if (!user) return;

      try {
        if (isInitialLoad) {
          setIsLoading(true);
        }
        setError(null);

        // Refresh session first to ensure authentication
        await refreshSession();

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/progress`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to fetch progress data');
        }

        const data = await response.json();
        setProgressData(data);
      } catch (err: any) {
        console.error('Error fetching progress data:', err);
        if (isInitialLoad) {
          setError(err.message || 'Failed to load progress data');
        }
      } finally {
        if (isInitialLoad) {
          setIsLoading(false);
        }
      }
    };

    if (user && !authLoading) {
      // Initial load
      fetchProgressData(true);
      
      // Auto-refresh every 30 seconds for real-time updates (without loading state)
      const interval = setInterval(() => {
        fetchProgressData(false);
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, authLoading]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !progressData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'Failed to load progress data'}</p>
        </div>
      </div>
    );
  }

  const stats = progressData.currentStats;
  const userData = {
    level: stats.currentLevel,
    currentXP: stats.totalXP,
    nextLevelXP: (stats.currentLevel * 500),
    streak: stats.streak,
  };

  // Format data for charts
  const xpDailyData = progressData.xpOverTime.daily.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    xp: item.xp,
    transactions: item.transactions,
  }));

  const xpMonthlyData = progressData.xpOverTime.monthly.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    xp: item.xp,
    transactions: item.transactions,
  }));

  // Circle Activity Scores Chart Data
  const circleActivityData = progressData.circleActivity.scores.length > 0
    ? progressData.circleActivity.scores.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activity: parseFloat(item.activity_score.toString()) || 0,
        presence: parseFloat(item.presence.toString()) || 0,
        participation: parseFloat(item.participation.toString()) || 0,
        contribution: parseFloat(item.contribution.toString()) || 0,
        connection: parseFloat(item.connection.toString()) || 0,
        posts: item.posts || 0,
        comments: item.comments || 0,
      }))
    : [];

  // Activity by Type Pie Chart
  const activityByTypeData = [
    { name: "Daily Login", value: progressData.webAppActivity.activityByType.daily_login, color: "hsl(var(--primary))" },
    { name: "Contests", value: progressData.webAppActivity.activityByType.contest, color: "hsl(var(--success))" },
    { name: "Badges", value: progressData.webAppActivity.activityByType.badge, color: "hsl(var(--warning))" },
    { name: "Other", value: progressData.webAppActivity.activityByType.other, color: "hsl(var(--muted))" },
  ].filter(item => item.value > 0);

  // Daily Login Streak Data
  const loginStreakData = progressData.webAppActivity.dailyLogins.slice(0, 30).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    streak: item.streak_count || 0,
    xp: item.xp_earned || 0,
  }));

  // Combined Activity Chart (Circle + Web App)
  const combinedActivityData = xpDailyData.map((xpItem, idx) => {
    const circleItem = circleActivityData[idx] || {};
    return {
      date: xpItem.date,
      webAppXP: xpItem.xp,
      circleActivity: circleItem.activity || 0,
      circlePosts: circleItem.posts || 0,
      circleComments: circleItem.comments || 0,
    };
  });

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--accent))", "hsl(var(--muted))"];

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Header - PREMIUM ENHANCEMENT */}
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">My Progress</h1>
        <p className="text-muted-foreground">Track your journey and achievements</p>
      </div>

      {/* Hero Stats Row - PREMIUM ENHANCEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card-premium glass-card hover-glow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28">
                <svg className="transform -rotate-90 w-28 h-28">
                  <circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeDasharray={`${(userData.currentXP / userData.nextLevelXP) * 314} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">LEVEL</div>
                    <div className="text-3xl font-bold text-primary">{userData.level}</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="font-mono text-sm text-muted-foreground">
                  {userData.currentXP} / {userData.nextLevelXP} XP
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {userData.nextLevelXP - userData.currentXP} XP to Level {userData.level + 1}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-premium glass-card hover-glow">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <div className="font-mono text-3xl font-bold gradient-text">{stats.totalXP} XP</div>
              <div className="flex items-center gap-2 text-success text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.totalTransactions} activities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-premium glass-card hover-glow">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Login Streak</span>
              <div className="font-mono text-3xl font-bold gradient-text">{stats.streak} days</div>
              <div className="text-sm text-muted-foreground">
                {stats.totalLogins} total logins
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-premium glass-card hover-glow">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Circle Activity</span>
              <div className="font-mono text-3xl font-bold gradient-text">{stats.circleActivityScore.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">
                {stats.postsCount} posts, {stats.commentsCount} comments
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Circle Activity vs Web App Activity Comparison - PREMIUM ENHANCEMENT */}
      <Card className="glass-card-premium hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Activity className="w-5 h-5" />
            Circle Activity vs Web App Activity
          </CardTitle>
          <CardDescription>Real-time comparison of your activity across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={combinedActivityData}>
              <defs>
                <linearGradient id="colorWebApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCircle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  background: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="webAppXP" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorWebApp)"
                name="Web App XP"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="circleActivity" 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#colorCircle)"
                name="Circle Activity Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* XP Over Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">XP Gained (Last 30 Days)</CardTitle>
            <CardDescription>Daily XP from web app activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={xpDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ fill: "hsl(var(--primary))", r: 4 }} 
                  name="XP"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">XP Gained (Last 12 Months)</CardTitle>
            <CardDescription>Monthly XP summary</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={xpMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Bar dataKey="xp" fill="hsl(var(--primary))" name="XP" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Circle Activity Scores */}
      {circleActivityData.length > 0 && (
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Zap className="w-5 h-5" />
              Circle.so Activity Scores
            </CardTitle>
            <CardDescription>Your activity metrics from Circle.so community</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={circleActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  name="Activity Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="presence" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2} 
                  name="Presence"
                />
                <Line 
                  type="monotone" 
                  dataKey="participation" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2} 
                  name="Participation"
                />
                <Line 
                  type="monotone" 
                  dataKey="contribution" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2} 
                  name="Contribution"
                />
                <Line 
                  type="monotone" 
                  dataKey="connection" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2} 
                  name="Connection"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Circle Posts & Comments */}
      {circleActivityData.length > 0 && (
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Circle.so Engagement</CardTitle>
            <CardDescription>Posts and comments activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={circleActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Legend />
                <Bar dataKey="posts" fill="hsl(var(--primary))" name="Posts" />
                <Bar dataKey="comments" fill="hsl(var(--success))" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Breakdown and Login Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Activity Breakdown</CardTitle>
            <CardDescription>XP earned by activity type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={activityByTypeData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {activityByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Daily Login Streak & XP</CardTitle>
            <CardDescription>Your login consistency and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginStreakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="streak" fill="hsl(var(--primary))" name="Streak Days" />
                <Bar yAxisId="right" dataKey="xp" fill="hsl(var(--success))" name="XP Earned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest XP-earning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.recentActivities.length > 0 ? (
              progressData.recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timeAgo}</p>
                  </div>
                  <div className="font-mono text-sm text-primary">+{activity.xp} XP</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProgress;
