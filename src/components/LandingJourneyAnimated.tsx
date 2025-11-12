import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyStep {
  number: string;
  title: string;
  items: string[];
}

const journeySteps: JourneyStep[] = [
  {
    number: '01',
    title: 'Take Entry Quiz',
    items: [
      'Pass a 20-question quiz (70% required).',
      'Unlimited attempts.',
      'Gain access to 10X Hustlers group.',
    ],
  },
  {
    number: '02',
    title: 'Join Weekly Contests',
    items: [
      'Compete in 4 contests every week:',
      'Speed, Quality, Knowledge, Community.',
      'Earn points, climb levels.',
    ],
  },
  {
    number: '03',
    title: 'Collect Badges',
    items: [
      'Earn 22+ badges across 5 categories.',
      'Unlock new contests.',
      'Build your achievement profile.',
    ],
  },
  {
    number: '04',
    title: 'Qualify for LEAP',
    items: [
      'Reach Level 4+, collect required badges.',
      'Compete monthly for the biggest rewards.',
      'Top 20–30% qualify.',
    ],
  },
];

export const LandingJourneyAnimated = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLUListElement>(null);
  const mobileNavigationRef = useRef<HTMLUListElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const navigation = navigationRef.current;
    const mobileNavigation = mobileNavigationRef.current;
    const services = servicesRef.current;

    // Create ScrollTrigger for the entire section
    const sections = services?.querySelectorAll('.sb-service') || [];
    
    sections.forEach((section, index) => {
      const sectionElement = section as HTMLElement;
      // Find nav item in both desktop and mobile navigation
      const navItem = navigation?.querySelector(`[data-index="${index}"]`) as HTMLElement;
      const mobileNavItem = mobileNavigation?.querySelector(`[data-index="${index}"]`) as HTMLElement;
      const progressLine = navItem?.querySelector('.progress-line-fill') as HTMLElement;
      const mobileProgressLine = mobileNavItem?.querySelector('.progress-line-fill') as HTMLElement;
      const titleElement = sectionElement.querySelector('.sb__title') as HTMLElement;
      const serviceItems = sectionElement.querySelectorAll('.sb__service-item') as NodeListOf<HTMLElement>;

      // Set initial states
      gsap.set(sectionElement, { opacity: 1 });
      
      // Set initial states for service items
      gsap.set(serviceItems, { y: 20, opacity: 0 });
      
      // Set initial states for title words
      if (titleElement) {
        const words = titleElement.querySelectorAll('.sb__title__word');
        words.forEach((word) => {
          const wordInner = word.querySelector('.sb__title__word__inner') as HTMLElement;
          if (wordInner) {
            gsap.set(wordInner, { y: '110%', opacity: 0 });
          }
        });
      }

      // Create scroll trigger for each section
      ScrollTrigger.create({
        trigger: sectionElement,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          setActiveIndex(index);
          
          // Animate navigation progress line (desktop)
          if (progressLine) {
            gsap.to(progressLine, {
              height: '100%',
              duration: 0.8,
              ease: 'ease-in-out',
            });
          }
          
          // Animate mobile navigation progress line
          if (mobileProgressLine) {
            gsap.to(mobileProgressLine, {
              width: '100%',
              duration: 0.8,
              ease: 'ease-in-out',
            });
          }

          // Animate title word-by-word
          if (titleElement) {
            const words = titleElement.querySelectorAll('.sb__title__word');
            words.forEach((word, wordIndex) => {
              const wordInner = word.querySelector('.sb__title__word__inner') as HTMLElement;
              if (wordInner) {
                gsap.fromTo(
                  wordInner,
                  {
                    y: '110%',
                    opacity: 0,
                  },
                  {
                    y: '0%',
                    opacity: 1,
                    duration: 0.8,
                    delay: wordIndex * 0.1,
                    ease: 'ease-out',
                  }
                );
              }
            });
          }

          // Animate service items with stagger
          serviceItems.forEach((item, itemIndex) => {
            gsap.fromTo(
              item,
              {
                y: 20,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: 0.3 + itemIndex * 0.15,
                ease: 'ease-out',
              }
            );
          });
        },
        onEnterBack: () => {
          setActiveIndex(index);
          
          // Restore progress when scrolling back
          if (progressLine) {
            gsap.to(progressLine, {
              height: '100%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
          if (mobileProgressLine) {
            gsap.to(mobileProgressLine, {
              width: '100%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
        },
        onLeave: () => {
          // Reset progress when leaving (except for last item)
          if (progressLine && index < sections.length - 1) {
            gsap.to(progressLine, {
              height: '0%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
          if (mobileProgressLine && index < sections.length - 1) {
            gsap.to(mobileProgressLine, {
              width: '0%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
        },
        onLeaveBack: () => {
          // Reset progress when scrolling back past
          if (progressLine && index > 0) {
            gsap.to(progressLine, {
              height: '0%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
          if (mobileProgressLine && index > 0) {
            gsap.to(mobileProgressLine, {
              width: '0%',
              duration: 0.5,
              ease: 'ease-in-out',
            });
          }
        },
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Split title into words for animation
  const splitTitleIntoWords = (title: string) => {
    return title.split(' ');
  };

  return (
    <section className="s__wrapper min-h-screen py-20 px-4 bg-gradient-to-b from-black via-zinc-900 to-black relative overflow-hidden">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 backdrop-blur-sm pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="s__content" ref={contentRef}>
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Navigation - Desktop */}
            <div className="lg:col-span-4 hidden lg:block">
              <ul className="s__navigation space-y-8 sticky top-32" ref={navigationRef}>
                {journeySteps.map((step, index) => (
                  <li
                    key={index}
                    data-index={index}
                    className={`s__navigation__item relative ${
                      activeIndex === index ? 'is-active' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Progress Line */}
                      <div className="relative w-1 h-16 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="progress-line-fill absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 transition-all duration-700 ease-in-out"
                        />
                      </div>
                      
                      {/* Number */}
                      <div
                        className={`text-4xl font-bold font-mono transition-all duration-700 ease-in-out ${
                          activeIndex === index
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'
                            : 'text-zinc-600'
                        }`}
                      >
                        {step.number}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Services */}
            <div className="lg:col-span-8 w-full lg:col-start-5" ref={servicesRef}>
              {/* Mobile Navigation - Horizontal */}
              <div className="lg:hidden mb-12">
                <ul className="s__navigation flex gap-6 overflow-x-auto pb-4" ref={navigationRef}>
                  {journeySteps.map((step, index) => (
                    <li
                      key={index}
                      data-index={index}
                      className={`s__navigation__item flex-shrink-0 ${
                        activeIndex === index ? 'is-active' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl font-bold font-mono text-zinc-600">
                          {step.number}
                        </div>
                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="progress-line-fill h-0 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="s__services space-y-32">
                {journeySteps.map((step, index) => (
                  <div
                    key={index}
                    className="sb-service"
                    style={{
                      minHeight: '60vh',
                    }}
                  >
                    {/* Title with word-by-word animation */}
                    <h3 className="sb__title t-title text-4xl md:text-5xl lg:text-6xl font-bold mb-12 leading-tight text-white">
                      {splitTitleIntoWords(step.title).map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className="sb__title__word inline-block overflow-hidden mr-2"
                        >
                          <span className="sb__title__word__inner inline-block">
                            {word}
                          </span>
                        </span>
                      ))}
                    </h3>

                    {/* Service Items with stagger */}
                    <ul className="sb__service-list space-y-6">
                      {step.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="sb__service-item text-lg md:text-xl text-zinc-300 leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

