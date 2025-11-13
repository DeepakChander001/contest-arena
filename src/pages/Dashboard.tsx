import { Flame, TrendingUp, Award, Loader2 } from "lucide-react";
import { LevelProgress } from "@/components/LevelProgress";
import { ContestCard } from "@/components/ContestCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🏠 Dashboard component loaded');
  console.log('🏠 User:', user);
  console.log('🏠 IsLoading:', isLoading);

  // Generate mock monthly XP data for chart (would come from real data)
  const monthlyXP = [120, 230, 180, 290, 310, 260, 340];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Just reload the page for now
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Show loading state - Wait for AuthContext to finish loading
  // This is critical - don't check for user until loading is complete
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Only check for user AFTER loading is complete
  // Give it a moment to ensure state has propagated
  if (!user) {
    // Check localStorage as fallback - if it exists, wait a moment for state to sync
    const storedUser = localStorage.getItem('10x-contest-user');
    if (storedUser) {
      // User exists in localStorage but not in state - wait a moment
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Setting up your dashboard...</p>
          </div>
        </div>
      );
    }
    
    // No user found - show login prompt
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please log in to view your dashboard</h2>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Use user data directly
  const displayUser = user;

  const activeContests = [
    {
      id: "1",
      title: "AI Video Generation Challenge",
      type: "QUALITY" as const,
      duration: "2 days",
      deadline: "3h 24m",
      points: 500,
      participants: 47,
      levelRequired: 4,
      isEligible: true,
    },
    {
      id: "2",
      title: "Speed Automation Task",
      type: "SPEED" as const,
      duration: "4 hours",
      deadline: "1d 5h",
      points: 300,
      participants: 92,
      levelRequired: 5,
      isEligible: true,
    },
    {
      id: "3",
      title: "Advanced RAG Implementation",
      type: "KNOWLEDGE" as const,
      duration: "1 week",
      deadline: "4d 12h",
      points: 800,
      participants: 23,
      levelRequired: 7,
      isEligible: false,
      badges: ["Achievement Badge"],
    },
  ];

  const activityFeed = [
    { type: "submit", text: "You submitted AI Video Challenge", time: "2 hours ago" },
    { type: "badge", text: "You earned Speed Champion badge", time: "5 hours ago" },
    { type: "level", text: "You leveled up to Level 6!", time: "1 day ago" },
    { type: "social", text: "@priya.sharma won the Quality Award", time: "1 day ago" },
  ];

  const stats = [
    { label: "Posts Created", value: (displayUser.postsCount || 0).toString(), trend: "+1" },
    { label: "Comments Made", value: (displayUser.commentsCount || 0).toString(), trend: "+0" },
    { label: "Activity Score", value: (displayUser.activityScore || 0).toString(), trend: "+0.2" },
    { label: "Badges Earned", value: `${(displayUser.badges?.filter((b: any) => b.earned).length || 0)}/22`, progress: Math.round(((displayUser.badges?.filter((b: any) => b.earned).length || 0) / 22) * 100) },
  ];

  return (
    <div className="min-h-screen p-8 space-y-12 animate-fade-in">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your progress overview</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2 hover-glow btn-premium"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Hero Stats Card - Full Width - PREMIUM ENHANCEMENT */}
      <div className="glass-card-premium p-8 rounded-xl shadow-lg card-shimmer hover-glow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Level Progress */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <LevelProgress
              currentLevel={displayUser.level || 1}
              currentXP={displayUser.currentXP || displayUser.totalXP || 0}
              nextLevelXP={displayUser.nextLevelXP || 1000}
              size="lg"
            />
            <div className="text-center lg:text-left">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                XP Trend (7 Days)
              </div>
              <div className="flex gap-1 items-end justify-center lg:justify-start h-12">
                {monthlyXP.map((xp, i) => (
                  <div
                    key={i}
                    className="w-4 bg-gradient-to-t from-primary to-cyan-400 rounded-t transition-all duration-300 hover:scale-110"
                    style={{ height: `${(xp / 340) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center: Current XP */}
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Current XP
              </div>
            <div className="font-mono text-6xl lg:text-7xl font-bold gradient-text tracking-tight mb-3">
              {(displayUser.currentXP || displayUser.totalXP || 0).toLocaleString()}
              </div>
            <div className="text-sm text-success glow-success flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">+{Math.floor((displayUser.currentXP || displayUser.totalXP || 0) * 0.1)} this month</span>
              </div>
            </div>

          {/* Right: Progress & Streak */}
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                To Next Level
              </div>
              <div className="font-mono text-3xl font-bold text-primary mb-3">
                {(displayUser.nextLevelXP || 1000).toLocaleString()} XP
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-primary/20">
                <div
                  className="h-full animated-gradient transition-all duration-500"
                  style={{ width: `${((displayUser.currentXP || displayUser.totalXP || 0) / (displayUser.nextLevelXP || 1000)) * 100}%` }}
                />
              </div>
            </div>

            <div className="stat-card-premium glass-card p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 animate-pulse-glow hover-glow">
              <div className="flex items-center gap-4">
                <div className="icon-gradient">
                  <Flame className="w-8 h-8 text-warning" />
                </div>
              <div>
                  <div className="font-mono text-3xl font-bold">{displayUser.streak || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Day Streak
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Grid - Equal Widths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Available Contests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Available Contests</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
            >
              View All →
            </Button>
          </div>
          <div className="space-y-6">
            {activeContests.map((contest, index) => (
              <div
                key={contest.id}
                className="transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ContestCard {...contest} />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recent Activity */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
          <div className="glass-card-premium p-8 rounded-xl shadow-lg relative hover-glow">
            <div className="timeline-line" />
            <div className="space-y-6 relative pl-8">
              {activityFeed.map((activity, idx) => (
                <div
                  key={idx}
                  className="group hover:bg-white/5 rounded-lg p-4 -ml-4 cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex gap-4 items-start">
                    <div className="timeline-dot absolute left-0 top-6" />
                    <div className="icon-gradient flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      {activity.type === 'submit' && <Award className="w-4 h-4 text-white" />}
                      {activity.type === 'badge' && <Award className="w-4 h-4 text-white" />}
                      {activity.type === 'level' && <TrendingUp className="w-4 h-4 text-white" />}
                      {activity.type === 'social' && <Award className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Quick Stats */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Quick Stats</h3>
        <div className="space-y-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="stat-card-premium glass-card p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover-glow"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="icon-gradient w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    {idx === 0 && <Award className="w-5 h-5 text-white" />}
                    {idx === 1 && <TrendingUp className="w-5 h-5 text-white" />}
                    {idx === 2 && <Award className="w-5 h-5 text-white" />}
                    {idx === 3 && <Award className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </span>
                      {stat.trend && (
                        <span
                          className={`text-xs font-bold ${
                            stat.trend.startsWith('+') ? 'text-success glow-success' : 'text-destructive'
                          }`}
                        >
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-4xl font-bold tracking-tight glow-text mb-3">
                      {stat.value}
                    </div>
                    {stat.progress !== undefined && (
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-primary/20">
                        <div
                          className="h-full animated-gradient transition-all duration-500"
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Performer Card - PREMIUM ENHANCEMENT */}
          <div className="glass-card-premium p-8 rounded-xl shadow-lg border-gradient hover:scale-105 transition-all duration-300 hover-glow card-shimmer">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-gradient w-10 h-10 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-lg text-white">Top Performer</h4>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan-400 animate-pulse-glow" />
              <div>
                <p className="font-bold text-lg text-white">Sarah Kumar</p>
                <p className="text-sm text-muted-foreground">Level 8 • 4,892 XP</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Won 3 contests this week
            </p>
            <div className="pt-4 border-t border-primary/20 text-sm">
              <TrendingUp className="w-4 h-4 inline mr-2 text-primary" />
              You're in top{' '}
              <span className="font-bold text-primary glow-text">15%</span> of Level 6 members
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
