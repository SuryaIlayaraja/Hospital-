const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type PatientAuthResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  otp?: string; // dev only (backend sends when not production)
};

export function getPatientToken(): string | null {
  return localStorage.getItem("patientToken");
}

export function setPatientToken(token: string | null) {
  if (token) localStorage.setItem("patientToken", token);
  else localStorage.removeItem("patientToken");
}

export async function requestPatientOtp(phone: string) {
  const res = await fetch(`${API_BASE_URL}/patient-auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = (await res.json()) as PatientAuthResponse<{ phone: string; expiresAt: string }>;
  if (!res.ok) throw new Error(data?.message || "Failed to request OTP");
  return data;
}

export async function verifyPatientOtp(phone: string, otp: string) {
  const res = await fetch(`${API_BASE_URL}/patient-auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  const data = (await res.json()) as PatientAuthResponse<any>;
  if (!res.ok) throw new Error(data?.message || "Failed to verify OTP");
  if (data.token) setPatientToken(data.token);
  return data;
}

