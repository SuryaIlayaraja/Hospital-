import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Default questions (fallbacks) ──────────────────────────────────────────
export const DEFAULT_OPD_QUESTIONS = [
  { id: "appointmentBooking", label: "Ease of Appointment Booking", enabled: true },
  { id: "receptionStaff", label: "Courtesy of Reception Staff", enabled: true },
  { id: "billingProcess", label: "Efficiency of Billing Process", enabled: true },
  { id: "nursingCare", label: "Quality of Nursing Care", enabled: true },
  { id: "labStaffSkilled", label: "Skill of Lab Staff", enabled: true },
  { id: "labWaitingTime", label: "Lab Waiting Time", enabled: true },
  { id: "radiologyStaffSkilled", label: "Skill of Radiology Staff", enabled: true },
  { id: "radiologyWaitingTime", label: "Radiology Waiting Time", enabled: true },
  { id: "pharmacyWaitingTime", label: "Pharmacy Waiting Time", enabled: true },
  { id: "medicationDispensed", label: "Medication Dispensing Speed", enabled: true },
  { id: "drugExplanation", label: "Explanation of Drugs", enabled: true },
  { id: "counsellingSession", label: "Quality of Counselling Session", enabled: true },
  { id: "audiologyStaffSkilled", label: "Skill of Audiology Staff", enabled: true },
  { id: "hospitalCleanliness", label: "Cleanliness of the Hospital", enabled: true },
];

export const DEFAULT_IPD_QUESTIONS = [
  { id: "registrationProcess", label: "Registration Process", enabled: true },
  { id: "roomReadiness", label: "Room Readiness on Admission", enabled: true },
  { id: "roomCleanliness", label: "Cleanliness of Patient Room", enabled: true },
  { id: "doctorExplanation", label: "Explanation by Doctor", enabled: true },
  { id: "nurseCommunication", label: "Nurse Communication", enabled: true },
  { id: "planExplanation", label: "Explanation of Treatment Plan", enabled: true },
  { id: "promptnessAttending", label: "Promptness in Attending Calls", enabled: true },
  { id: "pharmacyTimeliness", label: "Timeliness of Pharmacy Services", enabled: true },
  { id: "billingCourtesy", label: "Courtesy of Billing Staff", enabled: true },
  { id: "operationsHospitality", label: "Hospitality & Services", enabled: true },
  { id: "dischargeProcess", label: "Discharge Process Coordination", enabled: true },
];

export const STORAGE_KEY_OPD = "custom_opd_questions";
export const STORAGE_KEY_IPD = "custom_ipd_questions";

export type FeedbackQuestion = {
  id: string;
  label: string;
  enabled: boolean;
};

