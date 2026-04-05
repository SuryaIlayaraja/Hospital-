import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Users,
  UserCheck,
  BarChart3,
  AlertCircle,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Stethoscope,
  ArrowLeft,
  Globe,
  Ticket,
  MapPin,
  Phone,
  Clock,
  Activity,
  Plus,
  Dna,
  Brain,
  Heart,
  Microscope,
  Droplets,
  Bone,
  Target,
  Lightbulb,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { getActiveDoctors, Doctor, HospitalSettings } from "../services/apiService";
import ThemeToggle from "./ThemeToggle";
import Testimonials from "./Testimonials";
import { useLanguage } from "../contexts/LanguageContext";


const CountUpNumber = ({
  endValue,
  duration = 4000,
  startTrigger
}: {
  endValue: number;
  duration?: number;
  startTrigger: boolean;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startTrigger) {
      setCount(0);
      countRef.current = 0;
      startTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smoother finish
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(easeOutQuad(percentage) * endValue);

      if (currentCount !== countRef.current) {
        setCount(currentCount);
        countRef.current = currentCount;
      }

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [startTrigger, endValue, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const VALUE_THEMES = [
  {
    gradient: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.35)",
    border: "hover:border-blue-500/40",
    bg: "from-blue-500/10 via-cyan-400/5 to-transparent",
    iconBg: "bg-blue-500/15",
    iconBorder: "border-blue-500/30",
    iconColor: "text-blue-400",
    bullet: "text-blue-400",
  },
  {
    gradient: "from-emerald-500 to-teal-400",
    glow: "rgba(16,185,129,0.35)",
    border: "hover:border-emerald-500/40",
    bg: "from-emerald-500/10 via-teal-400/5 to-transparent",
    iconBg: "bg-emerald-500/15",
    iconBorder: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    bullet: "text-emerald-400",
  },
  {
    gradient: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.35)",
    border: "hover:border-violet-500/40",
    bg: "from-violet-500/10 via-purple-400/5 to-transparent",
    iconBg: "bg-violet-500/15",
    iconBorder: "border-violet-500/30",
    iconColor: "text-violet-400",
    bullet: "text-violet-400",
  },
  {
    gradient: "from-orange-500 to-amber-400",
    glow: "rgba(249,115,22,0.35)",
    border: "hover:border-orange-500/40",
    bg: "from-orange-500/10 via-amber-400/5 to-transparent",
    iconBg: "bg-orange-500/15",
    iconBorder: "border-orange-500/30",
    iconColor: "text-orange-400",
    bullet: "text-orange-400",
  },
  {
    gradient: "from-pink-500 to-rose-400",
    glow: "rgba(236,72,153,0.35)",
    border: "hover:border-pink-500/40",
    bg: "from-pink-500/10 via-rose-400/5 to-transparent",
    iconBg: "bg-pink-500/15",
    iconBorder: "border-pink-500/30",
    iconColor: "text-pink-400",
    bullet: "text-pink-400",
  },
];

const ValueCard = ({ item, index }: { item: any; index: number }) => {
  const icons = [UserCheck, Shield, Users, Target, Lightbulb];
  const Icon = icons[index % icons.length];
  const theme = VALUE_THEMES[index % VALUE_THEMES.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl border border-white/10 ${theme.border} transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
      style={{ transition: 'all 0.4s ease' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px ${theme.glow}`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
    >
      {/* Background gradient sweep on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Subtle top-left corner glow */}
      <div className={`absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br ${theme.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10 flex items-start gap-4">
        {/* Icon container with gradient ring */}
        <div className={`relative w-12 h-12 ${theme.iconBg} border ${theme.iconBorder} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${theme.iconColor}`} />
          {/* Gradient shimmer on icon */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white transition-colors">
            {item.title}
          </h3>
          <ul className="space-y-2">
            {item.desc.map((bullet: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400 group-hover:text-gray-300 leading-snug transition-colors duration-300">
                <span className={`${theme.bullet} mt-0.5 font-bold text-base leading-none`}>›</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    </div>
  );
};

interface DashboardProps {
  onNavigate?: (tab: "opd" | "ipd" | "admin") => void;
  onNavigateToTicket?: () => void;
  hospitalSettings?: HospitalSettings | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onNavigateToTicket,
  hospitalSettings,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);



  const loadDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await getActiveDoctors();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleMeetDoctors = () => {
    if (!showDoctors && doctors.length === 0) {
      loadDoctors();
    }
    setShowDoctors(true);
  };

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll animation for background glow
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotating Badge Logic
  const badgeMessages = [
    t('badge.matters'),
    t('badge.committed')
  ];
  const [badgeIndex, setBadgeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeIndex(prev => (prev + 1) % badgeMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [badgeMessages.length]);

  // Banner Interaction State
  const [hoveredBanner, setHoveredBanner] = useState<'black' | 'accent' | null>(null);

  // Rotating Notice Bar Logic
  const noticeMessages = [
    t('notice.value'),
    t('notice.serve'),
    t('notice.welcome')
  ];
  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % noticeMessages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [noticeMessages.length]);


  // Carousel Logic
  const heroImages = t('hero.images') as any[];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroVisible(true);
        } else {
          // Optional: Pause when not visible
          setHeroVisible(false);
          setCurrentHeroIndex(0); // Reset to first image when away
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Reset to first image whenever user navigates away using internal views
    if (showAbout || showDoctors) {
      setCurrentHeroIndex(0);
      return;
    }

    // Only run interval if hero is actually visible on screen
    if (!heroVisible) return;

    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroVisible, showAbout, showDoctors, heroImages.length]);

  // Calculate parallax glow effects
  const scale = 1 + (scrollY / 2000);
  const orb1Y = scrollY * 0.4;
  const orb2Y = scrollY * 0.15;

  // Prevent browser back button from crashing the app
  useEffect(() => {
    // Push a dummy state to history when component mounts
    window.history.pushState(null, "", window.location.href);

    // Handle popstate event (browser back/forward button)
    const handlePopState = () => {
      // Prevent default back navigation
      window.history.pushState(null, "", window.location.href);

      // If user is on doctors screen, go back to dashboard instead
      if (showDoctors) {
        setShowDoctors(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showDoctors]);

  // If showing about screen, render about view
  if (showAbout) {
    // About page images from Unsplash
    const aboutImages = {
      hero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80",
      team: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
      mission: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      vision: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80",
      facility1: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
      facility2: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80",
      facility3: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=600&q=80",
      facility4: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        <style>{`
          @keyframes aboutFadeUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes aboutScaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes floatBadge {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
          }
          @keyframes countSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .about-animate { animation: aboutFadeUp 0.8s ease-out forwards; }
          .about-animate-delay-1 { animation: aboutFadeUp 0.8s ease-out 0.1s forwards; opacity: 0; }
          .about-animate-delay-2 { animation: aboutFadeUp 0.8s ease-out 0.2s forwards; opacity: 0; }
          .about-animate-delay-3 { animation: aboutFadeUp 0.8s ease-out 0.3s forwards; opacity: 0; }
          .about-animate-delay-4 { animation: aboutFadeUp 0.8s ease-out 0.4s forwards; opacity: 0; }
          .about-scale-in { animation: aboutScaleIn 0.6s ease-out forwards; }
          .shimmer-text {
            background: linear-gradient(90deg, #818cf8, #c084fc, #818cf8);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s linear infinite;
          }
          .float-badge { animation: floatBadge 3s ease-in-out infinite; }
          .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
          .gallery-item:hover img { transform: scale(1.1); }
          .gallery-item:hover .gallery-overlay { opacity: 1; }
        `}</style>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CINEMATIC HERO BANNER */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0">
            <img
              src={aboutImages.hero}
              alt={hospitalSettings?.hospital_name || "Vikram Hospital"}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.35)" }}
            />
          </div>
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80" />
          {/* Floating Glow Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Navigation Header - Overlayed on Hero */}
          <nav className="absolute top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 pulse-glow">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="text-lg font-bold text-white">
                    {hospitalSettings?.hospital_name || "Vikram Hospital"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300"
                  >
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{language === "en" ? "EN" : "தமிழ்"}</span>
                  </button>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 border border-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('backToHome')}</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="about-animate inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
                <Plus className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-indigo-200 tracking-wider uppercase">
                  {t('about.est')}
                </span>
              </div>
              <h1 className="about-animate-delay-1 text-5xl sm:text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-[0.9]">
                {t('about.redefining')}{" "}
                <br className="hidden sm:block" />
                <span className="shimmer-text">
                  {t('about.redefiningCard')}
                </span>
              </h1>
              <p className="about-animate-delay-2 text-gray-300/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                {t('about.heroDesc')}
              </p>

              {/* Floating Stats Badges */}
              <div className="about-animate-delay-3 flex flex-wrap items-center justify-center gap-4 mt-10">
                {[
                  { value: "15+", label: t('about.years') },
                  { value: "50K+", label: t('about.patients') },
                  { value: "30+", label: t('about.doctors') },
                  { value: "24/7", label: t('about.emergency') },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="float-badge bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 text-center hover:border-indigo-500/40 transition-all duration-300"
                    style={{ animationDelay: `${idx * 0.5}s` }}
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ABOUT STORY + IMAGE SECTION */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <div className="about-animate-delay-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Heart className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">
                  {t('about.story.tag')}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {language === "en" ? (
                  <>A Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('about.story.healing')}</span></>
                ) : (
                  <>{t('about.story.healing')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('about.story.legacy')}</span></>
                )}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {t('about.story.desc')}
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: t('about.nabh') },
                  { icon: Activity, text: t('about.tech') },
                  { icon: Users, text: t('about.expertTeam') },
                ].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/20 transition-all">
                    <badge.icon className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm text-gray-300">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Side */}
            <div className="about-animate-delay-2 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <img
                  src={aboutImages.team}
                  alt={t('about.teamImageAlt')}
                  className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {t('about.care247')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {t('about.teamReady')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* MISSION & VISION WITH IMAGES - BENTO GRID */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('about.purpose')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission Card with Image */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all duration-500 min-h-[400px]">
              <img
                src={aboutImages.mission}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
              <div className="relative z-10 p-8 md:p-10 flex flex-col justify-end h-full">
                <div className="w-14 h-14 bg-indigo-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Star className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t('ourMission')}</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {t('about.mission.desc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    t('about.compassion'),
                    t('quality'),
                    'Dedication' // Wait, I didn't add dedication to Context? Let me check.
                    // Actually I'll use the strings from the code for now if they are simple but better to be consistent.
                  ].map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-200 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vision Card with Image */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 min-h-[400px]">
              <img
                src={aboutImages.vision}
                alt="Vision"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
              <div className="relative z-10 p-8 md:p-10 flex flex-col justify-end h-full">
                <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Zap className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t('ourVision')}</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {t('about.vision.desc')}
                </p>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-4/5 rounded-full animate-pulse" />
                </div>
                <div className="mt-3 text-right text-xs text-purple-400 font-mono tracking-wider">
                  {t('about.advancing')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ANIMATED STATS BAR */}
        {/* ═══════════════════════════════════════════════════════ */}


        {/* ═══════════════════════════════════════════════════════ */}
        {/* FACILITIES IMAGE GALLERY */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <Microscope className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-200 tracking-wider uppercase">
                {t('about.facilities.tag')}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('about.facilities.title')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('about.facilities.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: aboutImages.facility1, title: t('about.fac1.title'), desc: t('about.fac1.desc') },
              { img: aboutImages.facility2, title: t('about.fac2.title'), desc: t('about.fac2.desc') },
              { img: aboutImages.facility3, title: t('about.fac3.title'), desc: t('about.fac3.desc') },
              { img: aboutImages.facility4, title: t('about.fac4.title'), desc: t('about.fac4.desc') },
            ].map((facility, idx) => (
              <div
                key={idx}
                className="gallery-item group relative overflow-hidden rounded-2xl border border-white/10 cursor-pointer hover:border-indigo-500/30 transition-all duration-500"
                style={{ animation: `aboutFadeUp 0.6s ease-out ${idx * 0.1}s forwards`, opacity: 0 }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={facility.img}
                    alt={facility.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                </div>
                <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-lg font-bold text-white mb-1">{facility.title}</h4>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{facility.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* FACILITIES TICKER */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-24 overflow-hidden rounded-3xl bg-white/5 border border-white/10 relative flex items-center justify-center">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
            <style>{`
              .movecontinuous-about{
                width: max-content;
                animation: scrollLeftAbout 30s linear infinite;
              }
              @keyframes scrollLeftAbout {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
            <div className="relative w-full overflow-hidden">
              <div className="flex items-center gap-8 movecontinuous-about">
                {(t('facilities') as any).map((facility: string, index: number) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 px-8 py-4 rounded-full whitespace-nowrap">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{facility}</span>
                  </div>
                ))}
                {(t('facilities') as any).map((facility: string, index: number) => (
                  <div key={`dup-${index}`} className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 px-8 py-4 rounded-full whitespace-nowrap">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* OUR VALUES SECTION — PREMIUM REDESIGN */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 py-24 overflow-hidden">
          {/* Ambient background glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Star className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">
                  {t('about.values.tag')}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">{t('about.values.title')} </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {t('about.values.accent')}
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('about.values.desc')}
              </p>
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500" />
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="h-px w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <div className="h-px w-16 bg-gradient-to-r from-pink-500 to-transparent" />
              </div>
            </div>

            {/* Top row — 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {(t('valuesItems') as any).slice(0, 3).map((item: any, idx: number) => (
                <ValueCard key={idx} item={item} index={idx} />
              ))}
            </div>

            {/* Bottom row — 2 cards centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {(t('valuesItems') as any).slice(3, 5).map((item: any, idx: number) => (
                <ValueCard key={idx + 3} item={item} index={idx + 3} />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VISIT & CONNECT FOOTER */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="pt-16 border-t border-white/5">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('about.getInTouch')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Address */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-500/30">
                    <MapPin className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">{t('address')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('about.address.dummy')}
                </p>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-500/30">
                    <Phone className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">{t('contactInfo')}</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-400 flex justify-between items-center group/item">
                    <span>{t('about.emergency')}:</span>
                    <a 
                      href={hospitalSettings?.contact_phone ? `tel:${hospitalSettings.contact_phone}` : "tel:+919876543210"}
                      className="text-indigo-300 font-mono bg-indigo-500/10 px-3 py-1 rounded-lg hover:bg-indigo-500/20 transition-colors"
                    >
                      {hospitalSettings?.contact_phone || "+91 98765 43210"}
                    </a>
                  </p>
                  <p className="text-gray-400 flex justify-between items-center group/item">
                    <span>{t('about.email')}:</span>
                    <a 
                      href={hospitalSettings?.contact_email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${hospitalSettings.contact_email}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-indigo-200 transition-colors underline decoration-indigo-500/30 underline-offset-4"
                    >
                      {hospitalSettings?.contact_email || "info@vikramhospital.com"}
                    </a>
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">
                    {t('about.connect')}
                  </h3>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/50 transition-all duration-300 text-gray-400 hover:text-[#1877F2] hover:scale-110">
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#E4405F]/20 border border-white/10 hover:border-[#E4405F]/50 transition-all duration-300 text-gray-400 hover:text-[#E4405F] hover:scale-110">
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/50 transition-all duration-300 text-gray-400 hover:text-[#1DA1F2] hover:scale-110">
                      <Twitter className="h-6 w-6" />
                    </a>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-8">
                  {t('about.rights')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If showing doctors screen, render doctors view
  if (showDoctors) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

        {/* Navigation Header */}
        <nav className="relative z-20 border-b border-gray-200 dark:border-gray-800/50 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-bold">Vikram Hospital</span>
              </div>
              <button
                onClick={() => setShowDoctors(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToHome')}
              </button>
            </div>
          </div>
        </nav>

        {/* Doctors Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Stethoscope className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">{t('medicalExcellence')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {t('meetOur')}{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                {t('expertDoctorsTitle')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t('teamDesc')}
            </p>
          </div>

          {doctorsLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-lg">{t('loadingDoctors')}</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="h-20 w-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">{t('noDoctors')}</h3>
              <p className="text-gray-500">{t('noDoctorsDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  className="group bg-white dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {doctor.image ? (
                    <div className="w-full aspect-square overflow-hidden bg-gray-900 flex items-center justify-center">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                              <svg class="h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                      <Stethoscope className="h-24 w-24 text-indigo-400/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2  transition-colors duration-300">
                      {doctor.name}
                    </h3>
                    {doctor.specialization && (
                      <p className="text-indigo-400 font-semibold mb-3 text-sm">
                        {doctor.specialization}
                      </p>
                    )}
                    {doctor.studies && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {doctor.studies}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030303] text-gray-900 dark:text-white relative overflow-hidden">
      {/* Muted Sophisticated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Subtle Orbs */}
        <div
          className="absolute top-[-10%] left-[-20%] w-[100vw] h-[100vw] bg-indigo-900/10 rounded-full blur-[120px] animate-drift-slow"
          style={{ transform: `translateY(${orb1Y}px) scale(${scale})` }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-slate-800/10 rounded-full blur-[100px] animate-drift-mid"
          style={{ transform: `translateY(${orb2Y}px) scale(${scale * 0.9})` }}
        />

        {/* Muted Technical Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }}
        />

        {/* Single Deep Radial Glow at top */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent_60%)]" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&display=swap');

        @keyframes drift-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5%, 5%); }
        }
        @keyframes drift-mid {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-3%, 7%); }
        }
        @keyframes drift-fast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8%, -4%); }
        }
        .animate-drift-slow { animation: drift-slow 25s infinite ease-in-out; }
        .animate-drift-mid { animation: drift-mid 20s infinite ease-in-out; }
        .animate-drift-fast { animation: drift-fast 15s infinite ease-in-out; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee 25s linear infinite reverse;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        @keyframes blood-flow {
          0% { 
            transform: translateX(-10vw) translateY(0) rotate(0deg); 
            opacity: 0;
          }
          10% { opacity: 1; }
          25% { transform: translateX(20vw) translateY(90px) rotate(90deg); }
          50% { transform: translateX(50vw) translateY(-90px) rotate(180deg); }
          75% { transform: translateX(80vw) translateY(90px) rotate(270deg); }
          90% { opacity: 1; }
          100% { 
            transform: translateX(110vw) translateY(0) rotate(360deg); 
            opacity: 0;
          }
        }
        .animate-blood-flow {
          animation: blood-flow 10s linear infinite;
        }
      `}</style>

      {/* Sticky Top Header (Nav + Notice Bar) */}
      <div className="sticky top-0 z-50 w-full">
        {/* Navigation Header */}
        <nav className="border-b border-gray-200 dark:border-gray-800/50 bg-white/60 dark:bg-black/60 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{t('hospital.name')}</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => onNavigate?.("opd")}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all duration-200 font-medium"
                >
                  {t('opdFeedback')}
                </button>
                <button
                  onClick={() => onNavigate?.("ipd")}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all duration-200 font-medium"
                >
                  {t('ipdFeedback')}
                </button>
                <button
                  onClick={() => onNavigate?.("admin")}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all duration-200 font-medium"
                >
                  {t('admin')}
                </button>
                <button
                  onClick={() => setShowAbout(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all duration-200 font-medium"
                >
                  {t('about')}
                </button>
              </div>

              {/* Mobile Language Toggle */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </button>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={onNavigateToTicket}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20 rounded-lg hover:bg-red-600/20 hover:border-red-600/40 transition-all duration-300"
                >
                  <Ticket className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('raiseTicket')}</span>
                </button>
                <button
                  onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg transition-all duration-300 group"
                >
                  <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400  dark:group-hover:text-white" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300  dark:group-hover:text-white">{language === "en" ? "EN" : "தமிழ்"}</span>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800/50 flex flex-wrap gap-4">
              <button onClick={() => onNavigate?.("opd")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">{t('opdFeedback')}</button>
              <button onClick={() => onNavigate?.("ipd")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">{t('ipdFeedback')}</button>
              <button onClick={() => onNavigate?.("admin")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">{t('admin')}</button>
              <button onClick={() => setShowAbout(true)} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">{t('about')}</button>
            </div>
          </div>
        </nav>

        {/* 3️⃣ Rotating Notice Bar */}
        <div className="relative w-full h-[52px] bg-gray-100/40 dark:bg-black/40 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-center overflow-hidden">
          {/* Subtle Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent opacity-30" />

          <div className="max-w-7xl mx-auto px-4 w-full h-full relative">
            {noticeMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out
                  ${idx === noticeIndex
                    ? "opacity-100 translate-y-0 scale-100 blur-0"
                    : "opacity-0 -translate-y-4 scale-95 blur-sm pointer-events-none"}`}
              >
                <span className="text-base font-semibold text-indigo-800 dark:text-indigo-200/90 tracking-[0.1em] text-center uppercase drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]">
                  {msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20">
        <div
          className={`flex flex-col lg:flex-row items-center gap-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Premium Badge */}
            {/* Rotating Badge / Pill */}
            <div className="relative mb-8 group">
              <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(79,70,229,0.1)] overflow-hidden min-h-[44px]">
                <div className="relative h-5 w-5 flex-shrink-0">
                  <Activity className="absolute inset-0 h-5 w-5 text-indigo-400 animate-pulse" />
                </div>

                <div className="relative h-5 min-w-[260px] sm:min-w-[420px] max-w-[calc(100vw-80px)] overflow-hidden">
                  {badgeMessages.map((msg, idx) => (
                    <span
                      key={idx}
                      className={`absolute inset-0 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-1000 ease-in-out flex items-center ${idx === badgeIndex
                        ? "opacity-100 translate-y-0 text-indigo-700 dark:text-indigo-200"
                        : "opacity-0 translate-y-4 text-white/0"
                        }`}
                    >
                      {msg}
                    </span>
                  ))}
                </div>

                {/* Subtle highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>

            {/* Hero Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mb-6 leading-snug">
              <TypewriterText
                typingSpeed={80}
                segments={[
                  { text: t('elevateYour') + " ", className: "text-gray-900 dark:text-white" },
                  { text: t('healthcare'), className: "bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent" }
                ]}
              />
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onNavigate?.("opd")}
                className="group flex items-center gap-3 px-10 py-5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-indigo-700 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {t('shareFeedback')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleMeetDoctors}
                className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
              >
                <Stethoscope className="h-5 w-5" />
                {t('meetDoctors')}
              </button>
            </div>
          </div>

          {/* Hero Image Carousel */}
          <div ref={heroRef} className="flex-[1.4] relative group w-full lg:w-[60%]">
            {/* Ambient Glow behind image */}
            <div className="absolute inset-x-0 -bottom-10 h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl rounded-full" />

            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.2)] transition-all duration-700 hover:scale-[1.03] hover:border-indigo-500/30 aspect-[4/3] min-h-[300px] bg-gray-900">
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentHeroIndex
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-110 pointer-events-none"
                    }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.className += " h-full bg-gray-900 flex items-center justify-center";
                      (e.target as HTMLImageElement).parentElement!.innerHTML += `
                        <div class="text-center">
                          <svg class="h-20 w-20 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p class="text-gray-400">Loading Healthcare Experts...</p>
                        </div>
                      `;
                    }}
                  />
                  {/* Image Title Overlay - Aesthetic Style */}
                  <div className="absolute bottom-10 left-12 right-12 transform transition-all duration-700 delay-300 translate-y-0 opacity-100">
                    <p className="text-white text-3xl sm:text-4xl md:text-5xl italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-tight leading-relaxed" style={{ fontFamily: language === 'en' ? "'Playfair Display', serif" : "inherit" }}>
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}

              {/* Navigation Indicators */}
              <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${index === currentHeroIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {t('quickAccess')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate?.("opd")}
              className="group p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <Users className="h-8 w-8 text-blue-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t('opdFeedback')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('shareExperience')}</p>
            </button>

            <button
              onClick={() => onNavigate?.("ipd")}
              className="group p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
            >
              <UserCheck className="h-8 w-8 text-green-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t('ipdFeedback')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('rateStay')}</p>
            </button>

            <button
              onClick={() => onNavigate?.("admin")}
              className="group p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <BarChart3 className="h-8 w-8 text-purple-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t('admin')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('viewAnalytics')}</p>
            </button>

            <button
              onClick={onNavigateToTicket}
              className="group p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10"
            >
              <AlertCircle className="h-8 w-8 text-red-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t('raiseTicket')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('getSupport')}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Fast Shipping -> 24/7 Emergency Services */}
          <div className="group bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-indigo-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all duration-300">
                <Zap className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t('emergency247')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed">
              {t('emergencyDesc')}
            </p>
          </div>

          {/* Quality Guarantee -> Expert Doctors */}
          <div className="group bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-all duration-300">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t('expertDoctors')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed">
              {t('expertDesc')}
            </p>
          </div>

          {/* Premium Selection -> Quality Healthcare */}
          <div className="group bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all duration-300">
                <Star className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t('premiumCare')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed">
              {t('premiumDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Crossing Decorative Banners - Interactive Lens Focus */}
      <div className="relative h-[450px] w-full overflow-hidden mt-12 select-none flex items-center justify-center">
        {/* Central Purplish Pink Glow */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[550px] bg-[#d946ef]/15 blur-[130px] rounded-full z-0 transition-opacity duration-700 ${hoveredBanner ? 'opacity-40' : 'opacity-100'}`} />

        {/* Black Banner (Behind) */}
        <div
          onMouseEnter={() => setHoveredBanner('black')}
          onMouseLeave={() => setHoveredBanner(null)}
          className={`absolute w-[260%] h-28 bg-[#1e1b4b] border-y-2 border-white/10 -rotate-[18deg] flex items-center shadow-[0_0_60px_rgba(30,27,75,0.4)] z-10 transition-all duration-500 cursor-crosshair pointer-events-auto ${hoveredBanner === 'accent' ? 'blur-[6px] opacity-40 scale-[0.98]' : 'blur-0 opacity-100 scale-100'
            }`}
        >
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-5xl font-bold text-white/30 px-16 flex items-center gap-8 uppercase tracking-tighter">
                {t('hospital.name')} <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> {t('expertDoctors')} <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> {t('about.tech')} <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> {t('about.story.healing')}
              </span>
            ))}
          </div>
        </div>

        {/* Purplish Pink Banner (Front) */}
        <div
          onMouseEnter={() => setHoveredBanner('accent')}
          onMouseLeave={() => setHoveredBanner(null)}
          className={`absolute w-[260%] h-28 bg-[#d946ef] rotate-[12deg] flex items-center shadow-[0_0_70px_rgba(217,70,239,0.4)] z-20 transition-all duration-500 cursor-crosshair pointer-events-auto ${hoveredBanner === 'black' ? 'blur-[6px] opacity-40 scale-[0.98]' : 'blur-0 opacity-100 scale-100'
            }`}
        >
          <div className="flex whitespace-nowrap animate-marquee-reverse">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-5xl font-bold text-white px-16 flex items-center gap-8 italic uppercase tracking-tighter">
                {t('premiumCare')} <Dna className="h-12 w-12 text-white animate-spin-slow" /> {t('shareExperience')} <Dna className="h-12 w-12 text-white animate-spin-slow" /> {t('about.story.healing')} <Dna className="h-12 w-12 text-white animate-spin-slow" /> {t('patientFirst')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Centres Of Excellence Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('coe.title')} <span className="text-[#d946ef] drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">{t('coe.accent')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            {t('coe.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cardiology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors duration-500">
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.cardiology')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500" />
          </div>

          {/* Orthopedics */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors duration-500">
                <Bone className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.orthopedics')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-500" />
          </div>

          {/* Oncology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors duration-500">
                <Microscope className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.oncology')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          </div>

          {/* Neurology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors duration-500">
                <Brain className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.neurology')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
          </div>

          {/* Gastroenterology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors duration-500">
                <Activity className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.gastro')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
          </div>

          {/* Nephrology & Urology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20 transition-colors duration-500">
                <Droplets className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">{t('coe.nephro')}</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
          </div>
        </div>
      </div>

      {/* Welcome To Vikram ENT Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10 border-t border-gray-200 dark:border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-gray-900 dark:text-white">
            {t('welcome.title')} <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{t('welcome.accent')}</span> —
            <br className="hidden sm:block" /> {t('welcome.leader')} <span className="text-[#d946ef]">{t('welcome.leaderAccent')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
            {t('welcome.desc')}
          </p>
        </div>

        <div ref={statsRef} className="relative group">
          {/* Subtle background glow for the stats grid */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full w-full bg-indigo-500/5 blur-[120px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 py-8">
            {/* Stat 1: Years of Experience */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2 group-hover/stat:text-indigo-400 transition-colors">
                  <CountUpNumber endValue={hospitalSettings?.years_experience || 55} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-tight">{t('stats.experience')}</div>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover/stat:bg-indigo-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Clock className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 2: Doctors */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-purple-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2 group-hover/stat:text-purple-400 transition-colors">
                  <CountUpNumber endValue={hospitalSettings?.expert_doctors || 20} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-tight">{t('stats.doctors')}</div>
              </div>
              <div className="p-5 rounded-2xl bg-purple-500/10 text-purple-400 group-hover/stat:bg-purple-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Users className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 3: Procedures */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-pink-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 group-hover/stat:text-pink-400 transition-colors">
                  {hospitalSettings?.successful_procedures && hospitalSettings.successful_procedures.includes(',') ? (
                    <span>{hospitalSettings.successful_procedures}</span>
                  ) : (
                    <>
                      <CountUpNumber endValue={parseInt((hospitalSettings?.successful_procedures || "500000").replace(/[^0-9]/g, ''))} startTrigger={statsVisible} />+
                    </>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-tight">{t('stats.procedures')}</div>
              </div>
              <div className="p-5 rounded-2xl bg-pink-500/10 text-pink-400 group-hover/stat:bg-pink-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Activity className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 4: Lives Touched */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-cyan-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 group-hover/stat:text-cyan-400 transition-colors">
                  {hospitalSettings?.lives_touched && hospitalSettings.lives_touched.includes(',') ? (
                    <span>{hospitalSettings.lives_touched}</span>
                  ) : (
                    <>
                      <CountUpNumber endValue={parseInt((hospitalSettings?.lives_touched || "5000000").replace(/[^0-9]/g, ''))} startTrigger={statsVisible} />+
                    </>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-tight">{t('stats.lives')}</div>
              </div>
              <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover/stat:bg-cyan-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <UserCheck className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {hospitalSettings?.show_testimonials !== false && <Testimonials />}

      {/* Patient Dedication Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6 animate-pulse-slow">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-semibold text-red-400 uppercase tracking-widest">{t('flow.tag')}</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('flow.title')} <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">{t('flow.accent')}</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('flow.desc')}
        </p>
      </div>

      {/* Thick Wavy Blood Flow Animation - Pure Cells - Balanced Scale */}
      <div className="relative h-[450px] w-full overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-0 rounded-full z-[60]"
            style={{
              width: `${30 + (i % 8) * 10}px`,
              height: `${24 + (i % 8) * 8}px`,
              background: 'radial-gradient(circle at 30% 30%, #ff0000, #4a0000)',
              boxShadow: 'inset -5px -5px 12px rgba(0,0,0,0.6), 0 0 30px rgba(255, 0, 0, 0.4)',
              animation: `blood-flow ${6 + (i % 3)}s linear infinite`,
              animationDelay: `${i * 0.25}s`,
              opacity: 0.8 + (i % 3) * 0.1,
              filter: `blur(${i % 5 === 0 ? '2px' : '0px'})`,
              marginTop: `${(i % 5 - 2) * 40}px`
            }}
          >
            {/* Cell detail */}
            <div className="absolute inset-2 rounded-full bg-black/30 blur-[2px]" />
            <div className="absolute top-2 left-4 w-6 h-4 rounded-full bg-white/30 blur-[2px] rotate-[-20deg]" />
          </div>
        ))}
      </div>
    </div>
  );
};

const TypewriterText = ({
  segments,
  typingSpeed = 50,
  pauseDuration = 3000
}: {
  segments: { text: string; className?: string }[];
  pauseDuration?: number;
  typingSpeed?: number;
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Pre-split segments into graphemes for safe Tamil rendering
  const splitSegments = React.useMemo(() => {
    return segments.map(seg => {
      // Use Intl.Segmenter if available (Chrome 87+, Safari 14.1+, Firefox 93+)
      if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        try {
          const segmenter = new (Intl as any).Segmenter('ta-IN', { granularity: 'grapheme' });
          return Array.from(segmenter.segment(seg.text)).map((s: any) => s.segment);
        } catch (e) {
          // Fallback if locale is not supported or other issue
          return seg.text.match(/[\u0B80-\u0BFF][\u0BBE-\u0BCD\u0BD7]*|[^\u0B80-\u0BFF]/g) || seg.text.split("");
        }
      }
      // Manual regex fallback for Tamil clusters
      return seg.text.match(/[\u0B80-\u0BFF][\u0BBE-\u0BCD\u0BD7]*|[^\u0B80-\u0BFF]/g) || seg.text.split("");
    });
  }, [segments]);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const totalChars = splitSegments.reduce((acc, chars) => acc + chars.length, 0);
    const totalTypingTime = totalChars * typingSpeed;
    const totalCycleTime = totalTypingTime + pauseDuration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const elapsed = progress % totalCycleTime;

      if (elapsed < totalTypingTime) {
        const globalCharIndex = Math.floor(elapsed / typingSpeed);

        let count = 0;
        let found = false;
        for (let i = 0; i < splitSegments.length; i++) {
          const segmentLen = splitSegments[i].length;
          if (globalCharIndex < count + segmentLen) {
            setCurrentTextIndex(i);
            setCurrentCharIndex(globalCharIndex - count + 1);
            found = true;
            break;
          }
          count += segmentLen;
        }
        if (!found) {
          setCurrentTextIndex(splitSegments.length - 1);
          setCurrentCharIndex(splitSegments[splitSegments.length - 1].length);
        }
      } else {
        setCurrentTextIndex(splitSegments.length - 1);
        setCurrentCharIndex(splitSegments[splitSegments.length - 1].length);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [splitSegments, typingSpeed, pauseDuration]);

  return (
    <span className="relative inline-flex flex-wrap items-center">
      {segments.map((segment, sIdx) => {
        const chars = splitSegments[sIdx];
        const visibleContent = sIdx < currentTextIndex
          ? chars.join('')
          : sIdx === currentTextIndex
            ? chars.slice(0, currentCharIndex).join('')
            : "";

        return (
          <span key={sIdx} className="relative inline-block whitespace-pre-wrap">
            <span className="invisible opacity-0 select-none">{segment.text}</span>
            <span className={`absolute top-0 left-0 whitespace-pre-wrap ${segment.className || ""}`}>
              {visibleContent}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default Dashboard;
