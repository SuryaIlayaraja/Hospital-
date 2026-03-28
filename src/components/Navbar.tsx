import React, { useEffect, useState } from "react";
import { Moon, Sun, Ticket, Globe, Building2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface NavbarProps {
  onNavigate?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    // Check initial theme from document class
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navLinks = [
    { label: "OPD Feedback", id: "opd" },
    { label: "IPD Feedback", id: "ipd" },
    { label: "Admin", id: "admin" },
    { label: "About", id: "about" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full transition-colors duration-300 bg-[#f0f2f7] dark:bg-[#0d1117]">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#eef0f7] dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5 py-1.5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm font-bold tracking-wide text-[#5b21b6] dark:text-[#a78bfa]">
          HELP US SERVE YOU BETTER BY SHARING YOUR EXPERIENCE
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="w-full border-b border-gray-200 dark:border-gray-800/50 transition-colors duration-300 bg-[#f0f2f7] dark:bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side: Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.("home")}>
              <Building2 className="h-6 w-6 text-indigo-500" />
              <span className="text-lg font-bold text-[#1a1a2e] dark:text-white transition-colors duration-300">
                Vikram Hospital
              </span>
            </div>

            {/* Center: Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate?.(link.id)}
                  className="text-[#1a1a2e] dark:text-[#cbd5e1] font-medium hover:underline transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-[#1a1a2e]" />
                ) : (
                  <Sun className="h-5 w-5 text-[#cbd5e1]" />
                )}
              </button>

              {/* Raise Ticket Button */}
              <button
                onClick={() => onNavigate?.("ticket")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#e53e3e] text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded-lg transition-colors duration-300 font-medium whitespace-nowrap"
              >
                <Ticket className="h-4 w-4" />
                Raise Ticket
              </button>

              {/* Language Selector */}
              <button
                onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                className="flex items-center gap-1.5 p-2 text-[#1a1a2e] dark:text-[#cbd5e1] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium"
              >
                <Globe className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
