import { Flame, TrendingUp, Award } from "lucide-react";
import { LevelProgress } from "@/components/LevelProgress";
import { ContestCard } from "@/components/ContestCard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Mock data - will be replaced with real API calls
  const userData = {
    level: 6,
    currentXP: 2847,
    nextLevelXP: 4000,
    monthlyXP: [120, 230, 180, 290, 310, 260, 340],
    streak: 12,
  };

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
    { label: "Total Contests", value: "24", trend: "+3" },
    { label: "Win Rate", value: "31%", trend: "+5%" },
    { label: "Average Rank", value: "4.2", trend: "-0.3" },
    { label: "Badges Earned", value: "8/22", progress: 36 },
  ];

  return (
    <div className="min-h-screen p-8 space-y-10 animate-fade-in">
      {/* Hero Section - Redesigned with Glassmorphism */}
      <div className="glass-card-hero p-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left: Level Progress */}
          <div className="flex flex-col items-center gap-6">
            <LevelProgress
              currentLevel={userData.level}
              currentXP={userData.currentXP}
              nextLevelXP={userData.nextLevelXP}
              size="lg"
            />
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                XP Trend (7 Days)
              </div>
              <div className="flex gap-1 items-end justify-center h-12">
                {userData.monthlyXP.map((xp, i) => (
                  <div
                    key={i}
                    className="w-4 bg-gradient-to-t from-primary to-cyan-400 rounded-t"
                    style={{ height: `${(xp / 340) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: XP Stats */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Current XP
              </div>
              <div className="font-mono text-7xl font-bold glow-text tracking-tight">
                {userData.currentXP.toLocaleString()}
              </div>
              <div className="text-sm text-success glow-success mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">+340 this month</span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                To Next Level
              </div>
              <div className="font-mono text-3xl font-bold text-primary">
                {(userData.nextLevelXP - userData.currentXP).toLocaleString()} XP
              </div>
              <div className="mt-3 h-3 bg-black/50 rounded-full overflow-hidden border border-primary/20">
                <div
                  className="h-full animated-gradient transition-all duration-500"
                  style={{ width: `${(userData.currentXP / userData.nextLevelXP) * 100}%` }}
                />
              </div>
            </div>

            <div className="glass-card p-4 inline-flex items-center gap-3 animate-pulse-glow">
              <Flame className="w-6 h-6 text-warning" />
              <div>
                <div className="font-mono text-2xl font-bold">{userData.streak}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Day Streak
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Contests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Available Contests
            </h3>
            <Button variant="ghost" size="sm" className="hover-lift">
              View All →
            </Button>
          </div>
          <div className="space-y-4">
            {activeContests.map((contest, index) => (
              <div
                key={contest.id}
                className="animate-slide-in-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ContestCard {...contest} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed - Timeline Design */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Recent Activity
          </h3>
          <div className="glass-card p-8 relative">
            <div className="timeline-line" />
            <div className="space-y-6 relative pl-8">
              {activityFeed.map((activity, idx) => (
                <div
                  key={idx}
                  className="group hover-lift rounded-lg p-3 -ml-3 hover:bg-white/5 cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex gap-4 items-start">
                    <div className="timeline-dot absolute left-0 top-5" />
                    <div className="icon-gradient flex-shrink-0">
                      {activity.type === 'submit' && <Award className="w-4 h-4 text-white" />}
                      {activity.type === 'badge' && <Award className="w-4 h-4 text-white" />}
                      {activity.type === 'level' && <TrendingUp className="w-4 h-4 text-white" />}
                      {activity.type === 'social' && <Award className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1 opacity-60">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats - Enhanced with Icons */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Quick Stats
          </h3>
          <div className="space-y-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="glass-card-elevated p-6 hover-lift cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="icon-gradient">
                    {idx === 0 && <Award className="w-5 h-5 text-white" />}
                    {idx === 1 && <TrendingUp className="w-5 h-5 text-white" />}
                    {idx === 2 && <Award className="w-5 h-5 text-white" />}
                    {idx === 3 && <Award className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground opacity-60">
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
                    <div className="font-mono text-4xl font-bold tracking-tight glow-text">
                      {stat.value}
                    </div>
                    {stat.progress !== undefined && (
                      <div className="mt-3 h-2 bg-black/50 rounded-full overflow-hidden border border-primary/20">
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

          {/* Motivation Box - Enhanced */}
          <div className="glass-card-elevated p-8 gradient-border hover-lift">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-gradient">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-lg">Top Performer</h4>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan-400 animate-pulse-glow" />
              <div>
                <p className="font-bold text-lg">Sarah Kumar</p>
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
