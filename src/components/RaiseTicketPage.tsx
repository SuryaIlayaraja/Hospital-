import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Send,
  CheckCircle,
  ArrowLeft,
  Download,
  MessageSquare,
  History,
  Clock as ClockIcon,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useTickets, Ticket } from "../hooks/useTickets";
import TicketChat from "./TicketChat";
import { useAuth0 } from "@auth0/auth0-react";

import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  onNavigateBack?: (tab: "dashboard") => void;
}

const RaiseTicketPage: React.FC<Props> = ({ onNavigateBack }) => {
  const { t } = useLanguage();
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0();

  // For tickets API, we might still need a token if the backend requires it.
  // For now, we'll assume the backend can handle Auth0 sub as clerkUserId or similar.
  const { addTicket, tickets, refetch } = useTickets({ 
    getClerkToken: useCallback(async () => null, []) // Auth0 token logic could be added here if needed
  });

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [refetch, isAuthenticated]);

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Nursing");
  const [issueCategory, setIssueCategory] = useState<"Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment">("Delay");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState<Ticket | null>(null);
  const [patientChatToken, setPatientChatToken] = useState<string | null>(null);

  /** Tickets raised under this Auth0 account, or any ticket that has a chat token saved on this device. */
  const patientTickets = useMemo(() => {
    const uid = user?.sub;
    const filtered = tickets.filter((t) => {
      if (uid && t.clerkUserId === uid) return true;
      try {
        if (localStorage.getItem(`ticket_chat_token:${t.id}`)) return true;
      } catch {
        /* private mode / no storage */
      }
      return false;
    });
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tickets, user?.sub]);

  const handleDownload = (ticket: Ticket) => {
    const md = `# ${ticket.title}\n\n- Ticket ID: ${ticket.id
      }\n- Issue Category: ${ticket.issueCategory}\n- Severity: ${ticket.severity.toUpperCase()}\n- Department: ${ticket.department
      }\n- Date: ${new Date(
        ticket.createdAt
      ).toISOString()}\n\n## Description\n\n${ticket.description}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticket.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addTicket({
        title,
        severity,
        description,
        department,
        issueCategory,
      }, user?.sub);

      setCreatedTicket(result.ticket);
      setPatientChatToken(result.patientChatToken || null);
      if (result.patientChatToken) {
        localStorage.setItem(
          `ticket_chat_token:${result.ticket.id}`,
          result.patientChatToken
        );
      }
      setSubmitStatus("success");
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setSeverity("medium");
        setDepartment("Nursing");
        setIssueCategory("Delay");
      }, 1000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreviousChat = (ticket: Ticket) => {
    setActiveChatTicket(ticket);
    const storedToken = localStorage.getItem(`ticket_chat_token:${ticket.id}`);
    setPatientChatToken(storedToken);
    setIsChatOpen(true);
  };

  const handleLogout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold">Authenticating Support Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
        {/* Header with Back Button */}
        <div className="relative z-10 bg-gray-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="w-full px-6 py-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateBack?.("dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("ticket.back")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Secure Support Access</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Please sign in to your verified support account to raise new tickets or view your history.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
                {error.message}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => loginWithRedirect()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
              >
                Log In
              </button>
              <button
                onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                className="w-full py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-2xl font-black text-lg transition-all active:scale-95"
              >
                Create Account
              </button>
            </div>
            <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
              Your support identity is protected by Auth0 Enterprise Security
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 dark:from-gray-900/50 to-transparent pointer-events-none" />

      {/* Header with Back Button */}
      <div className="relative z-10 bg-gray-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="w-full px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateBack?.("dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("ticket.back")}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                 <History className="h-4 w-4 text-indigo-400" />
                 <span className="text-sm font-bold text-indigo-400">{patientTickets.length} Active Tickets</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Support User</span>
                <span className="text-sm font-black text-indigo-400 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all duration-300 font-bold text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              {t("ticket.title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t("ticket.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 pb-8 px-4 sm:px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-12 xl:col-span-8">
          <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t("ticket.form.title")} <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("ticket.form.titlePlaceholder")}
                  required
                  className="w-full px-4 py-4 bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Department, Severity, and Issue Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t("ticket.form.department")} <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white"
                  >
                    <option value="Nursing">{t("ticket.dept.nursing")}</option>
                    <option value="Operations">{t("ticket.dept.operations")}</option>
                    <option value="House Keeping">{t("ticket.dept.housekeeping")}</option>
                    <option value="Maintenance">{t("ticket.dept.maintenance")}</option>
                    <option value="Medical">{t("ticket.dept.medical")}</option>
                    <option value="F&B">{t("ticket.dept.fb")}</option>
                    <option value="Security">{t("ticket.dept.security")}</option>
                    <option value="Transport">{t("ticket.dept.transport")}</option>
                    <option value="IT">{t("ticket.dept.it")}</option>
                    <option value="Laundry">{t("ticket.dept.laundry")}</option>
                    <option value="Billing">{t("ticket.dept.billing")}</option>
                    <option value="Insurance / TPA">{t("ticket.dept.insurance")}</option>
                    <option value="MRD">{t("ticket.dept.mrd")}</option>
                    <option value="Lab">{t("ticket.dept.lab")}</option>
                    <option value="Radiology">{t("ticket.dept.radiology")}</option>
                    <option value="Blood Bank">{t("ticket.dept.bloodbank")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t("ticket.form.category")} <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) =>
                      setIssueCategory(e.target.value as "Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment")
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 dark:text-white"
                  >
                    <option value="Delay">{t("ticket.category.delay")}</option>
                    <option value="Misbehavior">{t("ticket.category.misbehavior")}</option>
                    <option value="Overcharging">{t("ticket.category.overcharging")}</option>
                    <option value="Hygiene">{t("ticket.category.hygiene")}</option>
                    <option value="Equipment">{t("ticket.category.equipment")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t("ticket.form.severity")} <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={severity}
                    onChange={(e) =>
                      setSeverity(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t("ticket.severity.low")}</option>
                    <option value="medium">{t("ticket.severity.medium")}</option>
                    <option value="high">{t("ticket.severity.high")}</option>
                  </select>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t("ticket.form.description")} <span className="text-gray-500 text-xs">({t("ticket.form.optional")})</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("ticket.form.descriptionPlaceholder")}
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && createdTicket && (
                <div className="flex flex-col gap-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 px-6 py-5 rounded-3xl backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 rounded-full p-2 shadow-lg shadow-emerald-500/50">
                       <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-xl">{t("ticket.success.title")}</p>
                      <p className="text-sm font-bold opacity-80">
                        Ticket ID: <span className="font-mono">{createdTicket.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(createdTicket)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 rounded-xl font-black transition-all duration-300"
                    >
                      <Download className="h-4 w-4" />
                      {t("ticket.success.download")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChatTicket(createdTicket);
                        setIsChatOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black transition-all duration-300 shadow-xl shadow-indigo-500/30 transform active:scale-95"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t("ticket.success.chat")}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => onNavigateBack?.("dashboard")}
                  className="px-8 py-3 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  {submitStatus === "success" ? t("ticket.back") : t("ticket.form.cancel")}
                </button>
                {submitStatus !== "success" && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform transition-all duration-300 shadow-2xl ${isSubmitting
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 hover:scale-105 hover:shadow-indigo-500/50"
                      }`}
                  >
                    <Send className="h-5 w-5" />
                    {isSubmitting ? "Submitting..." : t("ticket.form.submit")}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket History */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-white dark:bg-gray-900/40 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <History className="h-6 w-6 text-indigo-400" />
                 </div>
                 <h2 className="text-xl font-black">{t("ticket.history.title") || "Previous Support Tickets"}</h2>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {t("ticket.history.resumeHint")}
              </p>
              
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                 {patientTickets.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                       <ClockIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 opacity-50" />
                       <p className="text-gray-500 dark:text-gray-400 font-medium">No previous tickets found.</p>
                    </div>
                 ) : (
                    patientTickets.map((ticket) => (
                       <div 
                         key={ticket.id}
                         className="group bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300"
                       >
                          <div className="flex items-start justify-between mb-2">
                             <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                                ticket.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 
                                ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' : 
                                'bg-orange-500/10 text-orange-400'
                             }`}>
                                {ticket.status}
                             </span>
                             <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">{ticket.title}</h3>
                          <div className="flex items-center gap-3 mt-4">
                             <button 
                                onClick={() => openPreviousChat(ticket)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500/10 hover:bg-indigo-500 rounded-xl text-indigo-400 hover:text-white text-xs font-black transition-all duration-300"
                             >
                                <MessageSquare className="h-3 w-3" />
                                {t("ticket.history.chat") || "Chat"}
                             </button>
                             <button 
                                onClick={() => handleDownload(ticket)}
                                className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl text-gray-500 dark:text-gray-400 transition-all"
                             >
                                <Download className="h-3 w-3" />
                             </button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

      </div>

      {/* Chat Sidebar/Modal */}
      {isChatOpen && activeChatTicket && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl h-[85vh] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <TicketChat
                ticketId={activeChatTicket.id}
                role="patient"
                clerkUserId={user?.sub}
                patientChatToken={
                  patientChatToken ||
                  localStorage.getItem(`ticket_chat_token:${activeChatTicket.id}`) ||
                  undefined
                }
                onClose={() => setIsChatOpen(false)}
                title={`Support Case: ${activeChatTicket.id}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaiseTicketPage;
