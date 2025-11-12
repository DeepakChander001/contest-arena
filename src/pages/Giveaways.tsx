import { useState } from "react";
import { Gift, Trophy, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Giveaways = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const carouselPrizes = [
    {
      id: 1,
      name: "Runway Gen-3",
      category: "AI Video",
      value: 95,
      duration: "3 months",
      description: "Professional AI video generation tool with advanced features",
      howToWin: "LEAP Winners",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop",
    },
    {
      id: 2,
      name: "Claude Pro",
      category: "AI Assistant",
      value: 20,
      duration: "2 months",
      description: "Advanced AI assistant for coding, writing, and analysis",
      howToWin: "Top 3 Quality Challenges",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    },
    {
      id: 3,
      name: "MidJourney",
      category: "AI Images",
      value: 30,
      duration: "2 months",
      description: "Create stunning AI-generated images and artwork",
      howToWin: "Creative Contest Winners",
      image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=450&fit=crop",
    },
  ];

  const allPrizes = [
    {
      id: 1,
      name: "Runway Gen-3",
      category: "AI Video",
      value: 95,
      duration: "3 months",
      description: "Professional AI video generation with Gen-3 Alpha technology",
      howToWin: ["LEAP Winners", "Top 10 Monthly"],
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop",
    },
    {
      id: 2,
      name: "Claude Pro",
      category: "AI Assistant",
      value: 20,
      duration: "2 months",
      description: "Advanced AI assistant with extended context and priority access",
      howToWin: ["Top 3 Quality Challenges", "Consistency Badge Earners"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    },
    {
      id: 3,
      name: "MidJourney",
      category: "AI Images",
      value: 30,
      duration: "2 months",
      description: "Create stunning AI-generated images and artwork",
      howToWin: ["Creative Contest Winners"],
      image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=225&fit=crop",
    },
    {
      id: 4,
      name: "Notion AI",
      category: "Productivity",
      value: 10,
      duration: "3 months",
      description: "AI-powered workspace for notes, docs, and project management",
      howToWin: ["Consistency Badge Earners", "Team Challenge Winners"],
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=225&fit=crop",
    },
    {
      id: 5,
      name: "Zapier Premium",
      category: "Automation",
      value: 60,
      duration: "1 month",
      description: "Connect apps and automate workflows with premium features",
      howToWin: ["Automation Master Badge"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    },
    {
      id: 6,
      name: "Make.com Pro",
      category: "Automation",
      value: 29,
      duration: "2 months",
      description: "Visual automation platform for complex workflows",
      howToWin: ["Speed Contest Winners", "Level 6+ Achievement"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    },
    {
      id: 7,
      name: "Cursor Pro",
      category: "Development",
      value: 20,
      duration: "2 months",
      description: "AI-powered code editor built for productivity",
      howToWin: ["Code Challenge Winners"],
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop",
    },
    {
      id: 8,
      name: "Perplexity Pro",
      category: "AI Assistant",
      value: 20,
      duration: "2 months",
      description: "Advanced AI search and research assistant",
      howToWin: ["Research Challenge Winners", "Knowledge Badge Earners"],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=225&fit=crop",
    },
    {
      id: 9,
      name: "EMI Pause Reward",
      category: "Premium Perk",
      value: 999,
      duration: "1 month",
      description: "1 month payment pause on your course enrollment",
      howToWin: ["LEAP Winners", "Monthly Top Performers"],
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=225&fit=crop",
    },
  ];

  const pastWinners = [
    { username: "@sarah_ai", prize: "Runway Gen-3", duration: "3 months", date: "Oct 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" },
    { username: "@tech_guru", prize: "Claude Pro", duration: "2 months", date: "Oct 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech" },
    { username: "@priya.dev", prize: "MidJourney", duration: "2 months", date: "Oct 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya" },
    { username: "@alex_codes", prize: "EMI Pause", duration: "1 month", date: "Oct 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex" },
    { username: "@maya.design", prize: "Notion AI", duration: "3 months", date: "Sep 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya" },
    { username: "@rahul_ai", prize: "Zapier Premium", duration: "1 month", date: "Sep 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul" },
    { username: "@jen.builds", prize: "Runway Gen-3", duration: "3 months", date: "Sep 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jen" },
    { username: "@khan.tech", prize: "Claude Pro", duration: "2 months", date: "Sep 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khan" },
  ];

  const categories = ["all", "AI Video", "AI Assistant", "Automation", "Productivity", "Development", "Premium Perk"];

  const filteredPrizes = selectedCategory === "all" 
    ? allPrizes 
    : allPrizes.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-card-premium p-8 text-center hover-glow card-shimmer">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">What You Can Win</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-2">Real AI tools and premium perks for top performers</p>
        <div className="text-3xl font-bold text-primary mt-4">Over $12,000 in prizes monthly</div>
      </div>

      {/* Carousel - Featured Prizes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Featured Prizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {carouselPrizes.map((prize) => (
            <div key={prize.id} className="glass-card-premium overflow-hidden group hover:scale-105 transition-all duration-300 hover-glow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-white">{prize.category}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{prize.name}</h3>
                <div className="text-2xl font-bold text-primary mb-2">${prize.value}/mo value</div>
                <p className="text-sm text-muted-foreground mb-4">{prize.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span>{prize.duration} premium access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{prize.howToWin}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Contest <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card-premium p-4 hover-glow">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* All Prizes Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Available Prizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrizes.map((prize) => (
            <div key={prize.id} className="glass-card-premium overflow-hidden hover:scale-105 transition-all duration-300 hover-glow">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{prize.category}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1">{prize.name}</h3>
                <div className="text-lg font-bold text-primary mb-2">${prize.value}/month value</div>
                <p className="text-xs text-muted-foreground mb-3">{prize.description}</p>
                <div className="mb-3">
                  <div className="text-xs font-semibold mb-1">How to win:</div>
                  {prize.howToWin.map((method, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {method}
                    </div>
                  ))}
                </div>
                <Button className="w-full" size="sm">How to Win</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Calculator */}
      <div className="glass-card-premium p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover-glow">
        <h3 className="text-xl font-bold mb-4">💎 If you win LEAP Challenge this month:</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked readOnly className="w-4 h-4" />
            <span className="text-sm">Runway Gen-3: <span className="font-bold text-primary">$285 value</span></span>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked readOnly className="w-4 h-4" />
            <span className="text-sm">EMI Pause: <span className="font-bold text-primary">$999 value</span></span>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked readOnly className="w-4 h-4" />
            <span className="text-sm">Claude Pro: <span className="font-bold text-primary">$40 value</span></span>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <div className="text-2xl font-bold text-primary">Total: $1,324 in prizes</div>
          </div>
          <Button className="w-full mt-4">Qualify for LEAP</Button>
        </div>
      </div>

      {/* Past Winners */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Prize Winners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pastWinners.map((winner, idx) => (
            <div key={idx} className="glass-card-premium p-4 text-center hover-glow">
              <img 
                src={winner.avatar} 
                alt={winner.username}
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary"
              />
              <div className="font-semibold">{winner.username}</div>
              <div className="text-sm text-primary my-1">{winner.prize}</div>
              <div className="text-xs text-muted-foreground">{winner.duration}</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                {winner.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Giveaways;
