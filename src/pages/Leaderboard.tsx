import { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  levelName: string;
  totalXP: number;
  badges: number;
  contestsWon: number;
  trend: string;
  change: number;
  isCurrentUser: boolean;
}

interface CurrentUserPosition {
  rank: number;
  totalXP: number;
  level: number;
  badges: number;
  gapToNext: number | null;
  nextUser: { username: string; totalXP: number } | null;
  percentile: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  currentUserPosition: CurrentUserPosition | null;
  totalUsers: number;
  filter: string;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>("global");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (filter: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com';
      const response = await fetch(`${apiUrl}/api/leaderboard?filter=${filter}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch leaderboard' }));
        throw new Error(errorData.error || errorData.message || 'Failed to fetch leaderboard');
      }

      const data: LeaderboardData = await response.json();
      setLeaderboardData(data);
      console.log('✅ Leaderboard data loaded:', data);
    } catch (err: any) {
      console.error('❌ Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaderboard(activeFilter);
    }
  }, [activeFilter, user]);

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "border-l-4 border-l-[#FFD700]";
    if (rank === 2) return "border-l-4 border-l-[#C0C0C0]";
    if (rank === 3) return "border-l-4 border-l-[#CD7F32]";
    return "";
  };

  const TrendIcon = ({ trend, change }: { trend: string; change: number }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'global': return 'Global';
      case 'month': return 'This Month';
      case 'week': return 'This Week';
      case 'level': return 'By My Level';
      default: return 'Global';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view the leaderboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-6 animate-fade-in">
      {/* Header - PREMIUM ENHANCEMENT */}
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">Leaderboard</h1>
        <p className="text-muted-foreground">See where you rank among the best</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="level">By My Level</TabsTrigger>
        </TabsList>

        {/* Shared Content Area */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="glass-card-premium p-6 text-center hover-glow">
              <p className="text-destructive">{error}</p>
              <button
                onClick={() => fetchLeaderboard(activeFilter)}
                className="mt-4 px-4 py-2 btn-premium text-primary-foreground rounded-md"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Your Position Card - PREMIUM ENHANCEMENT */}
              {leaderboardData?.currentUserPosition && (
                <div className="glass-card-premium p-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/20 mb-6 hover-glow card-shimmer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-5xl font-bold font-mono text-primary">
                          #{leaderboardData.currentUserPosition.rank}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Your {getFilterLabel(activeFilter)} Rank
                        </div>
                      </div>
                      <div className="h-16 w-px bg-border" />
                      {leaderboardData.currentUserPosition.gapToNext !== null && 
                       leaderboardData.currentUserPosition.nextUser && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Gap to #{leaderboardData.currentUserPosition.rank - 1}
                          </div>
                          <div className="font-mono text-xl font-bold">
                            {leaderboardData.currentUserPosition.gapToNext.toLocaleString()} XP
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{leaderboardData.currentUserPosition.nextUser.username}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold">
                          Top {100 - leaderboardData.currentUserPosition.percentile}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {leaderboardData.totalUsers} members
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Table - PREMIUM ENHANCEMENT */}
              {leaderboardData && leaderboardData.leaderboard.length > 0 ? (
                <div className="glass-card-premium overflow-hidden hover-glow">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total XP
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Badges
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Trend
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Wins
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {leaderboardData.leaderboard.map((entry) => (
                          <tr
                            key={entry.userId}
                            className={`
                              ${getRankColor(entry.rank)}
                              ${entry.isCurrentUser ? 'bg-primary/5 glow-accent' : 'hover:bg-muted/30'}
                              transition-all duration-300
                            `}
                          >
                            <td className="px-6 py-4">
                              <div className="font-mono text-lg font-bold">#{entry.rank}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {entry.avatarUrl ? (
                                  <img
                                    src={entry.avatarUrl}
                                    alt={entry.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                                    {entry.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className={entry.isCurrentUser ? "font-semibold text-primary" : ""}>
                                  {entry.username}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="font-mono">
                                L{entry.level}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-semibold">{entry.totalXP.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono">{entry.badges}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <TrendIcon trend={entry.trend} change={entry.change} />
                                {entry.change > 0 && <span className="text-sm">{entry.change}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-semibold text-primary">{entry.contestsWon}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="glass-card-premium p-12 text-center hover-glow">
                  <p className="text-muted-foreground">No leaderboard data available yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start earning XP to appear on the leaderboard!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
