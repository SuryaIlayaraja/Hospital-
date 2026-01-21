import React, { useState } from "react";
import {
  Send,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useTickets, Ticket } from "../hooks/useTickets";

interface Props {
  onNavigateBack?: (tab: "dashboard") => void;
}

const RaiseTicketPage: React.FC<Props> = ({ onNavigateBack }) => {
  const { addTicket } = useTickets();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("General");
  const [issueCategory, setIssueCategory] = useState<"Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment">("Delay");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const handleDownload = (ticket: Ticket) => {
    const md = `# ${ticket.title}\n\n- Ticket ID: ${
      ticket.id
    }\n- Issue Category: ${ticket.issueCategory}\n- Severity: ${ticket.severity.toUpperCase()}\n- Department: ${
      ticket.department
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
      const newTicket = await addTicket({
        title,
        severity,
        description,
        department,
        issueCategory,
      });

      setCreatedTicket(newTicket);
      setSubmitStatus("success");
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setSeverity("medium");
        setDepartment("General");
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
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />
      
      {/* Header with Back Button */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-800 shadow-lg">
        <div className="w-full px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => onNavigateBack?.("dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              Raise an Issue Ticket
            </h1>
            <p className="text-gray-400">
              Report a problem or issue with the hospital system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Ticket Title <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder-gray-500"
              />
            </div>

            {/* Department, Severity, and Issue Category - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Department <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., IT, Admin, Frontend, Backend"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Issue Category <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) =>
                    setIssueCategory(e.target.value as "Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment")
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-white"
                >
                  <option value="Delay">Delay</option>
                  <option value="Misbehavior">Misbehavior</option>
                  <option value="Overcharging">Overcharging</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Severity Level <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "low" | "medium" | "high")
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
                >
                  <option value="low">Low - Minor issue</option>
                  <option value="medium">Medium - Important issue</option>
                  <option value="high">High - Critical issue</option>
                </select>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Detailed Description <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about the issue, including steps to reproduce if applicable (optional)"
                rows={8}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white placeholder-gray-500"
              />
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && createdTicket && (
              <div className="flex flex-col gap-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Ticket Submitted Successfully!</p>
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
                  Download Ticket as Markdown
                </button>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">Error Submitting Ticket</p>
                  <p className="text-sm text-red-300">
                    Please fill all required fields and try again.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => onNavigateBack?.("dashboard")}
                className="px-6 py-3 rounded-xl font-bold text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-all duration-300"
              >
                {submitStatus === "success" ? "Back to Dashboard" : "Cancel"}
              </button>
              {submitStatus !== "success" && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform transition-all duration-300 shadow-2xl ${
                    isSubmitting
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 hover:scale-105 hover:shadow-indigo-500/50"
                  }`}
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
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
