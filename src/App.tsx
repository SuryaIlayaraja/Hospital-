import React, { useState } from "react";
import {
  Guitar as Hospital,
  Users,
  UserCheck,
  Settings,
  Home,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import OPDFeedback from "./components/OPDFeedback";
import IPDFeedback from "./components/IPDFeedback";
import AdminPanel from "./components/AdminPanel";
import LanguageSwitcher from "./components/LanguageSwitcher";
import LoadingScreen from "./components/LoadingScreen";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import ReportNavbar from "./components/ReportNavbar";
import RaiseTicketPage from "./components/RaiseTicketPage";
import { GoogleOAuthProvider } from "@react-oauth/google";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "opd" | "ipd" | "admin" | "raise-ticket"
  >("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div
        className={`min-h-screen bg-[#0a0a0a] transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header - Only show when not on dashboard or raise-ticket */}
        {activeTab !== "dashboard" && activeTab !== "raise-ticket" && (
          <header className="relative bg-[#0a0a0a] shadow-lg border-b border-gray-800 overflow-hidden">
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
                    <h1 className="text-2xl font-bold text-white">
                      {t("hospital.name")}
                    </h1>
                    <p className="text-gray-400 font-medium">
                      {t("hospital.location")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LanguageSwitcher />
                  <ReportNavbar onOpen={() => setActiveTab("raise-ticket")} />
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit border border-gray-700/50">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </button>
                {activeTab !== "admin" && (
                  <>
                    <button
                      onClick={() => setActiveTab("opd")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        activeTab === "opd"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {t("nav.opd")}
                    </button>
                    <button
                      onClick={() => setActiveTab("ipd")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        activeTab === "ipd"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === "admin"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Admin
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
            />
          ) : activeTab === "raise-ticket" ? (
            <RaiseTicketPage onNavigateBack={(tab) => setActiveTab(tab)} />
          ) : activeTab === "admin" ? (
            <AdminPanel />
          ) : (
            <div className="w-full min-h-screen">
              {activeTab === "opd" ? <OPDFeedback /> : <IPDFeedback />}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 mt-0">
          <div className="w-full px-6 py-6 text-center text-gray-400">
            <p className="font-medium">{t("footer.copyright")}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
