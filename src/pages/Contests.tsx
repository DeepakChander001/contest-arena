import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { ContestCard } from "@/components/ContestCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Contests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  const contests = [
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
    },
    {
      id: "4",
      title: "Team Hackathon: Build AI SaaS",
      type: "TEAM" as const,
      duration: "6 hours",
      deadline: "2d 8h",
      points: 1000,
      participants: 16,
      levelRequired: 6,
      isEligible: true,
    },
    {
      id: "5",
      title: "Perfect Code Quality Challenge",
      type: "QUALITY" as const,
      duration: "3 days",
      deadline: "5d 14h",
      points: 600,
      participants: 38,
      levelRequired: 5,
      isEligible: true,
    },
    {
      id: "6",
      title: "Lightning Round: Bug Hunt",
      type: "SPEED" as const,
      duration: "1 hour",
      deadline: "6h 30m",
      points: 200,
      participants: 145,
      levelRequired: 3,
      isEligible: true,
    },
  ];

  const filteredContests = contests.filter(contest => {
    if (activeTab === "available" && !contest.isEligible) return false;
    if (activeTab === "locked" && contest.isEligible) return false;
    if (searchQuery) {
      return contest.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Contest Hub</h1>
        <p className="text-muted-foreground">Compete, win, and level up your skills</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="available">Available to You</TabsTrigger>
              <TabsTrigger value="all">All Contests</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContests.map((contest) => (
          <ContestCard key={contest.id} {...contest} />
        ))}
      </div>

      {filteredContests.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No contests found</p>
          <Button onClick={() => setSearchQuery("")}>Clear filters</Button>
        </div>
      )}
    </div>
  );
};

export default Contests;
