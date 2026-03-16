import React, { useState } from "react";
import {
  requestPatientOtp,
  verifyPatientOtp,
  setPatientToken,
} from "../services/patientAuthService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

const PatientLoginModal: React.FC<Props> = ({ isOpen, onClose, onLoggedIn }) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const close = () => {
    setLoading(false);
    setStatus(null);
    setDevOtp(null);
    setOtp("");
    setStep("phone");
    onClose();
  };

  const sendOtp = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await requestPatientOtp(phone);
      setDevOtp(res.otp || null);
      setStep("otp");
      setStatus("OTP sent.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await verifyPatientOtp(phone, otp);
      setStatus("Logged in.");
      onLoggedIn?.();
      close();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-black text-lg text-gray-900 dark:text-white">
              Patient Login (OTP)
            </div>
            <button
              onClick={close}
              className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
            >
              Close
            </button>
          </div>

          {step === "phone" ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Enter your phone number to receive OTP.
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendOtp}
                disabled={loading || phone.trim().length < 10}
                className="w-full px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Enter the 6-digit OTP sent to <span className="font-bold">{phone}</span>.
              </div>
              {devOtp ? (
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 rounded-xl px-3 py-2">
                  Dev OTP: {devOtp}
                </div>
              ) : null}
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP"
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setDevOtp(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={verify}
                  disabled={loading || otp.trim().length !== 6}
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </div>
              <button
                onClick={() => {
                  setPatientToken(null);
                  close();
                }}
                className="w-full px-4 py-2 rounded-xl font-bold bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-700 dark:text-red-300"
              >
                Clear Patient Token
              </button>
            </div>
          )}

          {status ? (
            <div className="mt-4 text-sm font-bold text-gray-700 dark:text-gray-300">
              {status}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PatientLoginModal;

