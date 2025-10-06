import { TrendingUp, Trophy, Target, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MyProgress = () => {
  // Mock data
  const userData = {
    level: 6,
    currentXP: 2847,
    nextLevelXP: 4000,
    totalContests: 24,
    completedContests: 18,
    ongoingContests: 6,
    wins: 7,
    winRate: 31,
    monthlyXPGain: 340,
  };

  const levelHistory = [
    { level: 1, date: "Aug 1, 2024", xp: 0, days: 0 },
    { level: 2, date: "Aug 8, 2024", xp: 300, days: 7 },
    { level: 3, date: "Aug 20, 2024", xp: 600, days: 12 },
    { level: 4, date: "Sep 5, 2024", xp: 1000, days: 16 },
    { level: 5, date: "Sep 25, 2024", xp: 2000, days: 20 },
    { level: 6, date: "Oct 15, 2024", xp: 4000, days: 20 },
  ];

  const xpOverTime = [
    { month: "May", xp: 400 },
    { month: "Jun", xp: 850 },
    { month: "Jul", xp: 1200 },
    { month: "Aug", xp: 600 },
    { month: "Sep", xp: 2000 },
    { month: "Oct", xp: 2847 },
  ];

  const performanceByType = [
    { type: "Speed", avgRank: 3.2, contests: 6 },
    { type: "Quality", avgRank: 2.1, contests: 8 },
    { type: "Knowledge", avgRank: 4.5, contests: 5 },
    { type: "Team", avgRank: 3.8, contests: 3 },
    { type: "Community", avgRank: 5.2, contests: 2 },
  ];

  const winLossData = [
    { name: "Wins", value: 7, color: "hsl(var(--success))" },
    { name: "Top 3", value: 5, color: "hsl(var(--primary))" },
    { name: "Top 10", value: 8, color: "hsl(var(--warning))" },
    { name: "Participated", value: 4, color: "hsl(var(--muted))" },
  ];

  const pointsBreakdown = [
    { name: "Contest wins", value: 45, xp: 1280 },
    { name: "Participation", value: 25, xp: 712 },
    { name: "Badge bonuses", value: 15, xp: 427 },
    { name: "Daily activities", value: 10, xp: 285 },
    { name: "Multipliers", value: 5, xp: 143 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--accent))", "hsl(var(--muted))"];

  const recentActivities = [
    { text: "Submitted AI Automation Sprint", time: "2 hours ago", xp: 100 },
    { text: "Earned Speed Champion badge", time: "1 day ago", xp: 200 },
    { text: "Leveled up to Level 6", time: "3 days ago", xp: 500 },
    { text: "Won Friday Quality Challenge", time: "5 days ago", xp: 300 },
  ];

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
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
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <div className="font-mono text-3xl font-bold">{userData.currentXP} XP</div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{userData.monthlyXPGain} this month</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Contest Stats</span>
            <div className="font-mono text-3xl font-bold">{userData.totalContests}</div>
            <div className="text-sm text-muted-foreground">
              {userData.completedContests} completed, {userData.ongoingContests} ongoing
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(userData.completedContests / userData.totalContests) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">75% completion rate</div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <div className="font-mono text-3xl font-bold">{userData.winRate}%</div>
            <div className="text-sm text-muted-foreground">
              {userData.wins} wins out of {userData.totalContests}
            </div>
            <div className="flex items-center gap-2 text-success text-sm mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+5% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level History Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-6">Level History</h3>
        <div className="relative">
          <div className="flex justify-between items-center">
            {levelHistory.map((level, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 relative group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    level.level <= userData.level
                      ? "bg-success border-success"
                      : "bg-muted border-muted"
                  }`}
                >
                  <span className="font-bold">{level.level}</span>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-bold">Level {level.level}</div>
                  <div className="text-xs text-muted-foreground">{level.xp} XP</div>
                </div>
                <div className="absolute top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-lg p-3 z-10 whitespace-nowrap">
                  <div className="text-xs font-semibold">{level.date}</div>
                  <div className="text-xs text-muted-foreground">{level.days} days from previous</div>
                </div>
                {idx < levelHistory.length - 1 && (
                  <div
                    className={`absolute top-6 left-12 h-0.5 ${
                      level.level < userData.level ? "bg-success" : "bg-muted"
                    }`}
                    style={{ width: "calc(100% + 2rem)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contest Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Win/Loss Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {winLossData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Performance by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="avgRank" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-muted-foreground mt-2 text-center">Lower rank is better</div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">XP Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={xpOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Points Breakdown and Badge Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Points Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pointsBreakdown} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pointsBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {pointsBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono">{item.xp} XP ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Badge Collection Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">8 of 22 badges earned</span>
                <span className="text-muted-foreground">36%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: "36%" }} />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Achievement", current: 2, total: 4 },
                { name: "Consistency", current: 3, total: 4 },
                { name: "Community", current: 1, total: 5 },
                { name: "Course", current: 2, total: 6 },
                { name: "LEAP", current: 0, total: 2 },
              ].map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {cat.current}/{cat.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(cat.current / cat.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-6">Monthly Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">This Month</h4>
            {[
              { label: "XP Earned", value: "847" },
              { label: "Contests", value: "8" },
              { label: "Badges", value: "2" },
              { label: "Average Rank", value: "4.1" },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-mono text-xl font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Last Month</h4>
            {[
              { label: "XP Earned", value: "693", change: "+22%", up: true },
              { label: "Contests", value: "6", change: "+33%", up: true },
              { label: "Badges", value: "1", change: "+100%", up: true },
              { label: "Average Rank", value: "5.3", change: "-23%", up: true },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl">{stat.value}</span>
                  <span className={`text-xs font-semibold ${stat.up ? "text-success" : "text-destructive"}`}>
                    {stat.change} {stat.up ? "↑" : "↓"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Insights & Predictions
        </h3>
        <div className="space-y-3">
          <p className="text-sm">📈 At your current pace, you'll reach Level 7 in <span className="font-bold text-primary">12 days</span></p>
          <p className="text-sm">🎯 Your best contest type: <span className="font-bold text-primary">Quality Challenges</span> (Avg rank: 2.3)</p>
          <p className="text-sm">🎖️ You need <span className="font-bold text-primary">2 more Achievement badges</span> to qualify for LEAP</p>
          <p className="text-sm">📅 Most active day: <span className="font-bold text-primary">Friday</span> (5 contests)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
              <div className="font-mono text-sm text-primary">+{activity.xp} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProgress;
