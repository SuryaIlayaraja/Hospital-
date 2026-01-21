// Day-wise analysis result type
export interface DaywiseAnalysis {
  day: string;
  willRecommend: string; // percentage as string
  mayRecommend: string;
  willNotRecommend: string;
  total: number;
}

// Monthly analysis result type
export interface MonthlyAnalysis {
  month: string; // YYYY-MM
  willRecommend: string;
  mayRecommend: string;
  willNotRecommend: string;
  total: number;
}

// Yearly analysis result type
export interface YearlyAnalysis {
  year: string; // YYYY
  willRecommend: string;
  mayRecommend: string;
  willNotRecommend: string;
  total: number;
}

// Fetch day-wise analysis for a week
export const getDaywiseAnalysis = async (
  start: string, // YYYY-MM-DD
  end: string, // YYYY-MM-DD
  type: "all" | "opd" | "ipd" = "all" // Filter by feedback type
): Promise<ApiResponse<DaywiseAnalysis[]>> => {
  return apiRequest<DaywiseAnalysis[]>(
    `/feedback/daywise?start=${start}&end=${end}&type=${type}`
  );
};

// Fetch monthly analysis for a year
export const getMonthlyAnalysis = async (
  year: number,
  type: "all" | "opd" | "ipd" = "all"
): Promise<ApiResponse<MonthlyAnalysis[]>> => {
  return apiRequest<MonthlyAnalysis[]>(
    `/feedback/monthly?year=${year}&type=${type}`
  );
};

// Fetch yearly analysis
export const getYearlyAnalysis = async (
  type: "all" | "opd" | "ipd" = "all"
): Promise<ApiResponse<YearlyAnalysis[]>> => {
  return apiRequest<YearlyAnalysis[]>(
    `/feedback/yearly?type=${type}`
  );
};
// API service for communicating with the Node.js backend

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "COO" | "Supervisor";
  department?: any;
  departmentName?: string | null;
  lastLogin?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  sessionStorage.removeItem("adminAuthenticated");
  localStorage.removeItem("adminAuthenticated");
};

// Types for feedback data
export interface OPDFeedbackData {
  name: string;
  uhid: string;
  date: string;
  mobile: string;
  overallExperience: string;
  appointmentBooking?: string;
  receptionStaff?: string;
  billingProcess?: string;
  nursingCare?: string;
  labStaffSkilled?: string;
  labWaitingTime?: string;
  radiologyStaffSkilled?: string;
  radiologyWaitingTime?: string;
  pharmacyWaitingTime?: string;
  medicationDispensed?: string;
  drugExplanation?: string;
  counsellingSession?: string;
  audiologyStaffSkilled?: string;
  hospitalCleanliness?: string;
  nominateEmployee?: string;
  comments?: string;
}

