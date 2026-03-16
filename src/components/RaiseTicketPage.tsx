import React, { useState } from "react";
import {
  Send,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useTickets, Ticket } from "../hooks/useTickets";
import TicketChat from "./TicketChat";
import PatientLoginModal from "./PatientLoginModal";

import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  onNavigateBack?: (tab: "dashboard") => void;
}

const RaiseTicketPage: React.FC<Props> = ({ onNavigateBack }) => {
  const { t } = useLanguage();
  const { addTicket } = useTickets();
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
  const [patientChatToken, setPatientChatToken] = useState<string | null>(null);
  const [showPatientLogin, setShowPatientLogin] = useState(false);

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

    // Require patient OTP login before creating ticket
    const patientToken = localStorage.getItem("patientToken");
    if (!patientToken) {
      setShowPatientLogin(true);
      return;
    }

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
      });

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

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 dark:from-gray-900/50 to-transparent pointer-events-none" />

      {/* Header with Back Button */}
      <div className="relative z-10 bg-gray-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="w-full px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => onNavigateBack?.("dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              {t("ticket.back")}
            </button>
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
      <div className="relative z-10 pt-8 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <PatientLoginModal
            isOpen={showPatientLogin}
            onClose={() => setShowPatientLogin(false)}
          />
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
                className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Department, Severity, and Issue Category - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t("ticket.form.department")} <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 dark:text-white"
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
                rows={8}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && createdTicket && (
              <div className="flex flex-col gap-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{t("ticket.success.title")}</p>
                    <p className="text-sm text-green-300">
                      Ticket ID: {createdTicket.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(createdTicket)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl font-bold transition-colors duration-150"
                >
                  <Download className="h-5 w-5" />
                  {t("ticket.success.download")}
                </button>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-200 rounded-xl font-bold transition-colors duration-150"
                >
                  {t("ticket.success.chat")}
                </button>
              </div>
            )}

            {/* Chat Sidebar */}
            {isChatOpen && createdTicket && (
              <div className="fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setIsChatOpen(false)}
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl h-[80vh] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4">
                    <TicketChat
                      ticketId={createdTicket.id}
                      role="patient"
                      patientChatToken={
                        patientChatToken ||
                        localStorage.getItem(`ticket_chat_token:${createdTicket.id}`) ||
                        undefined
                      }
                      onClose={() => setIsChatOpen(false)}
                      title={`Chat with Admin • ${createdTicket.id}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">{t("ticket.error.title")}</p>
                  <p className="text-sm text-red-300">
                    {t("ticket.error.desc")}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => onNavigateBack?.("dashboard")}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                {submitStatus === "success" ? t("ticket.back") : t("ticket.form.cancel")}
              </button>
              {submitStatus !== "success" && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform transition-all duration-300 shadow-2xl ${isSubmitting
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
    </div>
  );
};

export default RaiseTicketPage;
