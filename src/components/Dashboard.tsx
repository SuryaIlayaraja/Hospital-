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
import { getActiveDoctors, Doctor } from "../services/apiService";

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

const ValueCard = ({ item, index }: { item: any; index: number }) => {
  const icons = [UserCheck, Shield, Users, Target, Lightbulb];
  const Icon = icons[index % icons.length];

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-500 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 transition-colors">
          <Icon className="h-6 w-6 text-gray-400 group-hover:text-indigo-400 transition-colors" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
          <ul className="space-y-2">
            {item.desc.map((bullet: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                <span className="text-indigo-500 mt-1">›</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  onNavigate?: (tab: "opd" | "ipd" | "admin") => void;
  onNavigateToTicket?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onNavigateToTicket,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ta" : "en");
  };

  // Translations
  const t = {
    en: {
      opdFeedback: "OPD Feedback",
      ipdFeedback: "IPD Feedback",
      admin: "Admin",
      about: "About",
      raiseTicket: "Raise Ticket",
      premiumHealthcare: "Premium Healthcare Essentials",
      elevateYour: "Elevate Your",
      healthcare: "Healthcare",
      subtitle: "Curated high-performance care for patients, families, and professionals. Experience the difference of quality healthcare.",
      shareFeedback: "Share Feedback",
      meetDoctors: "Meet Our Doctors",
      emergency247: "24/7 Emergency Services",
      emergencyDesc: "Free expedited care on all emergencies over priority. Get immediate assistance when you need it most.",
      expertDoctors: "Expert Doctors",
      expertDesc: "Every healthcare service comes with our comprehensive quality guarantee and experienced medical professionals.",
      premiumCare: "Premium Care",
      premiumDesc: "Hand-picked services that meet our high standards for excellence in patient care and satisfaction.",
      quickAccess: "Quick Access",
      shareExperience: "Share your experience",
      rateStay: "Rate your stay",
      viewAnalytics: "View analytics",
      getSupport: "Get support",
      backToHome: "Back to Home",
      medicalExcellence: "Medical Excellence",
      meetOur: "Meet Our",
      expertDoctorsTitle: "Expert Doctors",
      teamDesc: "Our team of highly qualified medical professionals dedicated to providing exceptional care and treatment.",
      loadingDoctors: "Loading our expert doctors...",
      noDoctors: "No Doctors Available",
      noDoctorsDesc: "Please check back later for our medical team information.",
      ourMission: "Our Mission",
      ourVision: "Our Vision",
      address: "Address",
      contactInfo: "Contact Information",
      ourValues: "Our Values",
      valuesItems: [
        {
          title: "Patient Centricity",
          desc: ["Commit to 'best outcomes and experience' for our patients", "Treat patients and their caregivers with compassion, care", "Our patients' needs will come first"]
        },
        {
          title: "Integrity",
          desc: ["Be principled, open and honest", "Model and live our 'Values'", "Demonstrate moral courage to speak up and do the right things"]
        },
        {
          title: "Teamwork",
          desc: ["Proactively support each other and operate as one team", "Respect and value people at all levels", "Demonstrate moral courage to speak up and do the right things"]
        },
        {
          title: "Ownership",
          desc: ["Be responsible and take pride in our actions", "Take initiative and go beyond the call of duty", "Deliver commitment and agreement made"]
        },
        {
          title: "Innovation",
          desc: ["Continuously improve and innovate to exceed expectations", "Adopt a 'can-do' attitude", "Challenge ourselves to do things differently"]
        }
      ]
    },
    ta: {
      opdFeedback: "வெளிநோயாளர் கருத்து",
      ipdFeedback: "உள்நோயாளர் கருத்து",
      admin: "நிர்வாகம்",
      about: "எங்களை பற்றி",
      raiseTicket: "புகார் பதிவு",
      premiumHealthcare: "சிறந்த சுகாதார சேவைகள்",
      elevateYour: "உங்கள்",
      healthcare: "சுகாதாரத்தை மேம்படுத்துங்கள்",
      subtitle: "நோயாளிகள், குடும்பங்கள் மற்றும் நிபுணர்களுக்கான உயர்தர சுகாதார சேவைகள். தரமான சுகாதாரத்தின் வித்தியாசத்தை அனுபவியுங்கள்.",
      shareFeedback: "கருத்து பகிர்",
      meetDoctors: "எங்கள் மருத்துவர்களை சந்திக்கவும்",
      emergency247: "24/7 அவசர சேவைகள்",
      emergencyDesc: "அனைத்து அவசர சேவைகளுக்கும் முன்னுரிமை அடிப்படையில் இலவச விரைவான சிகிச்சை. உங்களுக்கு தேவைப்படும் போது உடனடி உதவி பெறுங்கள்.",
      expertDoctors: "நிபுணர் மருத்துவர்கள்",
      expertDesc: "ஒவ்வொரு சுகாதார சேவையும் எங்கள் விரிவான தர உத்தரவாதம் மற்றும் அனுபவமிக்க மருத்துவ நிபுணர்களுடன் வருகிறது.",
      premiumCare: "சிறந்த பராமரிப்பு",
      premiumDesc: "நோயாளி பராமரிப்பு மற்றும் திருப்தியில் சிறந்து விளங்கும் எங்கள் உயர் தரத்தை பூர்த்தி செய்யும் சேவைகள்.",
      quickAccess: "விரைவு அணுகல்",
      shareExperience: "உங்கள் அனுபவத்தை பகிரவும்",
      rateStay: "உங்கள் தங்குமிடத்தை மதிப்பிடவும்",
      viewAnalytics: "பகுப்பாய்வு காண்க",
      getSupport: "ஆதரவு பெறுங்கள்",
      backToHome: "முகப்புக்கு திரும்பு",
      medicalExcellence: "மருத்துவ சிறப்பு",
      meetOur: "எங்கள்",
      expertDoctorsTitle: "நிபுணர் மருத்துவர்களை சந்திக்கவும்",
      teamDesc: "விதிவிலக்கான பராமரிப்பு மற்றும் சிகிச்சை வழங்குவதற்கு அர்ப்பணிக்கப்பட்ட எங்கள் உயர் தகுதி வாய்ந்த மருத்துவ நிபுணர்கள் குழு.",
      loadingDoctors: "எங்கள் நிபுணர் மருத்துவர்களை ஏற்றுகிறது...",
      noDoctors: "மருத்துவர்கள் இல்லை",
      noDoctorsDesc: "எங்கள் மருத்துவ குழு தகவலுக்கு பின்னர் சரிபார்க்கவும்.",
      ourMission: "எங்கள் நோக்கம்",
      ourVision: "எங்கள் பார்வை",
      address: "முகவரி",
      contactInfo: "தொடர்பு தகவல்",
      ourValues: "எங்கள் மதிப்புகள்",
      valuesItems: [
        {
          title: "நோயாளி மையம்",
          desc: ["எங்கள் நோயாளிகளுக்கு 'சிறந்த முடிவுகள் மற்றும் அனுபவத்தை' வழங்குதல்", "நோயாளிகள் மற்றும் அவர்களின் பராமரிப்பாளர்களை இரக்கத்துடன் நடத்துதல்", "எங்கள் நோயாளிகளின் தேவைகளுக்கு முன்னுரிமை அளிக்கப்படும்"]
        },
        {
          title: "நேர்மை",
          desc: ["கொள்கையுடையவராகவும், வெளிப்படையாகவும் மற்றும் நேர்மையாகவும் இருத்தல்", "எங்கள் 'மதிப்புகளை' பின்பற்றி வாழ்தல்", "சரியான விஷயங்களைச் செய்ய தைரியத்தை வெளிப்படுத்துதல்"]
        },
        {
          title: "குழுப்பணி",
          desc: ["ஒருவருக்கொருவர் ஆதரவளித்து ஒரு குழுவாக செயல்படுதல்", "அனைத்து மட்டங்களிலும் உள்ளவர்களை மதிக்கவும்", "சரியான விஷயங்களைச் செய்ய தைரியத்தை வெளிப்படுத்துதல்"]
        },
        {
          title: "உரிமை",
          desc: ["எங்கள் செயல்களில் பொறுப்பாகவும் பெருமையாகவும் இருத்தல்", "முயற்சி எடுத்து கடமைக்கு அப்பால் செயல்படுதல்", "வாக்குறுதிகளை நிறைவேற்றுதல்"]
        },
        {
          title: "புதுமை",
          desc: ["எதிர்பார்ப்புகளை மீற தொடர்ந்து முன்னேறுதல் மற்றும் புதுமைப்படுத்துதல்", "நேர்மறையான அணுகுமுறையை ஏற்றுக்கொள்வது", "வித்தியாசமாகச் செய்ய நம்மை நாமே சவால் விடுவது"]
        }
      ]
    },
  };

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
    "Your Perspective Matters: Helping Us Deliver World-Class Care Every Day.",
    "Committed to Excellence through Quality Care and Transparent Patient Feedback."
  ];
  const [badgeIndex, setBadgeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeIndex(prev => (prev + 1) % badgeMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Banner Interaction State
  const [hoveredBanner, setHoveredBanner] = useState<'black' | 'accent' | null>(null);

  // Rotating Notice Bar Logic
  const noticeMessages = [
    "We value your feedback on our services",
    "Help us serve you better by sharing your experience",
    "Feedback from In-patients and Out-patients is welcome"
  ];
  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % noticeMessages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Carousel Logic
  const heroImages = [
    {
      url: "/hero_doctors_nebula.png",
      alt: "Our Expert Doctors",
      title: "Expert Doctors"
    },
    {
      url: "/operational_theater.png",
      alt: "Modern Operational Theatre",
      title: "Advanced Facilities"
    },
    {
      url: "/patient_satisfied.png",
      alt: "Satisfied Patient",
      title: "Patient Satisfaction"
    }
  ];
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
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

        {/* Navigation Header */}
        <nav className="relative z-20 border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-bold">Vikram Hospital</span>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                {t[language].backToHome}
              </button>
            </div>
          </div>
        </nav>

        {/* About Content - Bento Grid Redesign */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header Section */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 hover:bg-white/10 transition-colors cursor-default">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-200">{t[language].about}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                {language === "en" ? "Redefining" : "மருத்துவ"}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                  {language === "en" ? "Healthcare" : "சேவை"}
                </span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
                {language === "en"
                  ? "Experience the convergence of compassion and advanced medical technology. Vikram ENT Hospital sets the benchmark for excellence in patient care."
                  : "கருணை மற்றும் மேம்பட்ட மருத்துவ தொழில்நுட்பத்தின் சங்கமத்தை அனுபவிக்கவும். விக்ரம் ENT மருத்துவமனை நோயாளி பராமரிப்பில் சிறந்து விளங்குவதற்கான அளவுகோலை அமைக்கிறது."}
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-auto">

            {/* 1. Mission Card - Large (4 cols) */}
            <div className="md:col-span-4 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-indigo-500/30">
                    <Star className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{t[language].ourMission}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                    {language === "en"
                      ? "To provide accessible, affordable, and quality healthcare services to all sections of society with compassion and dedication. We believe in healing with a human touch."
                      : "இரக்கம் மற்றும் அர்ப்பணிப்புடன் சமூகத்தின் அனைத்து பிரிவினருக்கும் அணுகக்கூடிய, மலிவு மற்றும் தரமான சுகாதார சேவைகளை வழங்குவது."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-300">
                    {language === "en" ? "Compassion" : "கருணை"}
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-300">
                    {language === "en" ? "Quality" : "தரம்"}
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-300">
                    {language === "en" ? "Dedication" : "அர்ப்பணிப்பு"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vision Card - Tall (2 cols) */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t[language].ourVision}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {language === "en"
                    ? "To be recognized as a leading healthcare institution known for clinical excellence and innovation."
                    : "மருத்துவ சிறப்பு மற்றும் புதுமைக்காக அறியப்பட்ட முன்னணி சுகாதார நிறுவனமாக அங்கீகரிக்கப்படுவது."}
                </p>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-3/4 rounded-full animate-pulse" />
                </div>
                <div className="mt-2 text-right text-xs text-purple-400 font-mono">
                  {language === "en" ? "GOAL IN PROGRESS" : "இலக்கு முன்னேற்றத்தில் உள்ளது"}
                </div>
              </div>
            </div>

            {/* 3. Facilities Ticker - Full Width (6 cols) */}
            <div className="md:col-span-6 overflow-hidden rounded-3xl bg-white/5 border border-white/10 py-8 relative">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

              <div className="flex animate-marquee hover:[animation-play-state:paused] gap-4 w-max px-4">
                {[...Array(2)].map((_, i) => (
                  <React.Fragment key={i}>
                    {(language === "en"
                      ? ["Advanced Diagnostic Center", "24/7 Emergency Services", "Modern Operation Theaters", "Intensive Care Units", "Pharmacy & Laboratory", "Patient Counseling Services"]
                      : ["மேம்பட்ட நோயறிதல் மையம்", "24/7 அவசர சேவைகள்", "நவீன அறுவை சிகிச்சை அரங்குகள்", "தீவிர சிகிச்சை பிரிவுகள்", "மருந்தகம் & ஆய்வகம்", "நோயாளி ஆலோசனை சேவைகள்"]
                    ).map((facility, index) => (
                      <div
                        key={`${i}-${index}`}
                        className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 px-6 py-3 rounded-full whitespace-nowrap"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 font-medium">{facility}</span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>

          {/* Our Values Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t[language].ourValues}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(t[language] as any).valuesItems.slice(0, 3).map((item: any, idx: number) => (
                <ValueCard key={idx} item={item} index={idx} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
              {(t[language] as any).valuesItems.slice(3, 5).map((item: any, idx: number) => (
                <ValueCard key={idx + 3} item={item} index={idx + 3} />
              ))}
            </div>
          </div>

          {/* Visit & Connect Section (Last) */}
          <div className="mt-24 pt-16 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Address */}
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t[language].address}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  {language === "en"
                    ? "123 Medical District, Healthcare City, State - 600001"
                    : "123 மருத்துவ மாவட்டம், சுகாதார நகரம், மாநிலம் - 600001"}
                </p>
              </div>

              {/* Contact Info */}
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Phone className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t[language].contactInfo}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 flex justify-between">
                    <span>Emergency:</span>
                    <span className="text-indigo-300 font-mono">+91 98765 43210</span>
                  </p>
                  <p className="text-gray-400 flex justify-between">
                    <span>Email:</span>
                    <span className="text-indigo-300">info@vikramhospital.com</span>
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 underline decoration-indigo-500/50 underline-offset-8">
                    {language === "en" ? "Connect With Us" : "எங்களுடன் இணையுங்கள்"}
                  </h3>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/50 transition-all text-gray-400 hover:text-[#1877F2]">
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#E4405F]/20 border border-white/10 hover:border-[#E4405F]/50 transition-all text-gray-400 hover:text-[#E4405F]">
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/50 transition-all text-gray-400 hover:text-[#1DA1F2]">
                      <Twitter className="h-6 w-6" />
                    </a>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-8">
                  © 2026 Vikram Hospital. All rights reserved.
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
      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

        {/* Navigation Header */}
        <nav className="relative z-20 border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-bold">Vikram Hospital</span>
              </div>
              <button
                onClick={() => setShowDoctors(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                {t[language].backToHome}
              </button>
            </div>
          </div>
        </nav>

        {/* Doctors Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Stethoscope className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">{t[language].medicalExcellence}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {t[language].meetOur}{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                {t[language].expertDoctorsTitle}
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t[language].teamDesc}
            </p>
          </div>

          {doctorsLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-lg">{t[language].loadingDoctors}</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="h-20 w-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">{t[language].noDoctors}</h3>
              <p className="text-gray-500">{t[language].noDoctorsDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  className="group bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10"
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
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors duration-300">
                      {doctor.name}
                    </h3>
                    {doctor.specialization && (
                      <p className="text-indigo-400 font-semibold mb-3 text-sm">
                        {doctor.specialization}
                      </p>
                    )}
                    {doctor.studies && (
                      <p className="text-gray-400 text-sm leading-relaxed">
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
    <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden">
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
        <nav className="border-b border-gray-800/50 bg-black/60 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-bold text-white">Vikram Hospital</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => onNavigate?.("opd")}
                  className="text-gray-300 hover:text-white transition-all duration-200 font-medium"
                >
                  {t[language].opdFeedback}
                </button>
                <button
                  onClick={() => onNavigate?.("ipd")}
                  className="text-gray-300 hover:text-white transition-all duration-200 font-medium"
                >
                  {t[language].ipdFeedback}
                </button>
                <button
                  onClick={() => onNavigate?.("admin")}
                  className="text-gray-300 hover:text-white transition-all duration-200 font-medium"
                >
                  {t[language].admin}
                </button>
                <button
                  onClick={() => setShowAbout(true)}
                  className="text-gray-300 hover:text-white transition-all duration-200 font-medium"
                >
                  {t[language].about}
                </button>
              </div>

              {/* Mobile Language Toggle */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </button>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={onNavigateToTicket}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-400 border border-red-600/20 rounded-lg hover:bg-red-600/20 hover:border-red-600/40 transition-all duration-300"
                >
                  <Ticket className="h-4 w-4" />
                  <span className="text-sm font-medium">{t[language].raiseTicket}</span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 group"
                >
                  <Globe className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">{language === "en" ? "EN" : "தமிழ்"}</span>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden py-4 border-t border-gray-800/50 flex flex-wrap gap-4">
              <button onClick={() => onNavigate?.("opd")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t[language].opdFeedback}</button>
              <button onClick={() => onNavigate?.("ipd")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t[language].ipdFeedback}</button>
              <button onClick={() => onNavigate?.("admin")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t[language].admin}</button>
              <button onClick={() => setShowAbout(true)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t[language].about}</button>
            </div>
          </div>
        </nav>

        {/* 3️⃣ Rotating Notice Bar */}
        <div className="relative w-full h-[52px] bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-center overflow-hidden">
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
                <span className="text-base font-semibold text-indigo-200/90 tracking-[0.1em] text-center uppercase drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]">
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
                        ? "opacity-100 translate-y-0 text-indigo-200"
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <TypewriterText
                typingSpeed={80}
                segments={[
                  { text: t[language].elevateYour + " ", className: "text-white" },
                  { text: t[language].healthcare, className: "bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent" }
                ]}
              />
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              {t[language].subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onNavigate?.("opd")}
                className="group flex items-center gap-3 px-10 py-5 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {t[language].shareFeedback}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleMeetDoctors}
                className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
              >
                <Stethoscope className="h-5 w-5" />
                {t[language].meetDoctors}
              </button>
            </div>
          </div>

          {/* Hero Image Carousel */}
          <div ref={heroRef} className="flex-[1.4] relative group w-full lg:w-[60%]">
            {/* Ambient Glow behind image */}
            <div className="absolute inset-x-0 -bottom-10 h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl rounded-full" />

            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.2)] transition-all duration-700 hover:scale-[1.03] hover:border-indigo-500/30 aspect-[4/3]">
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
                    <p className="text-white text-4xl sm:text-5xl md:text-6xl italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            {t[language].quickAccess}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate?.("opd")}
              className="group p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <Users className="h-8 w-8 text-blue-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t[language].opdFeedback}</h3>
              <p className="text-sm text-gray-400">{t[language].shareExperience}</p>
            </button>

            <button
              onClick={() => onNavigate?.("ipd")}
              className="group p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
            >
              <UserCheck className="h-8 w-8 text-green-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t[language].ipdFeedback}</h3>
              <p className="text-sm text-gray-400">{t[language].rateStay}</p>
            </button>

            <button
              onClick={() => onNavigate?.("admin")}
              className="group p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <BarChart3 className="h-8 w-8 text-purple-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t[language].admin}</h3>
              <p className="text-sm text-gray-400">{t[language].viewAnalytics}</p>
            </button>

            <button
              onClick={onNavigateToTicket}
              className="group p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10"
            >
              <AlertCircle className="h-8 w-8 text-red-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{t[language].raiseTicket}</h3>
              <p className="text-sm text-gray-400">{t[language].getSupport}</p>
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
          <div className="group bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all duration-300">
                <Zap className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t[language].emergency247}</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {t[language].emergencyDesc}
            </p>
          </div>

          {/* Quality Guarantee -> Expert Doctors */}
          <div className="group bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-all duration-300">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t[language].expertDoctors}</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {t[language].expertDesc}
            </p>
          </div>

          {/* Premium Selection -> Quality Healthcare */}
          <div className="group bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all duration-300">
                <Star className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">{t[language].premiumCare}</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {t[language].premiumDesc}
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
          className={`absolute w-[260%] h-28 bg-black border-y-2 border-white/10 -rotate-[18deg] flex items-center shadow-[0_0_60px_rgba(0,0,0,0.6)] z-10 transition-all duration-500 cursor-crosshair pointer-events-auto ${hoveredBanner === 'accent' ? 'blur-[6px] opacity-40 scale-[0.98]' : 'blur-0 opacity-100 scale-100'
            }`}
        >
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-5xl font-bold text-white/20 px-16 flex items-center gap-8 uppercase tracking-tighter">
                VIKRAM HOSPITAL <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> EXPERT CARE <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> ADVANCED TECHNOLOGY <Plus className="h-10 w-10 text-white/40 animate-spin-slow" /> TRUSTED HEALING
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
                QUALITY CARE <Dna className="h-12 w-12 text-white animate-spin-slow" /> TRANSPARENT FEEDBACK <Dna className="h-12 w-12 text-white animate-spin-slow" /> BETTER HEALING <Dna className="h-12 w-12 text-white animate-spin-slow" /> PATIENT FIRST
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Centres Of Excellence Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Centres Of <span className="text-[#d946ef] drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">Excellence</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Combining the best specialists and equipment to provide you nothing short of the best in healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cardiology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors duration-500">
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Cardiology</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500" />
          </div>

          {/* Orthopedics */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors duration-500">
                <Bone className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Orthopedics</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-500" />
          </div>

          {/* Oncology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors duration-500">
                <Microscope className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Oncology</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          </div>

          {/* Neurology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors duration-500">
                <Brain className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Neurology</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
          </div>

          {/* Gastroenterology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors duration-500">
                <Activity className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Gastroenterology</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
          </div>

          {/* Nephrology & Urology */}
          <div className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20 transition-colors duration-500">
                <Droplets className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white/90">Nephrology & Urology</h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
          </div>
        </div>
      </div>

      {/* Welcome To Vikram ENT Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Welcome To <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Vikram ENT</span> —
            <br className="hidden sm:block" /> The International Leader in <span className="text-[#d946ef]">ENT Care</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
            Looking for the best <span className="text-white font-semibold">ENT Hospital in Coimbatore</span> that not only treats you but truly understands what you’re going through?
            Vikram ENT Hospital and Research Institute has offered the best compassionate and specialised care for your ear, nose and throat conditions since <span className="text-indigo-400 font-bold">1972</span>.
          </p>
        </div>

        <div ref={statsRef} className="relative group">
          {/* Subtle background glow for the stats grid */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full w-full bg-indigo-500/5 blur-[120px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 py-8">
            {/* Stat 1: Years of Experience */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-6xl font-bold text-white mb-2 group-hover/stat:text-indigo-400 transition-colors">
                  <CountUpNumber endValue={55} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-400 text-lg font-medium leading-tight">Years of <br /> Experience</div>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover/stat:bg-indigo-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Clock className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 2: Doctors */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-6xl font-bold text-white mb-2 group-hover/stat:text-purple-400 transition-colors">
                  <CountUpNumber endValue={20} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-400 text-lg font-medium leading-tight">Expert <br /> Doctors</div>
              </div>
              <div className="p-5 rounded-2xl bg-purple-500/10 text-purple-400 group-hover/stat:bg-purple-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Users className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 3: Procedures */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold text-white mb-2 group-hover/stat:text-pink-400 transition-colors">
                  <CountUpNumber endValue={500000} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-400 text-lg font-medium leading-tight">Successful <br /> Procedures</div>
              </div>
              <div className="p-5 rounded-2xl bg-pink-500/10 text-pink-400 group-hover/stat:bg-pink-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <Activity className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>

            {/* Stat 4: Lives Touched */}
            <div className="group/stat relative px-8 py-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 flex items-center justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold text-white mb-2 group-hover/stat:text-cyan-400 transition-colors">
                  <CountUpNumber endValue={5000000} startTrigger={statsVisible} />+
                </div>
                <div className="text-gray-400 text-lg font-medium leading-tight">Lives <br /> Touched</div>
              </div>
              <div className="p-5 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover/stat:bg-cyan-500/20 group-hover/stat:scale-110 transition-all duration-500">
                <UserCheck className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Dedication Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6 animate-pulse-slow">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-semibold text-red-400 uppercase tracking-widest">Patient Lifeline</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Committed to the <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">Flow of Healing</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          At Vikram ENT, every pulse and every procedure is dedicated to your complete recovery and well-being.
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

  const segmentsKey = JSON.stringify(segments);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const totalChars = segments.reduce((acc, seg) => acc + seg.text.length, 0);
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
        for (let i = 0; i < segments.length; i++) {
          const segmentLen = segments[i].text.length;
          if (globalCharIndex < count + segmentLen) {
            setCurrentTextIndex(i);
            setCurrentCharIndex(globalCharIndex - count + 1);
            found = true;
            break;
          }
          count += segmentLen;
        }
        if (!found) {
          setCurrentTextIndex(segments.length - 1);
          setCurrentCharIndex(segments[segments.length - 1].text.length);
        }
      } else {
        setCurrentTextIndex(segments.length - 1);
        setCurrentCharIndex(segments[segments.length - 1].text.length);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [segmentsKey, typingSpeed, pauseDuration]);

  return (
    <span className="relative inline-flex flex-wrap items-center">
      {segments.map((segment, sIdx) => (
        <span key={sIdx} className="relative inline-block whitespace-pre">
          <span className="invisible opacity-0 select-none">{segment.text}</span>
          <span className={`absolute top-0 left-0 whitespace-pre ${segment.className || ""}`}>
            {sIdx < currentTextIndex
              ? segment.text
              : sIdx === currentTextIndex
                ? segment.text.slice(0, currentCharIndex)
                : ""}
          </span>
        </span>
      ))}
    </span>
  );
};

export default Dashboard;
