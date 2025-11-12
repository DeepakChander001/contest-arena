import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Check,
  X,
  TrendingUp,
  Sparkles,
  Rocket,
  Shield,
  Clock,
  Medal,
  Gift,
  PlayCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import initScrollReveal from "@/utils/scrollReveal";

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithGoogle } = useAuth();
  const [counts, setCounts] = useState({ members: 0, contests: 0, qualified: 0, prizes: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Animated counters
  useEffect(() => {
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

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Ensure scroll reveal initializes and reveals elements in viewport
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initScrollReveal();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* ============================================
          SECTION 1: HERO - Premium Animated Background
          ============================================ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 pt-32"
      >
        {/* Animated Gradient Background with Parallax */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14, 165, 233, 0.15) 0%, transparent 50%)`,
            transition: 'background 0.3s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(14,165,233,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="container max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content - IMMEDIATELY VISIBLE */}
            <div className="space-y-8 stagger-hero" style={{ opacity: 1, transform: 'none' }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-hero-text-reveal">
                <Sparkles className="w-4 h-4 text-primary animate-icon-bounce" />
                <span className="text-sm font-semibold text-primary">Welcome to the Future of Learning</span>
              </div>

              {/* Main Title with Gradient - FIXED: White text with gradient overlay */}
              <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-hero-text-reveal" style={{ color: '#FFFFFF' }}>
                <span className="gradient-text">1to10x Contest Arena</span>
              </h1>

              {/* Tagline - FIXED: Light gray text for visibility */}
              <p className="text-xl md:text-2xl max-w-2xl leading-relaxed animate-hero-text-reveal" style={{ color: '#E0E0E0' }}>
                Transform Learning into <span className="gradient-text font-semibold">Earning</span>. 
                Compete. Level Up. Win Real Rewards.
              </p>

              {/* Description - FIXED: Light gray text for visibility */}
              <p className="text-lg max-w-2xl leading-relaxed animate-hero-text-reveal" style={{ color: '#D0D0D0' }}>
                Join thousands of students competing in weekly contests, earning badges, and winning 
                premium AI tool access. No freelancing profiles. No bidding wars. Just pure skill recognition.
              </p>

              {/* Quick Stats - FIXED: Visible cards with white text */}
              <div className="grid grid-cols-3 gap-4 animate-hero-text-reveal">
                <Card className="glass-card-premium border-primary/20 hover-glow text-center p-4" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                  <div className="text-3xl font-mono font-bold gradient-text animate-number-roll">4</div>
                  <div className="text-xs mt-1" style={{ color: '#B0B0B0' }}>Weekly Contests</div>
                </Card>
                <Card className="glass-card-premium border-primary/20 hover-glow text-center p-4" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                  <div className="text-3xl font-mono font-bold gradient-text animate-number-roll">22+</div>
                  <div className="text-xs mt-1" style={{ color: '#B0B0B0' }}>Badges to Collect</div>
                </Card>
                <Card className="glass-card-premium border-primary/20 hover-glow text-center p-4" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                  <div className="text-3xl font-mono font-bold gradient-text animate-number-roll">$200+</div>
                  <div className="text-xs mt-1" style={{ color: '#B0B0B0' }}>Monthly Prizes</div>
                </Card>
              </div>

              {/* CTA Buttons - FIXED: Visible buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-hero-text-reveal">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard"
                      className="btn-premium inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-full hover-glow"
                    >
                      Enter Arena
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Button
                      variant="outline"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-full border-primary/30 hover:border-primary/50"
                      onClick={() => navigate('/leaderboard')}
                    >
                      <Trophy className="w-5 h-5" />
                      View Leaderboard
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={loginWithGoogle}
                      className="btn-premium inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-full hover-glow animate-cta-magnetic"
                    >
                      <Rocket className="w-5 h-5" />
                      Join the Arena
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <Button
                      variant="outline"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-full border-primary/30 hover:border-primary/50"
                      onClick={() => navigate('/leaderboard')}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Explore First
                    </Button>
                  </>
                )}
              </div>

              {/* Trust Indicators - FIXED: Visible text */}
              <div className="flex items-center gap-6 text-sm animate-hero-text-reveal" style={{ color: '#C0C0C0' }}>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Real Rewards</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Showcase - FIXED: Visible card */}
            <div className="relative lg:col-span-1" style={{ opacity: 1, transform: 'none' }}>
              <div className="glass-card-premium p-8 space-y-6 animate-hero-morph hover-glow card-shimmer" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg gradient-text">Your Profile</h3>
                      <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-primary/10">
                      {user?.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 animate-pulse-glow"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-2xl border-2 border-primary/30">
                          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-lg gradient-text">{user?.name}</div>
                        <div className="text-sm" style={{ color: '#B0B0B0' }}>Level {user?.level || 1}</div>
                        <div className="font-mono text-sm gradient-text">{user?.currentXP?.toLocaleString() || 0} XP</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#B0B0B0' }}>Badges</div>
                        <div className="font-semibold gradient-text">{user?.badges?.length || 0}/22</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg gradient-text">Top Performers</h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        Live
                      </Badge>
                    </div>
                    {[
                      { name: "Sarah M.", level: 9, xp: 48234, trend: "+234", rank: 1 },
                      { name: "Alex K.", level: 8, xp: 15890, trend: "+189", rank: 2 },
                      { name: "Jordan P.", level: 7, xp: 9450, trend: "+156", rank: 3 },
                    ].map((user, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/10 hover:bg-background/70 hover:border-primary/20 transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold border border-primary/30">
                          #{user.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium gradient-text">{user.name}</div>
                          <div className="text-xs" style={{ color: '#B0B0B0' }}>Level {user.level}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm gradient-text">{user.xp.toLocaleString()} XP</div>
                          <div className="text-xs text-success flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {user.trend} today
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 2: ABOUT / MISSION - Glowing Reveal
          ============================================ */}
      <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 scroll-reveal">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                Our Mission
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold gradient-text" style={{ color: '#FFFFFF' }}>
                Where Skills Meet Rewards
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#E0E0E0' }}>
                The <span className="gradient-text font-semibold">1to10x Contest Arena</span> is a revolutionary 
                platform that transforms passive learning into active competition. We believe that recognition 
                and rewards should be based on skill, not connections.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: '#E0E0E0' }}>
                Every contest, every badge, every level-up is a step toward real opportunities: premium AI tools, 
                course benefits, and even paid collaboration roles. This isn't just gamification—it's your 
                pathway to professional growth.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium" style={{ color: '#D0D0D0' }}>100% Skill-Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium" style={{ color: '#D0D0D0' }}>Real Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium" style={{ color: '#D0D0D0' }}>Community Driven</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 scroll-reveal">
              <Card className="glass-card-premium hover-glow p-6 text-center border-primary/20" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                <Target className="w-12 h-12 text-primary mx-auto mb-4 animate-icon-bounce" />
                <div className="text-3xl font-bold gradient-text mb-2">9</div>
                <div className="text-sm" style={{ color: '#B0B0B0' }}>Levels to Master</div>
              </Card>
              <Card className="glass-card-premium hover-glow p-6 text-center border-primary/20" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                <Award className="w-12 h-12 text-primary mx-auto mb-4 animate-icon-bounce" />
                <div className="text-3xl font-bold gradient-text mb-2">22+</div>
                <div className="text-sm" style={{ color: '#B0B0B0' }}>Achievement Badges</div>
              </Card>
              <Card className="glass-card-premium hover-glow p-6 text-center border-primary/20" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4 animate-icon-bounce" />
                <div className="text-3xl font-bold gradient-text mb-2">4</div>
                <div className="text-sm" style={{ color: '#B0B0B0' }}>Weekly Contests</div>
              </Card>
              <Card className="glass-card-premium hover-glow p-6 text-center border-primary/20" style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}>
                <Gift className="w-12 h-12 text-primary mx-auto mb-4 animate-icon-bounce" />
                <div className="text-3xl font-bold gradient-text mb-2">∞</div>
                <div className="text-sm" style={{ color: '#B0B0B0' }}>Opportunities</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: FEATURES / HIGHLIGHTS - Hover Cards
          ============================================ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4" style={{ color: '#FFFFFF' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#E0E0E0' }}>
              Powerful features designed to make your learning journey competitive, rewarding, and fun.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-cards">
            {[
              {
                icon: BarChart3,
                title: "Live Leaderboards",
                description: "Real-time rankings that update as you compete. See where you stand and track your progress against peers.",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: Zap,
                title: "Smart Scoring",
                description: "AI-powered evaluation system that fairly assesses your work based on quality, speed, and creativity.",
                color: "from-blue-500 to-purple-500",
              },
              {
                icon: Trophy,
                title: "Achievement System",
                description: "Earn 22+ badges across 5 categories. Each badge unlocks new opportunities and showcases your expertise.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Target,
                title: "Weekly Contests",
                description: "Four unique contest types every week: Speed, Quality, Knowledge, and Community challenges.",
                color: "from-pink-500 to-red-500",
              },
              {
                icon: Crown,
                title: "LEAP Challenge",
                description: "Monthly elite competition for top performers. Win premium rewards and exclusive opportunities.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: Rocket,
                title: "Career Pathways",
                description: "Level 7+ unlocks paid collaboration opportunities. Turn your skills into real income.",
                color: "from-orange-500 to-yellow-500",
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="glass-card-premium hover-glow border-primary/20 group cursor-pointer transition-all duration-300 hover:scale-105 scroll-reveal"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl gradient-text" style={{ color: '#FFFFFF' }}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: '#D0D0D0' }}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: HOW IT WORKS - Step-by-Step
          ============================================ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Your Journey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4" style={{ color: '#FFFFFF' }}>
              How It Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#E0E0E0' }}>
              Four simple steps to start competing and winning rewards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-cards">
            {[
              {
                num: "01",
                icon: Target,
                title: "Take Entry Quiz",
                desc: "Pass a 20-question quiz (70% required). Unlimited attempts. Gain access to 10X Hustlers group.",
                color: "from-cyan-500 to-blue-500",
              },
              {
                num: "02",
                icon: Zap,
                title: "Join Weekly Contests",
                desc: "Compete in 4 contests every week: Speed, Quality, Knowledge, Community. Earn points, climb levels.",
                color: "from-blue-500 to-purple-500",
              },
              {
                num: "03",
                icon: Award,
                title: "Collect Badges",
                desc: "Earn 22+ badges across 5 categories. Unlock new contests. Build your achievement profile.",
                color: "from-purple-500 to-pink-500",
              },
              {
                num: "04",
                icon: Rocket,
                title: "Qualify for LEAP",
                desc: "Reach Level 4+, collect required badges. Compete monthly for the biggest rewards. Top 20-30% qualify.",
                color: "from-pink-500 to-red-500",
              },
            ].map((step, i) => (
              <Card 
                key={i} 
                className="glass-card-premium hover-glow border-primary/20 group relative overflow-hidden scroll-reveal"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-5xl font-bold text-primary/10 font-mono">{step.num}</span>
                  </div>
                  <CardTitle className="text-xl gradient-text" style={{ color: '#FFFFFF' }}>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="leading-relaxed" style={{ color: '#D0D0D0' }}>{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: REWARDS SHOWCASE - Floating Cards
          ============================================ */}
      <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Real Rewards
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4" style={{ color: '#FFFFFF' }}>
              What You Can Win
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#E0E0E0' }}>
              Premium rewards for top performers. Real value, real opportunities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-prizes">
            {[
              {
                icon: Star,
                title: "Premium AI Tools",
                badge: "LEAP Winners",
                description: "3-month access to $99/mo AI tools",
                details: "Runway, Claude, MidJourney & more",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: DollarSign,
                title: "EMI Pause Rewards",
                badge: "Top Performers",
                description: "1 month payment pause on your course enrollment",
                details: "Save money while you compete",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Briefcase,
                title: "Exclusive Opportunities",
                badge: "Elite Members",
                description: "Join 10X team at Level 7+",
                details: "Paid collaboration opportunities",
                color: "from-blue-500 to-cyan-500",
              },
            ].map((prize, i) => (
              <Card 
                key={i} 
                className="glass-card-premium hover-glow border-primary/20 group relative overflow-hidden scroll-reveal animate-prize-float"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${prize.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="relative z-10">
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${prize.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <prize.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-center text-xl gradient-text">{prize.title}</CardTitle>
                  <Badge variant="secondary" className="mx-auto mt-2 bg-primary/10 text-primary border-primary/20">
                    {prize.badge}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <p className="mb-2" style={{ color: '#D0D0D0' }}>{prize.description}</p>
                  <p className="text-xs" style={{ color: '#B0B0B0' }}>{prize.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: JOIN / SIGN-UP - Magnetic CTA
          ============================================ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="scroll-reveal">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              Ready to Start?
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold gradient-text mb-6" style={{ color: '#FFFFFF' }}>
              Join the Arena Today
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-8" style={{ color: '#E0E0E0' }}>
              Start competing, earning badges, and winning rewards. It takes just 10 seconds to get started.
            </p>
          </div>
          
          <div className="space-y-6 scroll-reveal">
            {isAuthenticated ? (
              <Link 
                to="/dashboard"
                className="btn-premium inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-bold rounded-full hover-glow animate-cta-magnetic"
              >
                <Rocket className="w-6 h-6" />
                Enter Your Dashboard
                <ArrowRight className="w-6 h-6" />
              </Link>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="btn-premium inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-bold rounded-full hover-glow animate-cta-magnetic"
              >
                <Rocket className="w-6 h-6" />
                Join with Google
                <ArrowRight className="w-6 h-6" />
              </button>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#C0C0C0' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Real Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER - Minimal & Clean
          ============================================ */}
      <footer className="py-12 px-4 border-t border-border/50 bg-card/30">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="1to10x Contest Arena" 
                  className="w-10 h-10 object-contain"
                />
                <h3 className="text-xl font-bold gradient-text">1to10x Contest Arena</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: '#C0C0C0' }}>
                Where skills meet rewards. Compete, level up, and win real opportunities.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-background/50 border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors">
                  <Users className="w-5 h-5 text-primary" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-background/50 border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors">
                  <Megaphone className="w-5 h-5 text-primary" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-background/50 border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 gradient-text" style={{ color: '#FFFFFF' }}>Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/leaderboard" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link to="/contests" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Contests
                  </Link>
                </li>
                <li>
                  <Link to="/giveaways" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Giveaways
                  </Link>
                </li>
                <li>
                  <Link to="/leap" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    LEAP Challenge
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 gradient-text" style={{ color: '#FFFFFF' }}>Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors" style={{ color: '#C0C0C0' }}>
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-sm" style={{ color: '#B0B0B0' }}>
              © 2025 1to10x Contest Arena. All rights reserved. Built with passion for competitive learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
