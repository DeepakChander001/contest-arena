import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Trophy,
  Target,
  Award,
  Zap,
  DollarSign,
  Briefcase,
  Flame,
  Calendar,
  BarChart3,
  Users,
  Megaphone,
  Lightbulb,
  GraduationCap,
  Crown,
  Book,
  Star,
  Ticket,
  User,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ members: 0, contests: 0, qualified: 0, prizes: 0 });

  useEffect(() => {
    // Animate counters
    const targets = { members: 1247, contests: 73, qualified: 18, prizes: 12400 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        members: Math.floor(targets.members * progress),
        contests: Math.floor(targets.contests * progress),
        qualified: Math.floor(targets.qualified * progress),
        prizes: Math.floor(targets.prizes * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-glow-pulse" />
        
        <div className="container max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Side - 60% */}
            <div className="lg:col-span-3 space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <Zap className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">10X CONTEST ARENA</h2>
                </div>
                <p className="text-xl text-muted-foreground">Compete. Level Up. Win Rewards.</p>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Transform Learning into Earning
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Join 1,000+ students competing in weekly contests, earning badges, and winning real AI tool access. 
                No freelancing profiles. No bidding wars. Just pure skill recognition.
              </p>

              {/* Animated Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="glass-card border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-mono font-bold text-primary">4</div>
                    <div className="text-xs text-muted-foreground mt-1">contests weekly</div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-mono font-bold text-primary">22+</div>
                    <div className="text-xs text-muted-foreground mt-1">badges to collect</div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-mono font-bold text-primary">$200+</div>
                    <div className="text-xs text-muted-foreground mt-1">prizes monthly</div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full sm:w-auto h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 glow-accent"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Login with Circle
                </Button>
                <p className="text-xs text-muted-foreground">
                  Secure authentication via your Circle account
                </p>
              </div>
            </div>

            {/* Right Side - 40% */}
            <div className="lg:col-span-2 relative">
              <div className="glass-card p-6 space-y-4 animate-float">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Top Performers</h3>
                  <Badge variant="secondary">Live</Badge>
                </div>
                {[
                  { name: "Sarah M.", level: 9, xp: 48234, trend: "+234" },
                  { name: "Alex K.", level: 8, xp: 15890, trend: "+189" },
                  { name: "Jordan P.", level: 7, xp: 9450, trend: "+156" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">Level {user.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{user.xp.toLocaleString()} XP</div>
                      <div className="text-xs text-success">{user.trend} today</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Your Journey to Success</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                icon: Trophy,
                title: "Take Entry Quiz",
                desc: "Pass a 20-question quiz (70% required). Unlimited attempts. Gain access to 10X Hustlers group.",
              },
              {
                num: "02",
                icon: Target,
                title: "Join Weekly Contests",
                desc: "Compete in 4 contests every week: Speed, Quality, Knowledge, Community. Earn points, climb levels.",
              },
              {
                num: "03",
                icon: Award,
                title: "Collect Badges",
                desc: "Earn 22+ badges across 5 categories. Unlock new contests. Build your achievement profile.",
              },
              {
                num: "04",
                icon: Zap,
                title: "Qualify for LEAP",
                desc: "Reach Level 4+, collect required badges. Compete monthly for the biggest rewards. Top 20-30% qualify.",
              },
            ].map((step, i) => (
              <Card key={i} className="glass-card hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-4xl font-bold text-primary/20 font-mono">{step.num}</span>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{step.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT YOU'LL WIN */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Real Rewards for Real Skills</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card hover:scale-105 transition-transform glow-accent">
              <CardHeader>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">Premium AI Tools</CardTitle>
                <Badge variant="secondary" className="mx-auto">LEAP Winners</Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">3-month access to $99/mo AI tools</p>
                <p className="text-xs text-muted-foreground mt-2">Runway, Claude, MidJourney & more</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:scale-105 transition-transform glow-accent">
              <CardHeader>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">EMI Pause Rewards</CardTitle>
                <Badge variant="secondary" className="mx-auto">Top Performers</Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">1 month payment pause on your course enrollment</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:scale-105 transition-transform glow-accent">
              <CardHeader>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">Exclusive Opportunities</CardTitle>
                <Badge variant="secondary" className="mx-auto">Elite Members</Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Join 10X team at Level 7+. Paid collaboration opportunities.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: LEVEL SYSTEM */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">9 Levels. Endless Opportunities.</h2>
          <p className="text-center text-muted-foreground mb-16">Points reset monthly. Badges stay forever.</p>
          
          <div className="grid sm:grid-cols-3 lg:grid-cols-9 gap-4 max-w-6xl mx-auto">
            {[
              { level: 1, xp: "0", unlock: "Starting Point" },
              { level: 2, xp: "300", unlock: "Contest Access" },
              { level: 3, xp: "600", unlock: "Mid-tier Rewards" },
              { level: 4, xp: "1K", unlock: "LEAP Eligible", highlight: true },
              { level: 5, xp: "2K", unlock: "Premium Contests" },
              { level: 6, xp: "4K", unlock: "Expert Path", highlight: true },
              { level: 7, xp: "8K", unlock: "Inner Circle" },
              { level: 8, xp: "12K", unlock: "Course Creation" },
              { level: 9, xp: "50K", unlock: "Elite Status", highlight: true },
            ].map((lvl) => (
              <Card 
                key={lvl.level} 
                className={`glass-card text-center p-4 ${lvl.highlight ? 'border-primary glow-accent' : ''}`}
              >
                <div className={`text-2xl font-bold mb-1 ${lvl.highlight ? 'text-primary' : ''}`}>
                  L{lvl.level}
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{lvl.xp} XP</div>
                <div className="text-xs leading-tight">{lvl.unlock}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: BADGE CATEGORIES */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">22+ Badges to Collect</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Achievement",
                icons: [Trophy, Zap, Star, Award],
                desc: "Performance-based recognition",
                count: "4 badges",
              },
              {
                title: "Consistency",
                icons: [Flame, Calendar, Zap, BarChart3],
                desc: "Sustained engagement rewards",
                count: "4 badges",
              },
              {
                title: "Community",
                icons: [Users, Megaphone, Lightbulb, GraduationCap, Crown],
                desc: "Help others, build together",
                count: "5 badges",
              },
              {
                title: "Course Master",
                icons: [Book, Star],
                desc: "Master every course we offer",
                count: "2 per course",
              },
              {
                title: "LEAP Elite",
                icons: [Ticket, Trophy],
                desc: "Ultimate achievement status",
                count: "2 exclusive",
              },
            ].map((category, i) => (
              <Card key={i} className="glass-card hover:scale-105 transition-transform">
                <CardHeader>
                  <CardTitle className="text-lg mb-4">{category.title}</CardTitle>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {category.icons.map((Icon, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{category.desc}</p>
                  <Badge variant="outline" className="text-xs">{category.count}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: MONTHLY LEAP */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold mb-2">The LEAP Challenge</h2>
                <p className="text-muted-foreground">Last weekend of every month</p>
              </div>
              
              <p className="text-lg leading-relaxed">
                3-day elite competition. Day 1: Individual skills. Day 2: Team hackathon. 
                Day 3: Finals & voting. Only the dedicated qualify.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold">Requirements:</h3>
                {[
                  "3+ Consistency badges",
                  "2+ Achievement badges",
                  "1+ Community badge",
                  "1+ Course Master badge",
                  "Level 4+ status",
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {req}
                  </div>
                ))}
              </div>
            </div>

            <Card className="glass-card p-8 text-center glow-accent">
              <Trophy className="w-24 h-24 text-primary mx-auto mb-6" />
              <div className="text-5xl font-bold mb-4">20-30%</div>
              <p className="text-muted-foreground mb-6">Qualify monthly</p>
              <div className="space-y-2 text-sm">
                <p>Win EMI pauses, tool access, permanent recognition</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 7: LIVE STATS */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: counts.members.toLocaleString(), label: "Active Members" },
              { value: counts.contests, label: "Contests This Month" },
              { value: counts.qualified, label: "LEAP Qualified" },
              { value: `$${counts.prizes.toLocaleString()}`, label: "Prizes Awarded" },
            ].map((stat, i) => (
              <Card key={i} className="glass-card text-center p-6">
                <div className="text-4xl font-mono font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: COMPARISON */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Not Just Another Learning Platform</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl">Other Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Learn in isolation",
                  "No recognition system",
                  "Certificates nobody values",
                  "No earning opportunities",
                  "Boring, passive",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-primary glow-accent">
              <CardHeader>
                <CardTitle className="text-xl">10X Contest Arena</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Compete with peers",
                  "22+ achievement badges",
                  "Real prizes & opportunities",
                  "Path to paid roles",
                  "Addictive, engaging",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 9: PERSONAS */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Who This Is For</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: User,
                title: "The Learner",
                quote: "I want my progress recognized",
                benefit: "Badges prove your skills publicly",
              },
              {
                icon: Trophy,
                title: "The Competitor",
                quote: "I thrive on challenges",
                benefit: "Weekly contests keep you sharp",
              },
              {
                icon: DollarSign,
                title: "The Earner",
                quote: "I want real opportunities",
                benefit: "Level 7+ opens paid collaboration",
              },
            ].map((persona, i) => (
              <Card key={i} className="glass-card hover:scale-105 transition-transform text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <persona.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{persona.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">"{persona.quote}"</p>
                  <p className="text-sm">{persona.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Common Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "Do I need to be enrolled in a course?",
                a: "Yes, Contest Arena is for active 10X course members.",
              },
              {
                q: "What if I'm a beginner?",
                a: "Everyone starts at Level 1. Early contests are beginner-friendly.",
              },
              {
                q: "How much time does this take?",
                a: "Contests range from 30 minutes to multi-day. Participate as much as you want.",
              },
              {
                q: "Are rewards really free?",
                a: "Yes. All prizes are earned through performance, not payment.",
              },
              {
                q: "What happens if I don't win?",
                a: "Every participation earns XP. You level up by showing up consistently.",
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* SECTION 11: FINAL CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold">Ready to Compete?</h2>
          <p className="text-xl text-muted-foreground">Join the arena where learning meets earning</p>
          
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              size="lg"
              className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 glow-accent"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Login with Circle
            </Button>
            <p className="text-sm text-muted-foreground">Takes 10 seconds. No credit card needed.</p>
            <p className="text-xs text-muted-foreground">Must be an active 10X course member</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">10X Contest Arena</h3>
              </div>
              <p className="text-sm text-muted-foreground">Where skills meet rewards</p>
            </div>
            
            <div className="text-left md:text-right space-y-2">
              <div className="flex flex-wrap gap-4 justify-start md:justify-end text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Support</a>
              </div>
              <p className="text-xs text-muted-foreground">© 2025 10X. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
