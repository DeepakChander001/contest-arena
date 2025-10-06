import { Zap, Trophy, Users, User, CheckCircle, XCircle, Clock, Award, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LEAP = () => {
  const qualificationStatus = {
    qualified: false,
    requirementsMet: 4,
    totalRequirements: 5,
    requirements: [
      {
        id: 1,
        name: "3+ Consistency Badges",
        required: 3,
        current: 3,
        met: true,
        badges: ["Streak Keeper", "Daily Devotee", "Points Climber"],
        icon: CheckCircle,
      },
      {
        id: 2,
        name: "2+ Achievement Badges",
        required: 2,
        current: 1,
        met: false,
        badges: ["Contest Victor"],
        missing: "Need 1 more",
        icon: Clock,
      },
      {
        id: 3,
        name: "1+ Community Badge",
        required: 1,
        current: 0,
        met: false,
        missing: "Need Team Player, Brand Ambassador, or Level 6+ badges",
        icon: XCircle,
      },
      {
        id: 4,
        name: "1+ Course Master Badge",
        required: 1,
        current: 1,
        met: true,
        badges: ["Prompt Master"],
        earnedDate: "Oct 12, 2024",
        icon: CheckCircle,
      },
      {
        id: 5,
        name: "Level 4+ Required",
        required: 4,
        current: 6,
        met: true,
        xp: "2,847 XP (well above requirement)",
        icon: CheckCircle,
      },
    ],
  };

  const pastWinners = [
    {
      name: "Sarah Chen",
      level: 9,
      month: "September 2024",
      quote: "Winning LEAP changed my learning journey",
      status: "Now earning $5,000/month as Level 7 expert",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen",
    },
    {
      name: "Rahul Kumar",
      level: 8,
      month: "August 2024",
      quote: "The 3-day challenge pushed me to my limits",
      status: "Leading AI automation projects for clients",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul-kumar",
    },
    {
      name: "Maya Rodriguez",
      level: 9,
      month: "July 2024",
      quote: "Best decision I made was qualifying for LEAP",
      status: "Now teaching AI courses professionally",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya-rodriguez",
    },
    {
      name: "Alex Zhang",
      level: 7,
      month: "June 2024",
      quote: "The team hackathon was incredibly rewarding",
      status: "Building AI products full-time",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex-zhang",
    },
    {
      name: "Priya Sharma",
      level: 8,
      month: "May 2024",
      quote: "LEAP opened doors I never imagined",
      status: "Working with 10X team on elite projects",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya-sharma",
    },
    {
      name: "David Kim",
      level: 9,
      month: "April 2024",
      quote: "From student to expert in 4 months",
      status: "Consulting for Fortune 500 companies",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david-kim",
    },
  ];

  const countdown = {
    days: 18,
    hours: 7,
    minutes: 23,
  };

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-card p-8 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border-primary/30">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
          <h1 className="text-5xl font-bold">LEAP CHALLENGE</h1>
        </div>
        <p className="text-2xl text-center mb-2">The Ultimate Monthly Competition</p>
        <p className="text-center text-muted-foreground mb-6">Learning. Execution. Achievement. Performance.</p>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Next LEAP in</div>
          <div className="flex items-center justify-center gap-4 text-4xl font-mono font-bold">
            <div className="flex flex-col items-center">
              <span className="text-primary">{countdown.days}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <span className="text-primary">:</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{countdown.hours}</span>
              <span className="text-xs text-muted-foreground">hours</span>
            </div>
            <span className="text-primary">:</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{countdown.minutes}</span>
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Qualification Status */}
      <div className="glass-card p-6">
        <div className="mb-6">
          {qualificationStatus.qualified ? (
            <div className="bg-success/20 border border-success p-4 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">🎉 You're Qualified for LEAP!</div>
              <p className="text-sm text-muted-foreground">Registration opens 7 days before LEAP</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Qualification Progress</h3>
                <span className="text-sm font-semibold">
                  {qualificationStatus.requirementsMet}/{qualificationStatus.totalRequirements} Requirements Met
                </span>
              </div>
              <Progress value={(qualificationStatus.requirementsMet / qualificationStatus.totalRequirements) * 100} className="h-3 mb-4" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {qualificationStatus.requirements.map((req) => {
            const Icon = req.icon;
            return (
              <div
                key={req.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  req.met
                    ? "border-success bg-success/5"
                    : "border-border bg-background/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Icon
                    className={`w-6 h-6 mt-1 ${
                      req.met ? "text-success" : req.current > 0 ? "text-warning" : "text-destructive"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{req.name}</h4>
                      {req.met ? (
                        <span className="text-sm font-semibold text-success">✓ Met</span>
                      ) : req.current > 0 ? (
                        <span className="text-sm font-semibold text-warning">In Progress</span>
                      ) : (
                        <span className="text-sm font-semibold text-destructive">Not Met</span>
                      )}
                    </div>

                    {req.badges && req.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {req.badges.map((badge, idx) => (
                          <div key={idx} className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                            {badge}
                          </div>
                        ))}
                      </div>
                    )}

                    {req.xp && <p className="text-sm text-muted-foreground">{req.xp}</p>}
                    {req.earnedDate && <p className="text-sm text-muted-foreground">Earned {req.earnedDate}</p>}
                    {req.missing && <p className="text-sm text-muted-foreground">{req.missing}</p>}

                    {!req.met && req.current !== undefined && (
                      <div className="mt-2">
                        <Progress value={(req.current / req.required) * 100} className="h-2 mb-1" />
                        <div className="text-xs text-muted-foreground">
                          {req.current}/{req.required} earned
                        </div>
                      </div>
                    )}

                    {!req.met && (
                      <Button size="sm" variant="outline" className="mt-3">
                        {req.current > 0 ? "Earn More" : "How to Earn"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">127 members qualified so far this month</p>
        </div>
      </div>

      {/* The 3-Day Challenge */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">The 3-Day Challenge</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 hover:scale-105 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">01</div>
            </div>
            <h3 className="text-xl font-bold mb-2">Day 1: Friday Evening</h3>
            <div className="text-sm text-muted-foreground mb-3">6:00 PM - 9:00 PM</div>
            <h4 className="font-semibold mb-2">Individual Skills Challenge</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Timed technical challenges testing mastery across AI concepts and implementation
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-warning" />
                <span>Top 50% advance to Day 2</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>Fast completion = bonus points</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">02</div>
            </div>
            <h3 className="text-xl font-bold mb-2">Day 2: Saturday</h3>
            <div className="text-sm text-muted-foreground mb-3">10:00 AM - 4:00 PM</div>
            <h4 className="font-semibold mb-2">Team Hackathon</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Randomly assigned teams of 4 build functional AI project in 6 hours
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-warning" />
                <span>Top 5 teams advance to finals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>Collaboration + innovation judged</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-all border-2 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">03</div>
            </div>
            <h3 className="text-xl font-bold mb-2">Day 3: Sunday</h3>
            <div className="text-sm text-muted-foreground mb-3">12:00 PM - 6:00 PM</div>
            <h4 className="font-semibold mb-2">Finals & Community Vote</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Top 5 teams present projects. Community + expert panel voting.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-warning" />
                <span>Top 3 winners announced live</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-primary" />
                <span>Biggest rewards of the month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Showcase */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">LEAP Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 bg-gradient-to-br from-warning/20 to-transparent border-warning/30">
            <div className="text-center mb-4">
              <Trophy className="w-16 h-16 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold">🥇 1st Place</h3>
              <div className="text-sm text-muted-foreground">LEAP Winner</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>LEAP Winner badge (permanent)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>1 month EMI pause ($999 value)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Featured on all 10X channels</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Premium AI tool (1 month)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Auto-qualify next LEAP</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="font-bold text-primary">1,000 bonus XP</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
            <div className="text-center mb-4">
              <Award className="w-16 h-16 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold">🥈🥉 2nd-3rd Place</h3>
              <div className="text-sm text-muted-foreground">LEAP Finalists</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>LEAP Finalist badge</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>2 weeks EMI pause</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Community highlights feature</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Auto-qualify next LEAP</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="font-bold text-primary">500 bonus XP</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="text-center mb-4">
              <Award className="w-16 h-16 text-accent mx-auto mb-3" />
              <h3 className="text-2xl font-bold">🎖️ Top 10</h3>
              <div className="text-sm text-muted-foreground">Elite Performers</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>LEAP Top 10 badge</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>1 week EMI pause</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Priority support (1 month)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="font-bold text-primary">300 bonus XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past Winners Hall of Fame */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">LEAP Winners Hall of Fame</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastWinners.map((winner, idx) => (
            <div key={idx} className="glass-card p-6 hover:scale-105 transition-all">
              <img
                src={winner.avatar}
                alt={winner.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary"
              />
              <div className="text-center mb-3">
                <h4 className="font-bold text-lg">{winner.name}</h4>
                <div className="text-sm text-primary">Level {winner.level}</div>
                <div className="text-xs text-muted-foreground">{winner.month}</div>
              </div>
              <p className="text-sm italic text-center text-muted-foreground mb-3">"{winner.quote}"</p>
              <div className="text-xs text-center">
                <Award className="w-4 h-4 inline mr-1 text-warning" />
                {winner.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What if I can't attend all 3 days?</AccordionTrigger>
            <AccordionContent>
              LEAP requires full 3-day participation. If you qualify but can't attend, you'll need to qualify again next month. 
              We recommend clearing your schedule when LEAP approaches.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How are teams formed on Day 2?</AccordionTrigger>
            <AccordionContent>
              Teams are randomly assigned for fairness. You can't choose teammates. This ensures everyone gets an equal 
              opportunity and helps you build collaboration skills with diverse team members.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I qualify in my first month?</AccordionTrigger>
            <AccordionContent>
              Technically yes, but it's challenging. Most members qualify in month 2-3 after building up their badge collection 
              and level. Focus on consistent participation and you'll get there!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What happens if I don't win?</AccordionTrigger>
            <AccordionContent>
              All LEAP participants receive the LEAP Veteran badge, 500 bonus XP for next month, and access to the LEAP Alumni 
              group. The experience alone is incredibly valuable for skill development.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* CTA */}
      <div className="glass-card p-8 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        {qualificationStatus.qualified ? (
          <>
            <h3 className="text-2xl font-bold mb-4">You're Ready for LEAP!</h3>
            <Button size="lg" className="text-lg px-8">
              Register for LEAP Challenge
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">Complete Requirements to Qualify</h3>
            <p className="text-muted-foreground mb-4">
              You're {qualificationStatus.requirementsMet} out of {qualificationStatus.totalRequirements} requirements away!
            </p>
            <Button size="lg" className="text-lg px-8">
              View Missing Requirements
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LEAP;
