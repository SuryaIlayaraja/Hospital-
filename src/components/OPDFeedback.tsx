import React, { useState, useMemo } from "react";
import {
  Send,
  Award,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Eye,
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import RatingSelector from "./RatingSelector";
import FormInput from "./FormInput";
import ProgressBar from "./ProgressBar";
import { useLanguage } from "../contexts/LanguageContext";
import { submitOPDFeedback, requestFeedbackOTP, verifyFeedbackOTP } from "../services/apiService";
import {
  DEFAULT_OPD_QUESTIONS,
  STORAGE_KEY_OPD,
  type FeedbackQuestion,
} from "./FeedbackQuestionsEditor";

// Load questions (custom or default)
function getOPDQuestions(): FeedbackQuestion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_OPD);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_OPD_QUESTIONS;
}

interface OPDFeedbackProps {
  onNavigate?: () => void;
}

const OPDFeedback: React.FC<OPDFeedbackProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [authStage, setAuthStage] = useState<"email" | "otp" | "authenticated">("email");
  const [authEmail, setAuthEmail] = useState("");
  const [authOtp, setAuthOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    mobile: "",
    overallExperience: "",
    appointmentBooking: "",
    receptionStaff: "",
    billingProcess: "",
    nursingCare: "",
    labStaffSkilled: "",
    labWaitingTime: "",
    radiologyStaffSkilled: "",
    radiologyWaitingTime: "",
    pharmacyWaitingTime: "",
    medicationDispensed: "",
    drugExplanation: "",
    counsellingSession: "",
    audiologyStaffSkilled: "",
    hospitalCleanliness: "",
    nominateEmployee: "",
    comments: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mapRatingToBackend = (rating: string): string => {
    const excellent = t("common.excellent");
    const good = t("common.good");
    const average = t("common.average");

    if (rating === excellent || rating === "Excellent" || rating === "சிறந்தது") return "Excellent";
    if (rating === good || rating === "Good" || rating === "நல்லது") return "Good";
    if (rating === average || rating === "Average" || rating === "சராசரி") return "Fair";
    return rating;
  };

  const formProgress = useMemo(() => {
    const requiredFields = isAnonymous
      ? ["date", "overallExperience"]
      : ["name", "date", "mobile", "overallExperience"];

    const ratingFields = [
      "appointmentBooking", "receptionStaff", "billingProcess", "nursingCare", "labStaffSkilled", "labWaitingTime",
      "radiologyStaffSkilled", "radiologyWaitingTime", "pharmacyWaitingTime", "medicationDispensed",
      "drugExplanation", "counsellingSession", "audiologyStaffSkilled", "hospitalCleanliness",
    ];

    const allFields = [...requiredFields, ...ratingFields];
    const completedFields = allFields.filter(
      (field) => formData[field as keyof typeof formData] !== ""
    ).length;
    const totalFields = allFields.length;
    const progress = (completedFields / totalFields) * 100;

    return { progress, totalFields, completedFields };
  }, [formData, isAnonymous]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      alert("Please enter an email address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await requestFeedbackOTP(authEmail);
      if (res.success) {
        setAuthStage("otp");
        setAuthOtp("");
      } else {
        alert(res.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while requesting OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp || authOtp.length < 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await verifyFeedbackOTP(authEmail, authOtp);
      
      if (res.success) {
        setAuthStage("authenticated");
      } else {
        alert(res.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const submitData = {
        ...formData,
        email: authEmail,
        otp: authOtp,
        name: isAnonymous ? "Anonymous" : formData.name,
        uhid: "", 
        mobile: isAnonymous ? "" : formData.mobile,
        isAnonymous,
        overallExperience: mapRatingToBackend(formData.overallExperience),
        appointmentBooking: formData.appointmentBooking ? mapRatingToBackend(formData.appointmentBooking) : "",
        receptionStaff: formData.receptionStaff ? mapRatingToBackend(formData.receptionStaff) : "",
        billingProcess: formData.billingProcess ? mapRatingToBackend(formData.billingProcess) : "",
        nursingCare: formData.nursingCare ? mapRatingToBackend(formData.nursingCare) : "",
        labStaffSkilled: formData.labStaffSkilled ? mapRatingToBackend(formData.labStaffSkilled) : "",
        labWaitingTime: formData.labWaitingTime ? mapRatingToBackend(formData.labWaitingTime) : "",
        radiologyStaffSkilled: formData.radiologyStaffSkilled ? mapRatingToBackend(formData.radiologyStaffSkilled) : "",
        radiologyWaitingTime: formData.radiologyWaitingTime ? mapRatingToBackend(formData.radiologyWaitingTime) : "",
        pharmacyWaitingTime: formData.pharmacyWaitingTime ? mapRatingToBackend(formData.pharmacyWaitingTime) : "",
        medicationDispensed: formData.medicationDispensed ? mapRatingToBackend(formData.medicationDispensed) : "",
        drugExplanation: formData.drugExplanation ? mapRatingToBackend(formData.drugExplanation) : "",
        counsellingSession: formData.counsellingSession ? mapRatingToBackend(formData.counsellingSession) : "",
        audiologyStaffSkilled: formData.audiologyStaffSkilled ? mapRatingToBackend(formData.audiologyStaffSkilled) : "",
        hospitalCleanliness: formData.hospitalCleanliness ? mapRatingToBackend(formData.hospitalCleanliness) : "",
      };

      const result = await submitOPDFeedback(submitData);

      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "", date: "", mobile: "", overallExperience: "", appointmentBooking: "", receptionStaff: "",
          billingProcess: "", nursingCare: "", labStaffSkilled: "", labWaitingTime: "", radiologyStaffSkilled: "",
          radiologyWaitingTime: "", pharmacyWaitingTime: "", medicationDispensed: "", drugExplanation: "",
          counsellingSession: "", audiologyStaffSkilled: "", hospitalCleanliness: "", nominateEmployee: "", comments: "",
        });
        setAuthStage("email");
        setAuthEmail("");
        setAuthOtp("");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStage !== "authenticated") {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-[#030303] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0c0c0c] rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-white/10">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={onNavigate}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <ThemeToggle />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2 text-center">
            {t("opd.title") || "OPD Feedback"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Please verify your email to continue.
          </p>

          {authStage === "email" ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={authOtp}
                  onChange={(e) => setAuthOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-widest font-bold"
                  placeholder="------"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-center text-gray-500 mt-3">
                  Sent to <span className="font-semibold text-indigo-500">{authEmail}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthStage("email")}
                  className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || authOtp.length < 6}
                  className="flex-1 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Continue"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#030303] text-gray-900 dark:text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 p-4 sm:p-8 space-y-8 min-h-full max-w-7xl mx-auto">
        {/* Navigation & Theme Header */}
        <div className="flex justify-between items-center bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm mb-6">
          <button
            type="button"
            onClick={() => onNavigate?.()}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="text-center border-b border-gray-200 dark:border-white/10 pb-8 bg-gray-50 dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 shadow-none dark:shadow-2xl">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-3">
            {t("opd.title")}
          </h2>
          <p className="text-gray-600 dark:text-white font-semibold text-lg">
            {t("opd.subtitle")}
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          progress={formProgress.progress}
          totalFields={formProgress.totalFields}
          completedFields={formProgress.completedFields}
        />

        {/* Anonymous Feedback Toggle */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-gray-400/50 dark:hover:border-gray-500/50 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              {isAnonymous ? (
                <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <EyeOff className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-bold text-gray-800 dark:text-white text-base sm:text-sm">
                  Submit Anonymously
                </p>
                <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">
                  {isAnonymous
                    ? "Your identity will be hidden"
                    : "Toggle on for privacy"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAnonymous(!isAnonymous);
                if (!isAnonymous) {
                  // Switching to anonymous → clear personal fields
                  updateField("name", "");
                  updateField("mobile", "");
                }
              }}
              className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isAnonymous
                  ? "bg-indigo-500"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  isAnonymous ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Patient Information — hidden when anonymous */}
        {!isAnonymous && (
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-indigo-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-indigo-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-indigo-500 rounded-full hidden sm:block"></div>
            {t("opd.patient.info")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t("common.name")}
              type="text"
              value={formData.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Enter patient name"
              required
            />
            <FormInput
              label={t("common.date")}
              type="date"
              value={formData.date}
              onChange={(value) => updateField("date", value)}
              required
            />
            <FormInput
              label={t("common.mobile")}
              type="tel"
              value={formData.mobile}
              onChange={(value) => updateField("mobile", value)}
              placeholder="Enter mobile number"
              required
            />
          </div>
        </div>
        )}

        {/* Date-only input when anonymous */}
        {isAnonymous && (
          <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-indigo-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-indigo-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
              <div className="w-2 h-2 bg-indigo-500 rounded-full hidden sm:block"></div>
              {t("common.date")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t("common.date")}
                type="date"
                value={formData.date}
                onChange={(value) => updateField("date", value)}
                required
              />
            </div>
          </div>
        )}
        {/* Overall Experience */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-purple-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-purple-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-purple-500 rounded-full hidden sm:block"></div>
            {t("opd.overall.experience")}
          </h3>
          <RatingSelector
            label={t("opd.overall.question")}
            value={formData.overallExperience}
            onChange={(value) => updateField("overallExperience", value)}
            required
          />
        </div>

        {/* Service Ratings */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-none dark:shadow-lg hover:border-blue-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-blue-400 mb-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-blue-500 rounded-full hidden sm:block"></div>
            {t("opd.service.quality")}
          </h3>
          <div className="space-y-1">
            {getOPDQuestions()
              .filter((q) => q.enabled)
              .map((q) => (
                <RatingSelector
                  key={q.id}
                  label={q.label}
                  value={formData[q.id as keyof typeof formData] || ""}
                  onChange={(value) => updateField(q.id, value)}
                />
              ))}
          </div>
        </div>


        {/* Employee Nomination & Comments */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-none dark:shadow-lg hover:border-yellow-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
              <Award className="h-6 w-6 text-yellow-400" />
              {t("opd.employee.recognition")}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("opd.employee.question")}
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-black border border-red-100 dark:border-red-500/20">
                  Optional
                </span>
              </label>
              <textarea
                value={formData.nominateEmployee}
                onChange={(e) =>
                  updateField("nominateEmployee", e.target.value)
                }
                placeholder={t("opd.employee.placeholder")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-none dark:shadow-lg hover:border-green-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-green-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
              <MessageSquare className="h-6 w-6 text-green-400" />
              {t("opd.additional.comments")}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("opd.comments.question")}
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-black border border-red-100 dark:border-red-500/20">
                  Optional
                </span>
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => updateField("comments", e.target.value)}
                placeholder={t("opd.comments.placeholder")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="flex justify-center pt-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold">
                Thank you! Your feedback has been submitted successfully.
              </span>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex justify-center pt-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-2xl backdrop-blur-sm">
              <AlertCircle className="h-5 w-5" />
              <span className="font-bold">
                Sorry, there was an error submitting your feedback. Please try
                again or contact support.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform transition-all duration-300 shadow-2xl ${isSubmitting
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 hover:scale-105 hover:shadow-indigo-500/50"
              }`}
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? "Submitting..." : t("opd.submit.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OPDFeedback;
