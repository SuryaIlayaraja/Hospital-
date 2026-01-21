import React, { useState, useMemo } from "react";
import {
  Send,
  Award,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import RatingSelector from "./RatingSelector";
import FormInput from "./FormInput";
import ProgressBar from "./ProgressBar";
import { useLanguage } from "../contexts/LanguageContext";
import { submitOPDFeedback } from "../services/apiService";

const OPDFeedback: React.FC = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    uhid: "",
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

  // Map frontend rating values to backend enum values
  // Backend expects: 'Excellent', 'Good', 'Fair', 'Poor'
  // Frontend sends: 'Excellent', 'Good', 'Average' (translated)
  const mapRatingToBackend = (rating: string): string => {
    const excellent = t("common.excellent");
    const good = t("common.good");
    const average = t("common.average");

    if (rating === excellent || rating === "Excellent" || rating === "சிறந்தது") {
      return "Excellent";
    }
    if (rating === good || rating === "Good" || rating === "நல்லது") {
      return "Good";
    }
    if (rating === average || rating === "Average" || rating === "சராசரி") {
      return "Fair"; // Map "Average" to "Fair" as backend enum doesn't have "Average"
    }
    // Return original value if no match (shouldn't happen, but safety fallback)
    return rating;
  };

  // Calculate form progress
  const formProgress = useMemo(() => {
    const requiredFields = [
      "name",
      "uhid",
      "date",
      "mobile",
      "overallExperience",
    ];

    const ratingFields = [
      "appointmentBooking",
      "receptionStaff",
      "billingProcess",
      "nursingCare",
      "labStaffSkilled",
      "labWaitingTime",
      "radiologyStaffSkilled",
      "radiologyWaitingTime",
      "pharmacyWaitingTime",
      "medicationDispensed",
      "drugExplanation",
      "counsellingSession",
      "audiologyStaffSkilled",
      "hospitalCleanliness",
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
      // Map form data to backend format (convert rating values)
      const submitData = {
        ...formData,
        overallExperience: mapRatingToBackend(formData.overallExperience),
        // Map other rating fields as well
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
        // Reset form after successful submission
        setFormData({
          name: "",
          uhid: "",
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
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-8 min-h-full max-w-7xl mx-auto">
        <div className="text-center border-b border-gray-800 pb-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-3">
            {t("opd.title")}
          </h2>
          <p className="text-gray-400 font-semibold text-lg">
            {t("opd.subtitle")}
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          progress={formProgress.progress}
          totalFields={formProgress.totalFields}
          completedFields={formProgress.completedFields}
        />

        {/* Patient Information */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-lg hover:border-indigo-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
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
              label={t("common.uhid")}
              type="text"
              value={formData.uhid}
              onChange={(value) => updateField("uhid", value)}
              placeholder="Enter UHID"
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
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-lg hover:border-purple-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
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
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-blue-500/50 transition-all duration-500">
          <h3 className="text-xl font-bold text-blue-400 mb-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {t("opd.service.quality")}
          </h3>
          <div className="space-y-1">
            <RatingSelector
              label={t("opd.appointment.booking")}
              value={formData.appointmentBooking}
              onChange={(value) => updateField("appointmentBooking", value)}
            />
            <RatingSelector
              label={t("opd.reception.staff")}
              value={formData.receptionStaff}
              onChange={(value) => updateField("receptionStaff", value)}
            />
            <RatingSelector
              label={t("opd.billing.process")}
              value={formData.billingProcess}
              onChange={(value) => updateField("billingProcess", value)}
            />
            <RatingSelector
              label={t("opd.nursing.care")}
              value={formData.nursingCare}
              onChange={(value) => updateField("nursingCare", value)}
            />
            <RatingSelector
              label={t("opd.lab.staff")}
              value={formData.labStaffSkilled}
              onChange={(value) => updateField("labStaffSkilled", value)}
            />
            <RatingSelector
              label={t("opd.lab.waiting")}
              value={formData.labWaitingTime}
              onChange={(value) => updateField("labWaitingTime", value)}
            />
            <RatingSelector
              label={t("opd.radiology.staff")}
              value={formData.radiologyStaffSkilled}
              onChange={(value) => updateField("radiologyStaffSkilled", value)}
            />
            <RatingSelector
              label={t("opd.radiology.waiting")}
              value={formData.radiologyWaitingTime}
              onChange={(value) => updateField("radiologyWaitingTime", value)}
            />
            <RatingSelector
              label={t("opd.pharmacy.waiting")}
              value={formData.pharmacyWaitingTime}
              onChange={(value) => updateField("pharmacyWaitingTime", value)}
            />
            <RatingSelector
              label={t("opd.medication.dispensed")}
              value={formData.medicationDispensed}
              onChange={(value) => updateField("medicationDispensed", value)}
            />
            <RatingSelector
              label={t("opd.drug.explanation")}
              value={formData.drugExplanation}
              onChange={(value) => updateField("drugExplanation", value)}
            />
            <RatingSelector
              label={t("opd.counselling.session")}
              value={formData.counsellingSession}
              onChange={(value) => updateField("counsellingSession", value)}
            />
            <RatingSelector
              label={t("opd.audiology.staff")}
              value={formData.audiologyStaffSkilled}
              onChange={(value) => updateField("audiologyStaffSkilled", value)}
            />
            <RatingSelector
              label={t("opd.hospital.cleanliness")}
              value={formData.hospitalCleanliness}
              onChange={(value) => updateField("hospitalCleanliness", value)}
            />
          </div>
        </div>

        {/* Employee Nomination & Comments */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-yellow-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-yellow-400" />
              {t("opd.employee.recognition")}
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-300">
                {t("opd.employee.question")}{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={formData.nominateEmployee}
                onChange={(e) =>
                  updateField("nominateEmployee", e.target.value)
                }
                placeholder={t("opd.employee.placeholder")}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-white placeholder-gray-500"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-green-500/50 transition-all duration-500">
            <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-green-400" />
              {t("opd.additional.comments")}
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-300">
                {t("opd.comments.question")}{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => updateField("comments", e.target.value)}
                placeholder={t("opd.comments.placeholder")}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white placeholder-gray-500"
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
            className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform transition-all duration-300 shadow-2xl ${
              isSubmitting
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
