import React, { useState, useMemo } from "react";
import {
  Send,
  Award,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import RatingSelector from "./RatingSelector";
import FormInput from "./FormInput";
import ProgressBar from "./ProgressBar";
import { useLanguage } from "../contexts/LanguageContext";
import { submitIPDFeedback } from "../services/apiService";
import {
  DEFAULT_IPD_QUESTIONS,
  STORAGE_KEY_IPD,
  type FeedbackQuestion,
} from "./FeedbackQuestionsEditor";

// Load questions (custom or default)
function getIPDQuestions(): FeedbackQuestion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_IPD);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_IPD_QUESTIONS;
}

interface IPDFeedbackProps {
  onNavigate?: () => void;
}

const IPDFeedback: React.FC<IPDFeedbackProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    mobile: "",
    overallExperience: "",
    registrationProcess: "",
    roomReadiness: "",
    roomCleanliness: "",
    doctorExplanation: "",
    nurseCommunication: "",
    planExplanation: "",
    promptnessAttending: "",
    pharmacyTimeliness: "",
    billingCourtesy: "",
    operationsHospitality: "",
    dischargeProcess: "",
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
    const requiredFields = ["name", "email", "date", "mobile", "overallExperience"];

    const ratingFields = [
      "registrationProcess", "roomReadiness", "roomCleanliness", "doctorExplanation", "nurseCommunication",
      "planExplanation", "promptnessAttending", "pharmacyTimeliness", "billingCourtesy", "operationsHospitality",
      "dischargeProcess",
    ];

    const allFields = [...requiredFields, ...ratingFields];
    const completedFields = allFields.filter(
      (field) => formData[field as keyof typeof formData] !== ""
    ).length;
    const totalFields = allFields.length;
    const progress = (completedFields / totalFields) * 100;

    return { progress, totalFields, completedFields };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const submitData = {
        ...formData,
        name: formData.name,
        uhid: "",
        mobile: formData.mobile,
        isAnonymous: false,
        overallExperience: mapRatingToBackend(formData.overallExperience),
        registrationProcess: formData.registrationProcess ? mapRatingToBackend(formData.registrationProcess) : "",
        roomReadiness: formData.roomReadiness ? mapRatingToBackend(formData.roomReadiness) : "",
        roomCleanliness: formData.roomCleanliness ? mapRatingToBackend(formData.roomCleanliness) : "",
        doctorExplanation: formData.doctorExplanation ? mapRatingToBackend(formData.doctorExplanation) : "",
        nurseCommunication: formData.nurseCommunication ? mapRatingToBackend(formData.nurseCommunication) : "",
        planExplanation: formData.planExplanation ? mapRatingToBackend(formData.planExplanation) : "",
        promptnessAttending: formData.promptnessAttending ? mapRatingToBackend(formData.promptnessAttending) : "",
        pharmacyTimeliness: formData.pharmacyTimeliness ? mapRatingToBackend(formData.pharmacyTimeliness) : "",
        billingCourtesy: formData.billingCourtesy ? mapRatingToBackend(formData.billingCourtesy) : "",
        operationsHospitality: formData.operationsHospitality ? mapRatingToBackend(formData.operationsHospitality) : "",
        dischargeProcess: formData.dischargeProcess ? mapRatingToBackend(formData.dischargeProcess) : "",
      };

      const result = await submitIPDFeedback(submitData);

      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "", email: "", date: "", mobile: "", overallExperience: "", registrationProcess: "", roomReadiness: "",
          roomCleanliness: "", doctorExplanation: "", nurseCommunication: "", planExplanation: "", promptnessAttending: "",
          pharmacyTimeliness: "", billingCourtesy: "", operationsHospitality: "", dischargeProcess: "",
          nominateEmployee: "", comments: "",
        });
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

        <div className="text-center border-b border-gray-200 dark:border-white/10 pb-8 bg-gray-50 dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-3">
            {t("ipd.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
            {t("ipd.subtitle")}
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          progress={formProgress.progress}
          totalFields={formProgress.totalFields}
          completedFields={formProgress.completedFields}
        />

        {/* Patient Information */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-indigo-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-indigo-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-indigo-500 rounded-full hidden sm:block"></div>
            {t("ipd.patient.info")}
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
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => updateField("email", value)}
              placeholder="Enter email address"
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

        {/* Overall Experience */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-none dark:shadow-lg hover:border-purple-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-purple-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-purple-500 rounded-full hidden sm:block"></div>
            {t("ipd.overall.experience")}
          </h3>
          <RatingSelector
            label={t("ipd.overall.question")}
            value={formData.overallExperience}
            onChange={(value) => updateField("overallExperience", value)}
            required
          />
        </div>

        {/* Service Ratings */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-none dark:shadow-lg hover:border-blue-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-blue-400 mb-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-2 h-2 bg-blue-500 rounded-full hidden sm:block"></div>
            {t("ipd.service.quality")}
          </h3>
          <div className="space-y-1">
            {getIPDQuestions()
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
              {t("ipd.employee.recognition")}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("ipd.employee.question")}
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-black border border-red-100 dark:border-red-500/20">
                  Optional
                </span>
              </label>
              <textarea
                value={formData.nominateEmployee}
                onChange={(e) =>
                  updateField("nominateEmployee", e.target.value)
                }
                placeholder={t("ipd.employee.placeholder")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-none dark:shadow-lg hover:border-green-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-green-400 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
              <MessageSquare className="h-6 w-6 text-green-400" />
              {t("ipd.additional.comments")}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("ipd.comments.question")}
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-black border border-red-100 dark:border-red-500/20">
                  Optional
                </span>
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => updateField("comments", e.target.value)}
                placeholder={t("ipd.comments.placeholder")}
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
            {isSubmitting ? "Submitting..." : t("ipd.submit.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IPDFeedback;
