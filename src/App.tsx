import React, { useState, useEffect } from "react";
import {
  Guitar as Hospital,
  Users,
  UserCheck,
  Settings,
  Home,
  Phone,
  Mail,
  ArrowUp,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import OPDFeedback from "./components/OPDFeedback";
import IPDFeedback from "./components/IPDFeedback";
import AdminPanel from "./components/AdminPanel";
import LanguageSwitcher from "./components/LanguageSwitcher";
import LoadingScreen from "./components/LoadingScreen";
import ThemeToggle from "./components/ThemeToggle";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
} from "@clerk/clerk-react";

import ReportNavbar from "./components/ReportNavbar";
import RaiseTicketPage from "./components/RaiseTicketPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getHospitalSettings, HospitalSettings } from "./services/apiService";

const WhatsappIcon = ({ className, fill = "currentColor" }: { className?: string; fill?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const AppContent: React.FC = () => {
  // Sync activeTab with localStorage to survive OAuth reloads
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "opd" | "ipd" | "admin" | "raise-ticket"
  >(() => {
    // 1. Try to get from URL hash first
    const hash = window.location.hash.replace("#", "");
    const validTabs = ["dashboard", "opd", "ipd", "admin", "raise-ticket"];
    if (validTabs.includes(hash)) {
      return hash as any;
    }
    // 2. Fallback to localStorage
    const saved = localStorage.getItem("active_tab");
    return (saved as any) || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
    // Sync URL hash with the current tab
    if (window.location.hash.replace("#", "") !== activeTab) {
      window.history.pushState(null, "", `#${activeTab}`);
    }
  }, [activeTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["dashboard", "opd", "ipd", "admin", "raise-ticket"];
      if (validTabs.includes(hash) && hash !== activeTab) {
        setActiveTab(hash as any);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeTab]);

  const [isLoading, setIsLoading] = useState(true);
  const { t, setHospitalName } = useLanguage();
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);

  useEffect(() => {
    // Initial load from cache
    const cachedSettings = localStorage.getItem('hospital_settings');
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings);
        setHospitalSettings(parsed);
        setHospitalName(parsed.hospital_name);
      } catch (e) {
        console.error("Failed to parse cached hospital settings", e);
      }
    }

    const loadSettings = async () => {
      try {
        const response = await getHospitalSettings();
        if (response.success && response.data) {
          setHospitalSettings(response.data);
          setHospitalName(response.data.hospital_name);
          // Update cache
          localStorage.setItem('hospital_settings', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Failed to load global hospital settings:", error);
      }
    };

    // Expose for child components
    (window as any).refreshSettings = loadSettings;
    loadSettings();
  }, [setHospitalName]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          onComplete={handleLoadingComplete} 
          hospitalName={hospitalSettings?.hospital_name} 
        />
      )}
      <div
        className={`min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"
          }`}
      >
        {/* Header - Only show when not on dashboard or raise-ticket */}
        {activeTab !== "dashboard" && activeTab !== "raise-ticket" && (
          <header className="relative bg-white dark:bg-[#0a0a0a] shadow-lg border-b border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Background Doctor Image */}
            <div
              className="absolute inset-0 opacity-5 bg-cover bg-center bg-no-repeat pointer-events-none"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
              }}
            />

            {/* Content overlay */}
            <div className="relative z-10 w-full px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Hospital className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hospitalSettings?.hospital_name || t("hospital.name")}
                    </h1>
                    <p className="text-gray-400 font-medium">
                      {hospitalSettings?.hospital_location || t("hospital.location")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <LanguageSwitcher />
                  <ReportNavbar onOpen={() => setActiveTab("raise-ticket")} />
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg w-fit border border-gray-200 dark:border-gray-700/50">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50"
                >
                  <Home className="h-4 w-4" />
                  {t("nav.dashboard")}
                </button>
                {activeTab !== "admin" && (
                  <>
                    <button
                      onClick={() => setActiveTab("opd")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${activeTab === "opd"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      <Users className="h-4 w-4" />
                      {t("nav.opd")}
                    </button>
                    <button
                      onClick={() => setActiveTab("ipd")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${activeTab === "ipd"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      {t("nav.ipd")}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${activeTab === "admin"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                >
                  <Settings className="h-4 w-4" />
                  {t("nav.admin")}
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="w-full">
          {activeTab === "dashboard" ? (
            <Dashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onNavigateToTicket={() => setActiveTab("raise-ticket")}
              hospitalSettings={hospitalSettings}
            />
          ) : activeTab === "admin" ? (
            <div className="relative">
               <div className="absolute top-6 right-6 z-[100]">
                  <UserButton afterSignOutUrl="/" />
               </div>
               <AdminPanel onSettingsUpdate={() => (window as any).refreshSettings?.()} />
            </div>
          ) : (
            <div className="w-full min-h-screen">
              <SignedIn>
                {/* Global User Button for non-dashboard views */}
                <div className="fixed top-6 right-6 z-[100]">
                  <UserButton afterSignOutUrl="/" />
                </div>
                
                {activeTab === "raise-ticket" ? (
                  <RaiseTicketPage onNavigateBack={(tab) => setActiveTab(tab)} />
                ) : activeTab === "opd" ? (
                  <OPDFeedback />
                ) : (
                  <IPDFeedback />
                )}
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-[#060606] relative">
                  <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-white/5 text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Hospital className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Patient Portal</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">Please sign in to access feedback forms and support tickets.</p>
                    
                    <div className="flex justify-center transform scale-110">
                      <SignIn 
                        routing="hash" 
                        afterSignInUrl={window.location.href}
                        afterSignUpUrl={window.location.href}
                      />
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className="mt-8 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline underline-offset-4 transition-colors"
                    >
                      ← Back to Home
                    </button>
                  </div>
                </div>
              </SignedOut>
            </div>
          )}
        </main>

        {/* Custom Application Footer */}
        <div className="relative mt-auto">
          {/* CTA Banner Section */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 py-16 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg')] opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
                {t("cta.title")}
              </h2>
              <p className="text-blue-50 dark:text-indigo-200 text-lg md:text-xl mb-10 font-medium drop-shadow">
                {t("cta.subtitle")}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {[
                  { icon: WhatsappIcon, label: t("cta.chat"), href: hospitalSettings?.chat_support_link || `https://wa.me/${hospitalSettings?.whatsapp_number?.replace(/\s+/g, '')}` || "#" },
                  { icon: Phone, label: t("cta.call"), href: hospitalSettings?.contact_phone ? `tel:${hospitalSettings.contact_phone}` : "#" },
                  { icon: Mail, label: t("cta.email"), href: hospitalSettings?.contact_email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${hospitalSettings.contact_email}` : "#" }
                ].map((item, idx) => (
                  <a 
                    key={idx}
                    href={item.href}
                    target={item.href.startsWith('http') ? "_blank" : undefined}
                    rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    className="group flex flex-col items-center justify-center p-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 hover:bg-white/25 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                    title={item.label}
                  >
                    <item.icon className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <footer className="bg-white dark:bg-[#060606] border-t border-gray-100 dark:border-white/5 py-6">
            <div className="w-full px-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 dark:text-gray-400 text-sm max-w-7xl mx-auto">
              <p className="font-medium mb-4 sm:mb-0">
                © {new Date().getFullYear()} {hospitalSettings?.hospital_name || t("hospital.name")}. {t("footer.rightsReserved") || "All rights reserved."}
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300 font-medium"
              >
                {t("footer.backToTop")}
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>


      </div>
    </>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