function loadQuestions(key: string, defaults: FeedbackQuestion[]): FeedbackQuestion[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaults;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

const FeedbackQuestionsEditor: React.FC<Props> = ({ onClose }) => {
  const [activeForm, setActiveForm] = useState<"opd" | "ipd">("opd");
  const [opdQuestions, setOpdQuestions] = useState<FeedbackQuestion[]>(() =>
    loadQuestions(STORAGE_KEY_OPD, DEFAULT_OPD_QUESTIONS)
  );
  const [ipdQuestions, setIpdQuestions] = useState<FeedbackQuestion[]>(() =>
    loadQuestions(STORAGE_KEY_IPD, DEFAULT_IPD_QUESTIONS)
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [newLabel, setNewLabel] = useState("");
  const [newId, setNewId] = useState("");

  const questions = activeForm === "opd" ? opdQuestions : ipdQuestions;
  const setQuestions = activeForm === "opd" ? setOpdQuestions : setIpdQuestions;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleLabelChange = (index: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label: value };
      return updated;
    });
  };

  const handleToggle = (index: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return updated;
    });
  };

  const handleDelete = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    setQuestions((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  };

  const handleAddQuestion = () => {
    const trimLabel = newLabel.trim();
    const trimId = newId.trim().replace(/\s+/g, "_");
    if (!trimLabel) return;

    // Generate a unique id if blank
    const finalId = trimId || `custom_${Date.now()}`;

    // Prevent duplicate ids
    if (questions.some((q) => q.id === finalId)) {
      alert("A question with this ID already exists. Please use a different ID.");
      return;
    }

    setQuestions((prev) => [...prev, { id: finalId, label: trimLabel, enabled: true }]);
    setNewLabel("");
    setNewId("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_OPD, JSON.stringify(opdQuestions));
      localStorage.setItem(STORAGE_KEY_IPD, JSON.stringify(ipdQuestions));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    if (!confirm("This will reset to default questions. All customisations will be lost. Continue?")) return;
    if (activeForm === "opd") {
      setOpdQuestions([...DEFAULT_OPD_QUESTIONS]);
    } else {
      setIpdQuestions([...DEFAULT_IPD_QUESTIONS]);
    }
  };

  const handleResetAll = () => {
    if (!confirm("This will reset BOTH OPD and IPD questions to defaults. Continue?")) return;
    setOpdQuestions([...DEFAULT_OPD_QUESTIONS]);
    setIpdQuestions([...DEFAULT_IPD_QUESTIONS]);
    localStorage.removeItem(STORAGE_KEY_OPD);
    localStorage.removeItem(STORAGE_KEY_IPD);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-indigo-600/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feedback Questions Editor</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customise OPD & IPD questions shown to patients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* ── Form Tabs ── */}
        <div className="flex gap-2 px-6 pt-4 flex-shrink-0">
          {(["opd", "ipd"] as const).map((form) => (
            <button
              key={form}
              onClick={() => setActiveForm(form)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeForm === form
                  ? form === "opd"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              {form.toUpperCase()} Feedback
              <span className="ml-2 text-xs opacity-70">({(form === "opd" ? opdQuestions : ipdQuestions).length} questions)</span>
            </button>
          ))}
        </div>

        {/* ── Question List (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No questions yet. Add one below.</p>
            </div>
          )}
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                q.enabled
                  ? "bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10 hover:border-indigo-400/40"
                  : "bg-gray-50 dark:bg-black/20 border-gray-100 dark:border-white/5 opacity-60"
              }`}
            >
              {/* drag handle placeholder */}
              <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

              {/* index badge */}
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-6 text-center flex-shrink-0">
                {idx + 1}
              </span>

              {/* Editable label */}
              <input
                type="text"
                value={q.label}
                onChange={(e) => handleLabelChange(idx, e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-sm font-medium text-gray-800 dark:text-white focus:outline-none border-b border-transparent focus:border-indigo-400 transition-colors py-0.5"
              />

              {/* Field ID (read-only) */}
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 hidden sm:inline-block flex-shrink-0 px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                {q.id}
              </span>

              {/* Move up/down */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="h-3 w-3 text-gray-400" />
                </button>
                <button
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === questions.length - 1}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              </div>

              {/* Toggle enabled */ }
              <button
                onClick={() => handleToggle(idx)}
                title={q.enabled ? "Disable question" : "Enable question"}
                className={`flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 relative border border-black/5 dark:border-white/10 ${
                  q.enabled 
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                    : "bg-gray-300 dark:bg-gray-600 shadow-inner"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transform transition-transform duration-300 flex items-center justify-center ${
                    q.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${q.enabled ? "bg-emerald-500" : "bg-gray-400 opacity-50"}`} />
                </div>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(idx)}
                className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Delete question"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* ── Add New Question ── */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex-shrink-0">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Add New Question</p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
              placeholder="Question label, e.g. Quality of Physiotherapy"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="Field ID (optional)"
              className="w-44 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddQuestion}
              disabled={!newLabel.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex-shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset {activeForm.toUpperCase()}
            </button>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </button>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === "saved" && (
              <div className="flex items-center gap-1.5 text-green-500 text-sm font-semibold animate-pulse">
                <CheckCircle2 className="h-4 w-4" />
                Saved successfully!
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-1.5 text-red-500 text-sm font-semibold">
                <AlertCircle className="h-4 w-4" />
                Save failed
              </div>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackQuestionsEditor;