export interface IPDFeedbackData {
  name: string;
  uhid: string;
  date: string;
  mobile: string;
  overallExperience: string;
  registrationProcess?: string;
  roomReadiness?: string;
  roomCleanliness?: string;
  doctorExplanation?: string;
  nurseCommunication?: string;
  planExplanation?: string;
  promptnessAttending?: string;
  pharmacyTimeliness?: string;
  billingCourtesy?: string;
  operationsHospitality?: string;
  dischargeProcess?: string;
  nominateEmployee?: string;
  comments?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface FeedbackStats {
  totalSubmissions: number;
  opdCount: number;
  ipdCount: number;
  opdExperienceStats: Array<{ _id: string; count: number }>;
  ipdExperienceStats: Array<{ _id: string; count: number }>;
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${options.method || "GET"} ${url}`);
    
    // Get auth token
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    let data: any;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
    } else {
      const text = await response.text();
      data = {
        success: false,
        message: text || `API request failed: ${response.status} ${response.statusText}`
      };
    }

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`, data);
      throw new Error(data.message || `API request failed: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Submit OPD feedback
export const submitOPDFeedback = async (
  feedbackData: OPDFeedbackData
): Promise<ApiResponse<any>> => {
  return apiRequest<any>("/feedback/opd", {
    method: "POST",
    body: JSON.stringify(feedbackData),
  });
};

// Submit IPD feedback
export const submitIPDFeedback = async (
  feedbackData: IPDFeedbackData
): Promise<ApiResponse<any>> => {
  return apiRequest<any>("/feedback/ipd", {
    method: "POST",
    body: JSON.stringify(feedbackData),
  });
};

// Get all feedback (OPD + IPD)
export const getAllFeedback = async (
  limit: number = 50
): Promise<ApiResponse<{ opd: any[]; ipd: any[] }>> => {
  return apiRequest<{ opd: any[]; ipd: any[] }>(`/feedback/all?limit=${limit}`);
};

// Get OPD feedback only
export const getOPDFeedback = async (
  limit: number = 50
): Promise<ApiResponse<any[]>> => {
  return apiRequest<any[]>(`/feedback/opd?limit=${limit}`);
};

// Get IPD feedback only
export const getIPDFeedback = async (
  limit: number = 50
): Promise<ApiResponse<any[]>> => {
  return apiRequest<any[]>(`/feedback/ipd?limit=${limit}`);
};

// Get feedback statistics
export const getFeedbackStats = async (): Promise<
  ApiResponse<FeedbackStats>
> => {
  return apiRequest<FeedbackStats>("/feedback/stats");
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Login with email and password
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  
  // If login successful, store token
  if (response.success && response.data?.token) {
    setAuthToken(response.data.token);
    localStorage.setItem("authUser", JSON.stringify(response.data.user));
  }
  
  return response;
};

// Verify JWT token
export const verifyToken = async (): Promise<ApiResponse<{ user: AuthUser }>> => {
  return apiRequest<{ user: AuthUser }>("/auth/verify", {
    method: "POST",
  });
};

// Change password
export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<ApiResponse<any>> => {
  return apiRequest<any>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
};

// Seed users (development only)
export const seedUsers = async (): Promise<ApiResponse<any>> => {
  return apiRequest<any>("/auth/seed-users", {
    method: "POST",
  });
};

// Get all users (COO only)
export const getAllUsers = async (): Promise<ApiResponse<AuthUser[]>> => {
  return apiRequest<AuthUser[]>("/auth/users");
};

// Logout
export const logout = () => {
  clearAuthToken();
};

// Health check
export const checkApiHealth = async (): Promise<ApiResponse<any>> => {
  return apiRequest<any>("/health");
};

// Floor Management Types
export interface Floor {
  _id: string;
  floorNumber: string;
  floorName: string;
  description?: string;
  departments?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFloorData {
  floorNumber: string;
  floorName: string;
  description?: string;
  departments?: string[];
}

export interface UpdateFloorData {
  floorNumber?: string;
  floorName?: string;
  description?: string;
  departments?: string[];
  isActive?: boolean;
}

// Get all floors
export const getAllFloors = async (): Promise<ApiResponse<Floor[]>> => {
  return apiRequest<Floor[]>("/floors/all");
};

// Get a single floor by ID
export const getFloorById = async (id: string): Promise<ApiResponse<Floor>> => {
  return apiRequest<Floor>(`/floors/${id}`);
};

// Create a new floor
export const createFloor = async (
  floorData: CreateFloorData
): Promise<ApiResponse<Floor>> => {
  return apiRequest<Floor>("/floors/create", {
    method: "POST",
    body: JSON.stringify(floorData),
  });
};

// Update a floor
export const updateFloor = async (
  id: string,
  floorData: UpdateFloorData
): Promise<ApiResponse<Floor>> => {
  return apiRequest<Floor>(`/floors/${id}`, {
    method: "PUT",
    body: JSON.stringify(floorData),
  });
};

// Delete a floor
export const deleteFloor = async (
  id: string
): Promise<ApiResponse<Floor>> => {
  return apiRequest<Floor>(`/floors/${id}`, {
    method: "DELETE",
  });
};

// Doctor Management Types
export interface Doctor {
  _id: string;
  name: string;
  studies: string;
  image?: string;
  specialization?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorData {
  name: string;
  studies: string;
  image?: string;
  specialization?: string;
  displayOrder?: number;
}

export interface UpdateDoctorData {
  name?: string;
  studies?: string;
  image?: string;
  specialization?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// Get all doctors
export const getAllDoctors = async (): Promise<ApiResponse<Doctor[]>> => {
  return apiRequest<Doctor[]>("/doctors/all");
};

// Get active doctors only
export const getActiveDoctors = async (): Promise<ApiResponse<Doctor[]>> => {
  return apiRequest<Doctor[]>("/doctors/active");
};

// Get a single doctor by ID
export const getDoctorById = async (id: string): Promise<ApiResponse<Doctor>> => {
  return apiRequest<Doctor>(`/doctors/${id}`);
};

// Create a new doctor
export const createDoctor = async (
  doctorData: CreateDoctorData
): Promise<ApiResponse<Doctor>> => {
  return apiRequest<Doctor>("/doctors/create", {
    method: "POST",
    body: JSON.stringify(doctorData),
  });
};

// Update a doctor
export const updateDoctor = async (
  id: string,
  doctorData: UpdateDoctorData
): Promise<ApiResponse<Doctor>> => {
  return apiRequest<Doctor>(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(doctorData),
  });
};

// Delete a doctor
export const deleteDoctor = async (
  id: string
): Promise<ApiResponse<Doctor>> => {
  return apiRequest<Doctor>(`/doctors/${id}`, {
    method: "DELETE",
  });
};

// Department Management Types
export interface EscalationLevel {
  designation: string;
  access: string;
  email?: string;
  phone?: string;
}

export interface Department {
  _id: string;
  serialNumber: number;
  departmentName: string;
  firstLevel: EscalationLevel;
  secondLevel: EscalationLevel;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentData {
  departmentName: string;
  firstLevel: EscalationLevel;
  secondLevel: EscalationLevel;
}

export interface UpdateDepartmentData {
  departmentName?: string;
  firstLevel?: EscalationLevel;
  secondLevel?: EscalationLevel;
  isActive?: boolean;
}

export interface COO {
  _id: string;
  designation: string;
  name: string;
  access: string;
  wardAccess: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCOOData {
  designation?: string;
  name?: string;
  access?: string;
  wardAccess?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface DepartmentHierarchy {
  departmentName: string;
  firstLevel: EscalationLevel;
  secondLevel: EscalationLevel;
  nextLevel: COO;
}

// Get all departments
export const getAllDepartments = async (): Promise<ApiResponse<Department[]>> => {
  return apiRequest<Department[]>("/departments/all");
};

// Get a single department by ID
export const getDepartmentById = async (id: string): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>(`/departments/${id}`);
};

// Create a new department
export const createDepartment = async (
  departmentData: CreateDepartmentData
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>("/departments/create", {
    method: "POST",
    body: JSON.stringify(departmentData),
  });
};

// Update a department
export const updateDepartment = async (
  id: string,
  departmentData: UpdateDepartmentData
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(departmentData),
  });
};

// Delete a department
export const deleteDepartment = async (
  id: string
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>(`/departments/${id}`, {
    method: "DELETE",
  });
};

// Get COO information
export const getCOO = async (): Promise<ApiResponse<COO>> => {
  return apiRequest<COO>("/departments/coo/info");
};

// Update COO
export const updateCOO = async (
  cooData: UpdateCOOData
): Promise<ApiResponse<COO>> => {
  return apiRequest<COO>("/departments/coo/update", {
    method: "PUT",
    body: JSON.stringify(cooData),
  });
};

// Get department hierarchy (includes COO)
export const getDepartmentHierarchy = async (
  id: string
): Promise<ApiResponse<DepartmentHierarchy>> => {
  return apiRequest<DepartmentHierarchy>(`/departments/${id}/hierarchy`);
};

// Seed initial departments
export const seedDepartments = async (): Promise<ApiResponse<{ count: number }>> => {
  return apiRequest<{ count: number }>("/departments/seed", {
    method: "POST",
  });
};
