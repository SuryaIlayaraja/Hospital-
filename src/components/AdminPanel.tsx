import React, { useState, useEffect } from "react";
import DaywiseAnalysisPage from "./DaywiseAnalysisPage";
import OPDNPSDashboard from "./OPDNPSDashboard";
import {
  Database,
  Eye,
  Download,
  Calendar,
  Filter,
  Star,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Mail,
  Building2,
  Bell,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Stethoscope,
  Image as ImageIcon,
  ExternalLink,
  GitBranch,
  Shield,
  EyeOff,
  BedDouble,
  Activity,
} from "lucide-react";

import LoginShapes from "./LoginShapes";

import {
  getAllFeedback,
  getAllFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  Floor,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  Doctor,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  getCOO,
  updateCOO,
  COO,
  seedDepartments,
  login,
  logout as apiLogout,
  verifyToken,
  seedUsers,
  AuthUser,
  getAuthToken,
} from "../services/apiService";
import { useTickets, Ticket } from "../hooks/useTickets";
import ComplaintHeatmap from "./ComplaintHeatmap";
import TicketChat from "./TicketChat";
import { useChatNotifications } from "../hooks/useChatNotifications";
import * as XLSX from "xlsx";

// Feedback data type (union of OPD and IPD feedback)
type FeedbackData = {
  id?: string;
  name: string;
  uhid: string;
  date: string;
  mobile: string;
  overallExperience: string;
  timestamp: string | Date;
  [key: string]: any; // Allow additional fields
};

const AdminPanel: React.FC = () => {
  // State to show/hide daywise analysis page
  const [showDaywisePage, setShowDaywisePage] = useState(false);
  
  // State to show/hide OPD NPS Dashboard
  const [showOPDDashboard, setShowOPDDashboard] = useState(false);

  const [feedback, setFeedback] = useState<{
    opd: FeedbackData[];
    ipd: FeedbackData[];
  }>({ opd: [], ipd: [] });
  const [filteredFeedback, setFilteredFeedback] = useState<{
    opd: FeedbackData[];
    ipd: FeedbackData[];
  }>({ opd: [], ipd: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"opd" | "ipd" | "tickets">("opd");
  const [mainView, setMainView] = useState<"feedbacks" | "tickets" | "floors" | "doctors" | "departments" | "rooms">("feedbacks");

  // Floor management states
  const [floors, setFloors] = useState<Floor[]>([]);
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorFormData, setFloorFormData] = useState({
    floorNumber: "",
    floorName: "",
    description: "",
    departments: "",
  });

  // Doctor management states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorFormData, setDoctorFormData] = useState({
    name: "",
    studies: "",
    image: "",
    specialization: "",
    displayOrder: 0,
  });

  // Department management states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    departmentName: "",
    firstLevelDesignation: "",
    firstLevelAccess: "",
    firstLevelEmail: "",
    firstLevelPhone: "",
    secondLevelDesignation: "",
    secondLevelAccess: "",
    secondLevelEmail: "",
    secondLevelPhone: "",
  });

  // COO management states
  const [cooData, setCooData] = useState<COO | null>(null);
  const [showCOOForm, setShowCOOForm] = useState(false);
  const [cooFormData, setCooFormData] = useState({
    designation: "COO",
    name: "",
    access: "All Departments",
    wardAccess: "All Wards",
    email: "",
    phone: "",
  });

  // Ticket management
  const {
    tickets,
    loading: ticketsLoading,
    updateTicket,
    deleteTicket,
  } = useTickets();
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [chatTicketId, setChatTicketId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    singleDate: "",
    filterType: "range", // 'range' or 'single'
    isActive: false,
  });
  const [searchFilter, setSearchFilter] = useState({
    name: "",
    mobile: "",
    uhid: "",
    isActive: false,
  });
  const [ratingFilter, setRatingFilter] = useState({
    rating: "",
    isActive: false,
  });
  // Always show today's data by default (when no filters are active)
  const showTodayOnly = true;

  // Authentication and user state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if token exists
    return !!getAuthToken();
  });
  const { unread, clearUnread } = useChatNotifications(isAuthenticated);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Escalated tickets state (COO only)
  const [escalatedTickets, setEscalatedTickets] = useState<Ticket[]>([]);
  const [showEscalatedDetails, setShowEscalatedDetails] = useState(false);

  // Ticket filter states
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketSeverityFilter, setTicketSeverityFilter] =
    useState<string>("all");
  const [ticketDepartmentFilter, setTicketDepartmentFilter] =
    useState<string>("all");
  const [ticketDateFilter, setTicketDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  // Load floors
  const loadFloors = async () => {
    setFloorsLoading(true);
    try {
      const response = await getAllFloors();
      if (response.success && response.data) {
        setFloors(response.data);
      }
    } catch (error) {
      console.error("Failed to load floors:", error);
    } finally {
      setFloorsLoading(false);
    }
  };

  // Load doctors
  const loadDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await getAllDoctors();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Load departments
  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await getAllDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Load COO data
  const loadCOO = async () => {
    try {
      const response = await getCOO();
      if (response.success && response.data) {
        setCooData(response.data);
        setCooFormData({
          designation: response.data.designation || "COO",
          name: response.data.name || "",
          access: response.data.access || "All Departments",
          wardAccess: response.data.wardAccess || "All Wards",
          email: response.data.email || "",
          phone: response.data.phone || "",
        });
      }
    } catch (error) {
      console.error("Failed to load COO:", error);
    }
  };

  // Verify user on component mount if authenticated but user data missing
  useEffect(() => {
    const verifyUser = async () => {
      if (isAuthenticated && !currentUser) {
        console.log("Authenticated but no user data. Verifying token...");
        try {
          const response = await verifyToken();
          if (response.success && response.data?.user) {
            console.log("Token verified. Restoring user:", response.data.user);
            setCurrentUser(response.data.user);
            // Update localStorage just in case
            localStorage.setItem("authUser", JSON.stringify(response.data.user));
          } else {
            console.error("Token verification failed. Logging out.");
            handleLogout();
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          handleLogout();
        }
      }
    };

    verifyUser();
  }, [isAuthenticated, currentUser]);

  // Fetch escalated tickets for COO
  const loadEscalatedTickets = async () => {
    try {
      const token = getAuthToken();
      console.log("loadEscalatedTickets: token exists?", !!token);
      if (!token) return;
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tickets/escalated`;
      console.log("loadEscalatedTickets: fetching", url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("loadEscalatedTickets: response status", response.status);
      const data = await response.json();
      console.log("loadEscalatedTickets: data", data);
      if (data.success) {
        setEscalatedTickets(data.data);
        console.log("loadEscalatedTickets: set", data.data.length, "tickets");
      }
    } catch (error) {
      console.error("Failed to load escalated tickets:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadDepartments();
      loadCOO();

      if (currentUser.role === "COO") {
        loadFeedback();
        loadFloors();
        loadDoctors();
      } else if (currentUser.role === "Supervisor") {
        // Set default view to departments for Supervisors
        setMainView("departments");
      }
    }
  }, [isAuthenticated, currentUser]);

  // Separate effect for escalated tickets - runs for COO
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "COO") {
      console.log("Escalation useEffect triggered - calling loadEscalatedTickets");
      loadEscalatedTickets();
    }
  }, [isAuthenticated, currentUser]);

  // Check if view is allowed for current user
  const isViewAllowed = (view: typeof mainView) => {
    if (!currentUser) return false;
    if (currentUser.role === "COO") return true; // COO has access to all

    // Supervisors have access to departments and tickets views
    if (currentUser.role === "Supervisor") {
      return view === "departments" || view === "tickets";
    }

    return false;
  };







  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    apiLogout(); // Clear tokens from apiService
    setEmail("");
    setPassword("");
    setLoginError("");
    setFocusedInput(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      console.log("Attempting login with:", email);
      const response = await login({ email, password });

      console.log("Login response in component:", response);

      // Extremely robust check for success
      const isSuccess = response.success === true || (response as any).token;
      const data = (response.data || response) as any; // Use the response itselt as data if .data is missing
      const userData = data.user;
      const token = data.token;

      if (isSuccess && userData) {
        console.log("Login logic success! User:", userData);

        // Show success message first
        setLoginSuccess(true);
        setIsLoggingIn(false);
        setLoginError("");

        // Ensure tokens/user are stored if not already by apiService
        if (token) {
          localStorage.setItem("authToken", token);
        }
        localStorage.setItem("authUser", JSON.stringify(userData));

        // Set user data immediately
        setCurrentUser(userData);

        // Delay setting authenticated state to allow success animation to show
        setTimeout(() => {
          setIsAuthenticated(true);
          setLoginSuccess(false); // Reset success state
          console.log("Authentication state updated - switching to admin panel");
        }, 1500);
      } else {
        console.error("Login logical failure:", response);
        const errorMessage = response.message || (response as any).error || "Login failed. Please check your credentials.";
        setLoginError(errorMessage);
        setPassword("");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Login failed. Please try again.");
      setPassword("");
      setIsLoggingIn(false);
    }
  };

  // Google Login removed - using email/password authentication only
  // If needed in future, integrate Google OAuth with backend token exchange



  const loadFeedback = async () => {
    setLoading(true);
    try {
      const result = await getAllFeedback(50);

      if (result.success && result.data) {
        setFeedback(result.data);
        setFilteredFeedback(result.data);
      } else {
        console.error("Failed to load feedback:", result.message);
        // Fallback to localStorage if API fails
        const opdData = JSON.parse(
          localStorage.getItem("opd-feedback") || "[]"
        );
        const ipdData = JSON.parse(
          localStorage.getItem("ipd-feedback") || "[]"
        );
        const fallbackData = { opd: opdData, ipd: ipdData };
        setFeedback(fallbackData);
        setFilteredFeedback(fallbackData);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
      // Fallback to localStorage if API fails
      const opdData = JSON.parse(localStorage.getItem("opd-feedback") || "[]");
      const ipdData = JSON.parse(localStorage.getItem("ipd-feedback") || "[]");
      const fallbackData = { opd: opdData, ipd: ipdData };
      setFeedback(fallbackData);
      setFilteredFeedback(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Floor management functions
  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const departments = floorFormData.departments
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d !== "");

      const response = await createFloor({
        floorNumber: floorFormData.floorNumber,
        floorName: floorFormData.floorName,
        description: floorFormData.description,
        departments,
      });

      if (response.success) {
        await loadFloors();
        setShowFloorForm(false);
        setFloorFormData({
          floorNumber: "",
          floorName: "",
          description: "",
          departments: "",
        });
      } else {
        alert(response.message || "Failed to create floor");
      }
    } catch (error) {
      console.error("Error creating floor:", error);
      alert("Failed to create floor");
    }
  };

  const handleUpdateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFloor) return;

    try {
      const departments = floorFormData.departments
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d !== "");

      const response = await updateFloor(editingFloor._id, {
        floorNumber: floorFormData.floorNumber,
        floorName: floorFormData.floorName,
        description: floorFormData.description,
        departments,
      });

      if (response.success) {
        await loadFloors();
        setShowFloorForm(false);
        setEditingFloor(null);
        setFloorFormData({
          floorNumber: "",
          floorName: "",
          description: "",
          departments: "",
        });
      } else {
        alert(response.message || "Failed to update floor");
      }
    } catch (error) {
      console.error("Error updating floor:", error);
      alert("Failed to update floor");
    }
  };

  const handleDeleteFloor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this floor?")) return;

    try {
      const response = await deleteFloor(id);
      if (response.success) {
        await loadFloors();
      } else {
        alert(response.message || "Failed to delete floor");
      }
    } catch (error) {
      console.error("Error deleting floor:", error);
      alert("Failed to delete floor");
    }
  };

  const handleEditFloor = (floor: Floor) => {
    setEditingFloor(floor);
    setFloorFormData({
      floorNumber: floor.floorNumber,
      floorName: floor.floorName,
      description: floor.description || "",
      departments: floor.departments?.join(", ") || "",
    });
    setShowFloorForm(true);
  };

  const handleCancelFloorForm = () => {
    setShowFloorForm(false);
    setEditingFloor(null);
    setFloorFormData({
      floorNumber: "",
      floorName: "",
      description: "",
      departments: "",
    });
  };

  // Doctor management functions
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate image size if it's a base64 string
      if (doctorFormData.image && doctorFormData.image.startsWith("data:image")) {
        const base64Length = doctorFormData.image.length - (doctorFormData.image.indexOf(",") + 1);
        const sizeInBytes = (base64Length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > 5) {
          alert("Image size exceeds 5MB limit. Please use a smaller image or compress it.");
          return;
        }
      }

      const response = await createDoctor({
        name: doctorFormData.name,
        studies: doctorFormData.studies,
        image: doctorFormData.image || "",
        specialization: doctorFormData.specialization || "",
        displayOrder: doctorFormData.displayOrder || 0,
      });

      if (response.success) {
        await loadDoctors();
        setShowDoctorForm(false);
        setDoctorFormData({
          name: "",
          studies: "",
          image: "",
          specialization: "",
          displayOrder: 0,
        });
      } else {
        alert(response.message || "Failed to create doctor");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      alert(`Failed to create doctor: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      // Validate image size if it's a base64 string
      if (doctorFormData.image && doctorFormData.image.startsWith("data:image")) {
        const base64Length = doctorFormData.image.length - (doctorFormData.image.indexOf(",") + 1);
        const sizeInBytes = (base64Length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > 5) {
          alert("Image size exceeds 5MB limit. Please use a smaller image or compress it.");
          return;
        }
      }

      const response = await updateDoctor(editingDoctor._id, {
        name: doctorFormData.name,
        studies: doctorFormData.studies,
        image: doctorFormData.image || "",
        specialization: doctorFormData.specialization || "",
        displayOrder: doctorFormData.displayOrder || 0,
      });

      if (response.success) {
        await loadDoctors();
        setShowDoctorForm(false);
        setEditingDoctor(null);
        setDoctorFormData({
          name: "",
          studies: "",
          image: "",
          specialization: "",
          displayOrder: 0,
        });
      } else {
        alert(response.message || "Failed to update doctor");
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert(`Failed to update doctor: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await deleteDoctor(id);
      if (response.success) {
        await loadDoctors();
      } else {
        alert(response.message || "Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor");
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorFormData({
      name: doctor.name,
      studies: doctor.studies,
      image: doctor.image || "",
      specialization: doctor.specialization || "",
      displayOrder: doctor.displayOrder || 0,
    });
    setShowDoctorForm(true);
  };

  const handleCancelDoctorForm = () => {
    setShowDoctorForm(false);
    setEditingDoctor(null);
    setDoctorFormData({
      name: "",
      studies: "",
      image: "",
      specialization: "",
      displayOrder: 0,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorFormData({
          ...doctorFormData,
          image: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Department management functions
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createDepartment({
        departmentName: departmentFormData.departmentName,
        firstLevel: {
          designation: departmentFormData.firstLevelDesignation,
          access: departmentFormData.firstLevelAccess,
          email: departmentFormData.firstLevelEmail,
          phone: departmentFormData.firstLevelPhone,
        },
        secondLevel: {
          designation: departmentFormData.secondLevelDesignation,
          access: departmentFormData.secondLevelAccess,
          email: departmentFormData.secondLevelEmail,
          phone: departmentFormData.secondLevelPhone,
        },
      });

      if (response.success) {
        await loadDepartments();
        setShowDepartmentForm(false);
        setDepartmentFormData({
          departmentName: "",
          firstLevelDesignation: "",
          firstLevelAccess: "",
          firstLevelEmail: "",
          firstLevelPhone: "",
          secondLevelDesignation: "",
          secondLevelAccess: "",
          secondLevelEmail: "",
          secondLevelPhone: "",
        });
      } else {
        alert(response.message || "Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Failed to create department");
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      const response = await updateDepartment(editingDepartment._id, {
        departmentName: departmentFormData.departmentName,
        firstLevel: {
          designation: departmentFormData.firstLevelDesignation,
          access: departmentFormData.firstLevelAccess,
          email: departmentFormData.firstLevelEmail,
          phone: departmentFormData.firstLevelPhone,
        },
        secondLevel: {
          designation: departmentFormData.secondLevelDesignation,
          access: departmentFormData.secondLevelAccess,
          email: departmentFormData.secondLevelEmail,
          phone: departmentFormData.secondLevelPhone,
        },
      });

      if (response.success) {
        await loadDepartments();
        setShowDepartmentForm(false);
        setEditingDepartment(null);
        setDepartmentFormData({
          departmentName: "",
          firstLevelDesignation: "",
          firstLevelAccess: "",
          firstLevelEmail: "",
          firstLevelPhone: "",
          secondLevelDesignation: "",
          secondLevelAccess: "",
          secondLevelEmail: "",
          secondLevelPhone: "",
        });
      } else {
        alert(response.message || "Failed to update department");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Failed to update department");
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await deleteDepartment(id);
      if (response.success) {
        await loadDepartments();
      } else {
        alert(response.message || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentFormData({
      departmentName: department.departmentName,
      firstLevelDesignation: department.firstLevel.designation,
      firstLevelAccess: department.firstLevel.access,
      firstLevelEmail: department.firstLevel.email || "",
      firstLevelPhone: department.firstLevel.phone || "",
      secondLevelDesignation: department.secondLevel.designation,
      secondLevelAccess: department.secondLevel.access,
      secondLevelEmail: department.secondLevel.email || "",
      secondLevelPhone: department.secondLevel.phone || "",
    });
    setShowDepartmentForm(true);
  };

  const handleCancelDepartmentForm = () => {
    setShowDepartmentForm(false);
    setEditingDepartment(null);
    setDepartmentFormData({
      departmentName: "",
      firstLevelDesignation: "",
      firstLevelAccess: "",
      firstLevelEmail: "",
      firstLevelPhone: "",
      secondLevelDesignation: "",
      secondLevelAccess: "",
      secondLevelEmail: "",
      secondLevelPhone: "",
    });
  };

  // COO management functions
  const handleUpdateCOO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateCOO({
        designation: cooFormData.designation,
        name: cooFormData.name,
        access: cooFormData.access,
        wardAccess: cooFormData.wardAccess,
        email: cooFormData.email,
        phone: cooFormData.phone,
      });

      if (response.success) {
        await loadCOO();
        setShowCOOForm(false);
        alert("COO information updated successfully");
      } else {
        alert(response.message || "Failed to update COO information");
      }
    } catch (error) {
      console.error("Error updating COO:", error);
      alert("Failed to update COO information");
    }
  };

  const handleSeedDepartments = async () => {
    if (!confirm("This will replace all existing departments with the default list. Are you sure?")) return;

    try {
      setDepartmentsLoading(true);
      const response = await seedDepartments();
      if (response.success) {
        await loadDepartments();
        await loadCOO();
        alert("Departments seeded successfully");
      } else {
        alert(response.message || "Failed to seed departments");
      }
    } catch (error) {
      console.error("Error seeding departments:", error);
      alert("Failed to seed departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Ticket filtering logic
  useEffect(() => {
    // For Supervisors, always apply department filter based on their departmentName
    const effectiveDeptFilter =
      currentUser?.role === "Supervisor" && currentUser?.departmentName
        ? currentUser.departmentName
        : ticketDepartmentFilter;

    // Check if any filters are active
    const hasActiveFilters =
      ticketSearchTerm !== "" ||
      ticketStatusFilter !== "all" ||
      ticketSeverityFilter !== "all" ||
      effectiveDeptFilter !== "" ||
      ticketDateFilter.startDate !== "" ||
      ticketDateFilter.endDate !== "";

    const filtered = tickets.filter((ticket) => {
      // Search term filter (title, description, department)
      const matchesSearch =
        ticketSearchTerm === "" ||
        ticket.title.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
        ticket.description
          .toLowerCase()
          .includes(ticketSearchTerm.toLowerCase()) ||
        ticket.department
          .toLowerCase()
          .includes(ticketSearchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(ticketSearchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        ticketStatusFilter === "all" || ticket.status === ticketStatusFilter;

      // Severity filter
      const matchesSeverity =
        ticketSeverityFilter === "all" ||
        ticket.severity === ticketSeverityFilter;

      // Department filter (auto-applied for Supervisors)
      const matchesDepartment =
        effectiveDeptFilter === "all" ||
        effectiveDeptFilter === "" ||
        ticket.department
          .toLowerCase()
          .includes(effectiveDeptFilter.toLowerCase());

      // Date range filter
      let matchesDateRange = true;

      // If any filters are active, use date filter if provided
      // Otherwise, default to today's tickets
      if (hasActiveFilters) {
        if (ticketDateFilter.startDate || ticketDateFilter.endDate) {
          const ticketDate = new Date(ticket.createdAt);
          if (ticketDateFilter.startDate) {
            const startDate = new Date(ticketDateFilter.startDate);
            matchesDateRange = matchesDateRange && ticketDate >= startDate;
          }
          if (ticketDateFilter.endDate) {
            const endDate = new Date(ticketDateFilter.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            matchesDateRange = matchesDateRange && ticketDate <= endDate;
          }
        }
      } else {
        // No filters active - show only today's tickets
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const ticketDate = new Date(ticket.createdAt);
        matchesDateRange = ticketDate >= today && ticketDate < tomorrow;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesDepartment &&
        matchesDateRange
      );
    });
    setFilteredTickets(filtered);
  }, [
    tickets,
    ticketSearchTerm,
    ticketStatusFilter,
    ticketSeverityFilter,
    ticketDepartmentFilter,
    currentUser,
    ticketDateFilter,
  ]);

  const clearTicketFilters = () => {
    setTicketSearchTerm("");
    setTicketStatusFilter("all");
    setTicketSeverityFilter("all");
    setTicketDepartmentFilter("all");
    setTicketDateFilter({ startDate: "", endDate: "" });
  };

  const getTicketStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "in-progress":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Generate and send report to CEO via Gmail
  const sendReportToCEO = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate statistics
    const todayDate = today.toISOString().split("T")[0];
    const todayOPD = feedback.opd.filter(f => f.date === todayDate).length;
    const todayIPD = feedback.ipd.filter(f => f.date === todayDate).length;
    const todayTickets = tickets.filter(t => {
      const ticketDate = new Date(t.createdAt).toISOString().split("T")[0];
      return ticketDate === todayDate;
    }).length;

    // Calculate rating distribution
    const allTodayFeedback = [...feedback.opd.filter(f => f.date === todayDate), ...feedback.ipd.filter(f => f.date === todayDate)];
    const excellent = allTodayFeedback.filter(f => f.overallExperience === "Excellent").length;
    const good = allTodayFeedback.filter(f => f.overallExperience === "Good").length;
    const fair = allTodayFeedback.filter(f => f.overallExperience === "Fair").length;
    const poor = allTodayFeedback.filter(f => f.overallExperience === "Poor").length;
    const totalFeedback = allTodayFeedback.length;

    // Ticket status breakdown
    const openTickets = tickets.filter(t => t.status === "open").length;
    const inProgressTickets = tickets.filter(t => t.status === "in-progress").length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;

    // Generate report body
    const reportBody = `Dear CEO,

Please find below the daily feedback and ticket report for ${todayStr}:

=== TODAY'S SUMMARY ===

FEEDBACK RECEIVED:
• OPD Feedback: ${todayOPD}
• IPD Feedback: ${todayIPD}
• Total Feedback: ${totalFeedback}

OVERALL EXPERIENCE RATINGS:
• Excellent: ${excellent} (${totalFeedback > 0 ? ((excellent / totalFeedback) * 100).toFixed(1) : 0}%)
• Good: ${good} (${totalFeedback > 0 ? ((good / totalFeedback) * 100).toFixed(1) : 0}%)
• Fair: ${fair} (${totalFeedback > 0 ? ((fair / totalFeedback) * 100).toFixed(1) : 0}%)
• Poor: ${poor} (${totalFeedback > 0 ? ((poor / totalFeedback) * 100).toFixed(1) : 0}%)

TICKET STATUS:
• New Tickets Today: ${todayTickets}
• Open Tickets: ${openTickets}
• In Progress: ${inProgressTickets}
• Resolved: ${resolvedTickets}
• Total Tickets: ${tickets.length}

=== OVERALL STATISTICS ===

• Total OPD Feedback: ${feedback.opd.length}
• Total IPD Feedback: ${feedback.ipd.length}
• Total Feedback: ${feedback.opd.length + feedback.ipd.length}
• Total Tickets: ${tickets.length}

Best regards,
Admin Panel - Vikram ENT Hospital`;

    // Create mailto link
    const subject = encodeURIComponent(`Daily Feedback Report - ${todayStr}`);
    const body = encodeURIComponent(reportBody);
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`;

    // Open Gmail compose window
    window.open(mailtoLink, '_blank');
  };

  const exportToExcel = (data: any[], type: string) => {
    if (data.length === 0) return;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Define headers and data based on type
    let headers: string[];
    let worksheetData: any[][];

    if (type === "TICKETS") {
      headers = [
        "Ticket ID",
        "Title",
        "Description",
        "Issue Category",
        "Department",
        "Severity",
        "Status",
        "Created At",
        "Updated At",
      ];

      worksheetData = [
        headers,
        ...(data as Ticket[]).map((ticket) => [
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.issueCategory || "N/A",
          ticket.department,
          ticket.severity,
          ticket.status,
          ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "",
          ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "",
        ]),
      ];
    } else if (type === "OPD") {
      headers = [
        "ID",
        "Name",
        "UHID",
        "Date",
        "Mobile",
        "Overall Experience",
        "Appointment Booking",
        "Reception Staff",
        "Billing Process",
        "Nursing Care",
        "Lab Staff Skilled",
        "Lab Waiting Time",
        "Radiology Staff Skilled",
        "Radiology Waiting Time",
        "Pharmacy Waiting Time",
        "Medication Dispensed",
        "Drug Explanation",
        "Counselling Session",
        "Audiology Staff Skilled",
        "Hospital Cleanliness",
        "Nominate Employee",
        "Comments",
        "Timestamp",
      ];

      worksheetData = [
        headers,
        ...data.map((item) => [
          item.id,
          item.name,
          item.uhid,
          item.date,
          item.mobile,
          item.overallExperience,
          item.appointmentBooking || "",
          item.receptionStaff || "",
          item.billingProcess || "",
          item.nursingCare || "",
          item.labStaffSkilled || "",
          item.labWaitingTime || "",
          item.radiologyStaffSkilled || "",
          item.radiologyWaitingTime || "",
          item.pharmacyWaitingTime || "",
          item.medicationDispensed || "",
          item.drugExplanation || "",
          item.counsellingSession || "",
          item.audiologyStaffSkilled || "",
          item.hospitalCleanliness || "",
          item.nominateEmployee || "",
          item.comments || "",
          new Date(item.timestamp).toLocaleString(),
        ]),
      ];
    } else {
      headers = [
        "ID",
        "Name",
        "UHID",
        "Date",
        "Mobile",
        "Overall Experience",
        "Registration Process",
        "Room Readiness",
        "Room Cleanliness",
        "Doctor Explanation",
        "Nurse Communication",
        "Plan Explanation",
        "Promptness Attending",
        "Pharmacy Timeliness",
        "Billing Courtesy",
        "Operations Hospitality",
        "Discharge Process",
        "Nominate Employee",
        "Comments",
        "Timestamp",
      ];

      worksheetData = [
        headers,
        ...data.map((item) => [
          item.id,
          item.name,
          item.uhid,
          item.date,
          item.mobile,
          item.overallExperience,
          item.registrationProcess || "",
          item.roomReadiness || "",
          item.roomCleanliness || "",
          item.doctorExplanation || "",
          item.nurseCommunication || "",
          item.planExplanation || "",
          item.promptnessAttending || "",
          item.pharmacyTimeliness || "",
          item.billingCourtesy || "",
          item.operationsHospitality || "",
          item.dischargeProcess || "",
          item.nominateEmployee || "",
          item.comments || "",
          new Date(item.timestamp).toLocaleString(),
        ]),
      ];
    }

    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    const colWidths = headers.map((header, index) => {
      if (index === 0) return { wch: 15 }; // ID column
      if (index === 1) return { wch: 20 }; // Name column
      if (index === 2) return { wch: 15 }; // UHID column
      if (index === 3) return { wch: 12 }; // Date column
      if (index === 4) return { wch: 15 }; // Mobile column
      if (index === 5) return { wch: 18 }; // Overall Experience column
      if (index === headers.length - 3) return { wch: 30 }; // Nominate Employee column
      if (index === headers.length - 2) return { wch: 40 }; // Comments column
      if (index === headers.length - 1) return { wch: 20 }; // Timestamp column
      return { wch: 18 }; // Default width for other columns
    });
    ws["!cols"] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, `${type} Feedback`);

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-Feedback-${new Date().toISOString().split("T")[0]
      }.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter feedback by date
  const applyDateFilter = () => {
    if (!dateFilter.isActive) {
      setFilteredFeedback(feedback);
      return;
    }

    const filterData = (data: FeedbackData[]) => {
      return data.filter((item) => {
        const itemDate = new Date(item.date);

        if (dateFilter.filterType === "single") {
          if (!dateFilter.singleDate) return true;
          const filterDate = new Date(dateFilter.singleDate);
          return itemDate.toDateString() === filterDate.toDateString();
        } else {
          // Range filter
          if (!dateFilter.startDate && !dateFilter.endDate) return true;

          const startDate = dateFilter.startDate
            ? new Date(dateFilter.startDate)
            : null;
          const endDate = dateFilter.endDate
            ? new Date(dateFilter.endDate)
            : null;

          if (startDate && endDate) {
            return itemDate >= startDate && itemDate <= endDate;
          } else if (startDate) {
            return itemDate >= startDate;
          } else if (endDate) {
            return itemDate <= endDate;
          }
          return true;
        }
      });
    };

    setFilteredFeedback({
      opd: filterData(feedback.opd),
      ipd: filterData(feedback.ipd),
    });
  };

  // Filter feedback by search criteria (name, mobile, and UHID)
  const applySearchFilter = () => {
    if (
      !searchFilter.isActive ||
      (!searchFilter.name && !searchFilter.mobile && !searchFilter.uhid)
    ) {
      setFilteredFeedback(feedback);
      return;
    }

    const filterData = (data: FeedbackData[]) => {
      return data.filter((item) => {
        const nameMatch =
          !searchFilter.name ||
          item.name.toLowerCase().includes(searchFilter.name.toLowerCase());
        const mobileMatch =
          !searchFilter.mobile || item.mobile.includes(searchFilter.mobile);
        const uhidMatch =
          !searchFilter.uhid ||
          item.uhid.toLowerCase().includes(searchFilter.uhid.toLowerCase());

        return nameMatch && mobileMatch && uhidMatch;
      });
    };

    setFilteredFeedback({
      opd: filterData(feedback.opd),
      ipd: filterData(feedback.ipd),
    });
  };

  // Apply all filters
  const applyAllFilters = () => {
    let filteredData = feedback;

    // Apply today-only filter (default behavior)
    if (showTodayOnly && !dateFilter.isActive && !searchFilter.isActive) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const filterData = (data: FeedbackData[]) => {
        return data.filter((item) => item.date === today);
      };
      filteredData = {
        opd: filterData(filteredData.opd),
        ipd: filterData(filteredData.ipd),
      };
    }

    // Apply date filter
    if (dateFilter.isActive) {
      const filterData = (data: FeedbackData[]) => {
        return data.filter((item) => {
          const itemDate = new Date(item.date);

          if (dateFilter.filterType === "single") {
            if (!dateFilter.singleDate) return true;
            const filterDate = new Date(dateFilter.singleDate);
            return itemDate.toDateString() === filterDate.toDateString();
          } else {
            if (!dateFilter.startDate && !dateFilter.endDate) return true;

            const startDate = dateFilter.startDate
              ? new Date(dateFilter.startDate)
              : null;
            const endDate = dateFilter.endDate
              ? new Date(dateFilter.endDate)
              : null;

            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            } else if (startDate) {
              return itemDate >= startDate;
            } else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          }
        });
      };
      filteredData = {
        opd: filterData(filteredData.opd),
        ipd: filterData(filteredData.ipd),
      };
    }

    // Apply search filter
    if (
      searchFilter.isActive &&
      (searchFilter.name || searchFilter.mobile || searchFilter.uhid)
    ) {
      const filterData = (data: FeedbackData[]) => {
        return data.filter((item) => {
          const nameMatch =
            !searchFilter.name ||
            item.name.toLowerCase().includes(searchFilter.name.toLowerCase());
          const mobileMatch =
            !searchFilter.mobile || item.mobile.includes(searchFilter.mobile);
          const uhidMatch =
            !searchFilter.uhid ||
            item.uhid.toLowerCase().includes(searchFilter.uhid.toLowerCase());

          return nameMatch && mobileMatch && uhidMatch;
        });
      };
      filteredData = {
        opd: filterData(filteredData.opd),
        ipd: filterData(filteredData.ipd),
      };
    }

    // Apply rating filter
    if (ratingFilter.isActive && ratingFilter.rating) {
      const filterData = (data: FeedbackData[]) => {
        return data.filter(
          (item) => item.overallExperience === ratingFilter.rating
        );
      };
      filteredData = {
        opd: filterData(filteredData.opd),
        ipd: filterData(filteredData.ipd),
      };
    }

    setFilteredFeedback(filteredData);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
      singleDate: "",
      filterType: "range",
      isActive: false,
    });
    applyAllFilters();
  };

  // Clear search filter
  const clearSearchFilter = () => {
    setSearchFilter({ name: "", mobile: "", uhid: "", isActive: false });
    applyAllFilters();
  };

  // Apply rating filter
  const applyRatingFilter = () => {
    setRatingFilter((prev) => ({ ...prev, isActive: !!prev.rating }));
  };

  // Clear rating filter
  const clearRatingFilter = () => {
    setRatingFilter({ rating: "", isActive: false });
    applyAllFilters();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
      singleDate: "",
      filterType: "range",
      isActive: false,
    });
    setSearchFilter({ name: "", mobile: "", uhid: "", isActive: false });
    setRatingFilter({ rating: "", isActive: false });
    applyAllFilters();
  };


  // Switch filter type
  const switchFilterType = (type: "range" | "single") => {
    setDateFilter((prev) => ({
      ...prev,
      filterType: type,
      startDate: "",
      endDate: "",
      singleDate: "",
      isActive: false,
    }));
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyAllFilters();
  }, [dateFilter, searchFilter, ratingFilter, showTodayOnly, feedback]);

  const currentData =
    mainView === "feedbacks"
      ? activeTab === "opd"
        ? filteredFeedback.opd
        : filteredFeedback.ipd
      : mainView === "tickets"
        ? filteredTickets
        : [];

  // Show Day Wise Analysis Page (before authentication check)
  if (showDaywisePage) {
    return <DaywiseAnalysisPage onBack={() => setShowDaywisePage(false)} />;
  }

  // Show OPD NPS Dashboard
  if (showOPDDashboard) {
    return <OPDNPSDashboard onBack={() => setShowOPDDashboard(false)} />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    console.log("Rendering login view. State:", { isLoggingIn, loginSuccess });
    return (
      <div className="min-h-screen bg-white dark:bg-[#030303] flex items-center justify-center p-4 lg:p-0">
        <div className="bg-gray-50 dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[1200px] min-h-[700px] flex flex-col lg:flex-row relative border border-gray-200 dark:border-white/10">

          {/* Left Side - Hero/Illustration */}

          {/* Left Side - Hero/Illustration (Interactive Shapes) */}
          <div className="w-full lg:w-1/2 bg-gray-100 dark:bg-[#080808] flex items-center justify-center relative overflow-hidden">

            <div className="w-full h-full absolute inset-0">
              <LoginShapes focusedInput={focusedInput} emailLength={email.length} />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#0c0c0c]/50">

            {/* Logo area */}
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-[#1a1a1a] rounded-xl mb-4 text-white dark:text-indigo-400 border dark:border-white/10">
                <div className="w-6 h-1 bg-white dark:bg-indigo-400 rounded-full"></div>
                <div className="absolute w-1 h-6 bg-white dark:bg-indigo-400 rounded-full"></div>
              </div>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
              <p className="text-gray-500 dark:text-gray-400">Please enter your details</p>
            </div>

            {loginSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-green-600 font-bold text-lg animate-pulse">Login successful! Redirecting...</p>
              </div>
            ) : isLoggingIn ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium animate-pulse">Logging in...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">


                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a]/50"
                    placeholder="admin@hospital.com"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a]/50 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-red-500 text-sm mt-1">{loginError}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-600 font-medium">Remember for 30 days</span>
                  </label>
                  <button type="button" className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:underline">
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-[1.02] duration-200"
                >
                  Log in
                </button>

                {/* Info text */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Use your hospital credentials to sign in
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#030303] text-gray-900 dark:text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full p-8">
        {/* Header */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Database className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Feedback Admin Panel
            </h1>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <X className="h-4 w-4" />
              Logout
            </button>

            <button
              onClick={loadFeedback}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <Eye className="h-4 w-4" />
              Refresh Data
            </button>

            <button
              onClick={() => {
                if (mainView === "tickets") {
                  exportToExcel(filteredTickets, "TICKETS");
                } else {
                  exportToExcel(currentData, activeTab.toUpperCase());
                }
              }}
              disabled={
                (mainView === "feedbacks" && currentData.length === 0) ||
                (mainView === "tickets" && filteredTickets.length === 0) ||
                (mainView !== "feedbacks" && mainView !== "tickets")
              }
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export {mainView === "tickets" ? "TICKETS" : activeTab.toUpperCase()} Excel
            </button>

            <button
              onClick={sendReportToCEO}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
            >
              <Mail className="h-4 w-4" />
              Send Report to CEO
            </button>

            {currentUser?.role === "COO" && escalatedTickets.length > 0 && (
              <button
                onClick={() => setShowEscalatedDetails(!showEscalatedDetails)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-300 animate-pulse"
              >
                <Bell className="h-4 w-4" />
                Escalations
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {escalatedTickets.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Escalation Alert Banner - COO only */}
        {currentUser?.role === "COO" && escalatedTickets.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/40 rounded-2xl p-6 mb-8 shadow-lg">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowEscalatedDetails(!showEscalatedDetails)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center animate-pulse">
                  <Bell className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-400">
                    ⚠️ {escalatedTickets.length} Escalated {escalatedTickets.length === 1 ? 'Ticket' : 'Tickets'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unresolved tickets older than 24 hours — click to {showEscalatedDetails ? 'hide' : 'view'} details
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-400">{showEscalatedDetails ? '▲' : '▼'}</span>
            </div>

            {showEscalatedDetails && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {escalatedTickets.map((ticket) => {
                  const hoursOld = Math.floor(
                    (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)
                  );
                  const daysOld = Math.floor(hoursOld / 24);
                  const ageText = daysOld > 0 ? `${daysOld}d ${hoursOld % 24}h` : `${hoursOld}h`;

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            ticket.severity === 'high'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : ticket.severity === 'medium'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {ticket.severity.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            ticket.status === 'open'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-white truncate">{ticket.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dept: {ticket.department}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-lg font-bold text-red-400">{ageText}</p>
                        <p className="text-xs text-gray-500">overdue</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mb-8 flex justify-center items-center gap-4 flex-wrap">
          {isViewAllowed("feedbacks") && (
            <button
              onClick={() => {
                setMainView("feedbacks");
                setActiveTab("opd"); // Reset to OPD when switching to feedbacks
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform ${mainView === "feedbacks"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white scale-105 shadow-xl border border-indigo-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Filter className="h-5 w-5 inline-block mr-2" />
              Filter Feedbacks
            </button>
          )}
          {isViewAllowed("tickets") && (
            <button
              onClick={() => {
                setMainView("tickets");
                setActiveTab("tickets");
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform ${mainView === "tickets"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-xl border border-purple-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Filter className="h-5 w-5 inline-block mr-2" />
              View Tickets
            </button>
          )}
          {isViewAllowed("doctors") && (
            <button
              onClick={() => {
                setMainView("doctors");
                loadDoctors();
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform ${mainView === "doctors"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-105 shadow-xl border border-indigo-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Stethoscope className="h-5 w-5 inline-block mr-2" />
              Manage Doctors
            </button>
          )}
          {isViewAllowed("rooms") && (
            <button
              onClick={() => {
                setMainView("rooms");
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform ${mainView === "rooms"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-105 shadow-xl border border-cyan-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <BedDouble className="h-5 w-5 inline-block mr-2" />
              View Rooms
            </button>
          )}
          {currentUser?.role === 'COO' && (
            <div className="flex gap-4 flex-wrap w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDaywisePage(true)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 shadow-lg transform ${showDaywisePage
                  ? "bg-blue-600 text-white scale-105 shadow-xl border border-blue-500/50"
                  : "bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105"
                  }`}
              >
                <BarChart3 className="h-5 w-5 inline-block mr-2" />
                Show Day Wise Analysis
              </button>
              
              <button
                onClick={() => setShowOPDDashboard(true)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 shadow-lg transform ${showOPDDashboard
                  ? "bg-indigo-600 text-white scale-105 shadow-xl border border-indigo-500/50"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:scale-105 border border-indigo-500/30"
                  }`}
              >
                <Activity className="h-5 w-5 inline-block mr-2" />
                OPD NPS Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Feedback Section - Only show when mainView is "feedbacks" */}
        {mainView === "feedbacks" && (
          <>
            {/* Date Filter Section */}
            <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-6 w-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  Filter by Date
                </h3>
              </div>

              {/* Filter Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                  Filter Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => switchFilterType("range")}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${dateFilter.filterType === "range"
                      ? "bg-indigo-500 text-white shadow-lg border border-indigo-500/50"
                      : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700"
                      }`}
                  >
                    Date Range
                  </button>
                  <button
                    onClick={() => switchFilterType("single")}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${dateFilter.filterType === "single"
                      ? "bg-indigo-500 text-white shadow-lg border border-indigo-500/50"
                      : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700"
                      }`}
                  >
                    Single Day
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                {dateFilter.filterType === "range" ? (
                  <>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                            isActive: true,
                          }))
                        }
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        placeholder="Select start date"
                      />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                            isActive: true,
                          }))
                        }
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        placeholder="Select end date"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter.singleDate}
                      onChange={(e) =>
                        setDateFilter((prev) => ({
                          ...prev,
                          singleDate: e.target.value,
                          isActive: true,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                      placeholder="Select date"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={clearDateFilter}
                    className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <Calendar className="h-4 w-4" />
                    Clear Filter
                  </button>
                </div>
              </div>

              {dateFilter.isActive && (
                <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-xl">
                  <p className="text-gray-300 text-sm">
                    <strong>Active Filter:</strong>
                    {dateFilter.filterType === "single" ? (
                      dateFilter.singleDate ? (
                        ` Single day: ${new Date(
                          dateFilter.singleDate
                        ).toLocaleDateString()}`
                      ) : (
                        " No date selected"
                      )
                    ) : (
                      <>
                        {dateFilter.startDate &&
                          ` From ${new Date(
                            dateFilter.startDate
                          ).toLocaleDateString()}`}
                        {dateFilter.endDate &&
                          ` To ${new Date(
                            dateFilter.endDate
                          ).toLocaleDateString()}`}
                        {!dateFilter.startDate &&
                          !dateFilter.endDate &&
                          " No date range selected"}
                      </>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Showing {currentData.length} {activeTab.toUpperCase()} feedback
                    entries
                  </p>
                </div>
              )}
            </div>

            {/* Search Filter Section */}
            <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  Search by Patient Details
                </h3>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={searchFilter.name}
                    onChange={(e) =>
                      setSearchFilter((prev) => ({
                        ...prev,
                        name: e.target.value,
                        isActive: true,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={searchFilter.mobile}
                    onChange={(e) =>
                      setSearchFilter((prev) => ({
                        ...prev,
                        mobile: e.target.value,
                        isActive: true,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    UHID
                  </label>
                  <input
                    type="text"
                    value={searchFilter.uhid}
                    onChange={(e) =>
                      setSearchFilter((prev) => ({
                        ...prev,
                        uhid: e.target.value,
                        isActive: true,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    placeholder="Enter UHID"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearSearchFilter}
                    className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <Calendar className="h-4 w-4" />
                    Clear Search
                  </button>
                </div>
              </div>

              {searchFilter.isActive && (
                <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-xl">
                  <p className="text-gray-300 text-sm">
                    <strong>Active Search:</strong>
                    {searchFilter.name && ` Name: "${searchFilter.name}"`}
                    {searchFilter.mobile && ` Mobile: "${searchFilter.mobile}"`}
                    {searchFilter.uhid && ` UHID: "${searchFilter.uhid}"`}
                    {!searchFilter.name &&
                      !searchFilter.mobile &&
                      !searchFilter.uhid &&
                      " No search criteria"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Showing {currentData.length} {activeTab.toUpperCase()} feedback
                    entries
                  </p>
                </div>
              )}
            </div>

            {/* Rating Filter Section */}
            <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  Filter by Overall Rating
                </h3>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Overall Experience Rating
                  </label>
                  <select
                    value={ratingFilter.rating}
                    onChange={(e) => {
                      setRatingFilter((prev) => ({
                        ...prev,
                        rating: e.target.value,
                      }));
                      applyRatingFilter();
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-gray-900 dark:text-white"
                  >
                    <option value="">All Ratings</option>
                    <option value="Excellent">😊 Excellent</option>
                    <option value="Good">😐 Good</option>
                    <option value="Average">😞 Average</option>
                  </select>
                </div>

                {ratingFilter.isActive && (
                  <div className="flex gap-2">
                    <button
                      onClick={clearRatingFilter}
                      className="flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/30 border border-orange-500/30 dark:border-orange-500/50 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      <Star className="h-4 w-4" />
                      Clear Rating Filter
                    </button>
                  </div>
                )}
              </div>

              {ratingFilter.isActive && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 dark:border-yellow-500/50 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    <strong>Active Rating Filter:</strong> Showing only{" "}
                    {ratingFilter.rating === "Excellent"
                      ? "😊 Excellent"
                      : ratingFilter.rating === "Good"
                        ? "😐 Good"
                        : "😞 Average"}{" "}
                    ratings
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Showing {currentData.length} {activeTab.toUpperCase()} feedback
                    entries with{" "}
                    {ratingFilter.rating === "Excellent"
                      ? "😊 Excellent"
                      : ratingFilter.rating === "Good"
                        ? "😐 Good"
                        : "😞 Average"}{" "}
                    rating
                  </p>
                </div>
              )}
            </div>

            {/* Clear All Filters */}
            {(dateFilter.isActive ||
              searchFilter.isActive ||
              ratingFilter.isActive) && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-500 transition-all duration-300 shadow-lg font-bold"
                  >
                    <Calendar className="h-5 w-5" />
                    Clear All Filters
                  </button>
                </div>
              )}

          </>
        )}

        {/* Tickets Section - Only show when mainView is "tickets" */}
        {mainView === "tickets" && (
          <>
            {/* Ticket Filters */}
            <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-6 w-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  Filter Tickets
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={ticketSearchTerm}
                    onChange={(e) => setTicketSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="Search by title, description, department..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Severity
                  </label>
                  <select
                    value={ticketSeverityFilter}
                    onChange={(e) => setTicketSeverityFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="all">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={ticketDepartmentFilter}
                    onChange={(e) => setTicketDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="all">All Departments</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Operations">Operations</option>
                    <option value="House Keeping">House Keeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Medical">Medical</option>
                    <option value="F&B">F&B</option>
                    <option value="Security">Security</option>
                    <option value="Transport">Transport</option>
                    <option value="IT">IT</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Billing">Billing</option>
                    <option value="Insurance / TPA">Insurance / TPA</option>
                    <option value="MRD">MRD</option>
                    <option value="Lab">Lab</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Blood Bank">Blood Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={ticketDateFilter.startDate}
                    onChange={(e) =>
                      setTicketDateFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={ticketDateFilter.endDate}
                    onChange={(e) =>
                      setTicketDateFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              {(ticketSearchTerm ||
                ticketStatusFilter !== "all" ||
                ticketSeverityFilter !== "all" ||
                ticketDepartmentFilter ||
                ticketDateFilter.startDate ||
                ticketDateFilter.endDate) && (
                  <div className="flex justify-center">
                    <button
                      onClick={clearTicketFilters}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-6 py-3 rounded-xl transition-all duration-300 font-bold"
                    >
                      <X className="h-5 w-5" />
                      Clear All Ticket Filters
                    </button>
                  </div>
                )}
            </div>
          </>
        )}

        {/* Doctors Section - Only show when mainView is "doctors" */}
        {mainView === "doctors" && (
          <>
            <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-6 w-6 text-indigo-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Doctors Management
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditingDoctor(null);
                    setDoctorFormData({
                      name: "",
                      studies: "",
                      image: "",
                      specialization: "",
                      displayOrder: 0,
                    });
                    setShowDoctorForm(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 dark:from-indigo-500/20 to-purple-500/10 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl hover:from-indigo-500/20 dark:hover:from-indigo-500/30 hover:to-purple-500/20 dark:hover:to-purple-500/30 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  Add New Doctor
                </button>
              </div>

              {/* Doctor Form */}
              {showDoctorForm && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </h4>
                  <form
                    onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                          Doctor Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={doctorFormData.name}
                          onChange={(e) =>
                            setDoctorFormData({
                              ...doctorFormData,
                              name: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                          placeholder="e.g., Dr. Rajesh Kumar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={doctorFormData.specialization}
                          onChange={(e) =>
                            setDoctorFormData({
                              ...doctorFormData,
                              specialization: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                          placeholder="e.g., Cardiologist, Neurologist"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                        Studies/Qualifications <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={doctorFormData.studies}
                        onChange={(e) =>
                          setDoctorFormData({
                            ...doctorFormData,
                            studies: e.target.value,
                          })
                        }
                        required
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        placeholder="e.g., MBBS, MD in Cardiology, PhD"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                        Doctor Image (URL or Base64)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={doctorFormData.image}
                          onChange={(e) =>
                            setDoctorFormData({
                              ...doctorFormData,
                              image: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                          placeholder="Enter image URL or paste base64 data URI"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="doctor-image-upload"
                          />
                          <label
                            htmlFor="doctor-image-upload"
                            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/50 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-all duration-300 cursor-pointer w-fit"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Upload Image
                          </label>
                        </div>
                      </div>
                      {doctorFormData.image && (
                        <div className="mt-2 w-32 aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                          <img
                            src={doctorFormData.image}
                            alt="Doctor preview"
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                          📐 Recommended Image Dimensions:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1 ml-4 list-disc">
                          <li><strong>Size:</strong> 400 x 400 pixels (square, 1:1 ratio)</li>
                          <li><strong>Minimum:</strong> 300 x 300 pixels</li>
                          <li><strong>Maximum:</strong> 800 x 800 pixels</li>
                          <li><strong>Format:</strong> JPG, PNG, or WebP</li>
                          <li><strong>File Size:</strong> Maximum 5MB</li>
                        </ul>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 mb-2">
                          💡 Tip: Use square images for best results. The image will be cropped to fit if it's not square.
                        </p>
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                          Use this link to resize image:
                        </p>
                        <a
                          href="https://resizer.zeeconvert.com/resize-image-to-1x1/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Resize image to square (1:1) using online tool
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={doctorFormData.displayOrder}
                        onChange={(e) =>
                          setDoctorFormData({
                            ...doctorFormData,
                            displayOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Lower numbers appear first
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 dark:from-green-500/20 to-emerald-500/10 dark:to-emerald-500/20 border border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-400 px-6 py-2 rounded-xl hover:from-green-500/20 dark:hover:from-green-500/30 hover:to-emerald-500/20 dark:hover:to-emerald-500/30 transition-all duration-300"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {editingDoctor ? "Update Doctor" : "Create Doctor"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDoctorForm}
                        className="flex items-center gap-2 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl hover:bg-gray-600 transition-all duration-300"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Doctors List */}
              {doctorsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No doctors added yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Click "Add New Doctor" to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className={`bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg border overflow-hidden ${doctor.isActive
                        ? "border-green-500/30"
                        : "border-gray-700 opacity-60"
                        } hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-300`}
                    >
                      {doctor.image && (
                        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                              {doctor.name}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${doctor.isActive
                              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30"
                              : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                              }`}
                          >
                            {doctor.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {doctor.studies && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                            {doctor.studies}
                          </p>
                        )}

                        {doctor.specialization && (
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                            {doctor.specialization}
                          </p>
                        )}

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/50 px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor._id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/50 px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Rooms Section - Only show when mainView is "rooms" */}
        {mainView === "rooms" && (
          <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-cyan-500/20 rounded-2xl">
                <BedDouble className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hospital Rooms & Beds</h2>
                <p className="text-gray-500 dark:text-gray-400">Inventory and categorization of all available beds</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-500/90 shadow-lg">
                    <th className="px-6 py-4 text-sm font-black text-black uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-sm font-black text-black uppercase tracking-wider">Bed Category</th>
                    <th className="px-6 py-4 text-sm font-black text-black uppercase tracking-wider">Room No.s</th>
                    <th className="px-6 py-4 text-sm font-black text-black uppercase tracking-wider text-right">Total Beds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    { sno: 1, category: "General Ward", rooms: "3001-3023", beds: 23 },
                    { sno: 2, category: "Twin Sharing Room", rooms: "2010-2020", beds: 10 },
                    { sno: 3, category: "Single Room AC", rooms: "1001-1025", beds: 25 },
                    { sno: 4, category: "Single Room Non AC", rooms: "1026-1036", beds: 10 },
                    { sno: 5, category: "Deluxe Rooms", rooms: "2021-2035", beds: 15 },
                    { sno: 6, category: "Suite Rooms", rooms: "3024-3030", beds: 6 },
                    { sno: 7, category: "ICU", rooms: "0001-0040", beds: 40 },
                    { sno: 8, category: "CT ICU", rooms: "1101-1110", beds: 10 },
                    { sno: 9, category: "Labour ward", rooms: "2101-2105", beds: 5 }
                  ].map((room, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors font-bold">{room.sno}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{room.category}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">{room.rooms}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        <span className="inline-block px-3 py-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-yellow-500/30 transition-all">
                          {room.beds}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-600 shadow-[0_-4px_20px_rgba(37,99,235,0.3)]">
                    <td colSpan={3} className="px-6 py-5 text-right font-black text-white text-xl uppercase tracking-widest">Total Beds</td>
                    <td className="px-6 py-5 text-right font-black text-white text-3xl">144</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl">
                <p className="text-indigo-400 font-bold text-sm uppercase mb-2">Ward Capacity</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">23 <span className="text-sm font-normal text-gray-500">General Beds</span></p>
              </div>
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl">
                <p className="text-cyan-400 font-bold text-sm uppercase mb-2">Critical Care</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">50 <span className="text-sm font-normal text-gray-500">ICU Beds</span></p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                <p className="text-purple-400 font-bold text-sm uppercase mb-2">Private Rooms</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">56 <span className="text-sm font-normal text-gray-500">Premium Units</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Only show for feedbacks view */}
        {mainView === "feedbacks" && (
          <div className="flex space-x-2 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl w-fit shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("opd")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${activeTab === "opd"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              OPD Feedback ({filteredFeedback.opd.length})
            </button>
            <button
              onClick={() => setActiveTab("ipd")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${activeTab === "ipd"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              IPD Feedback ({filteredFeedback.ipd.length})
            </button>
          </div>
        )}

        {/* Data Table - Only show for feedbacks or tickets view */}
        {(mainView === "feedbacks" || mainView === "tickets") && (
          <div className="bg-white dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {loading || (mainView === "tickets" && ticketsLoading) ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">
                  {mainView === "tickets"
                    ? "Loading tickets..."
                    : "Loading feedback data..."}
                </p>
              </div>
            ) : currentData.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No{" "}
                  {mainView === "tickets"
                    ? "tickets"
                    : `${activeTab.toUpperCase()} feedback`}{" "}
                  data found
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {mainView === "tickets"
                    ? "No tickets have been submitted yet"
                    : "Submit some feedback to see it here"}
                </p>
              </div>
            ) : mainView === "tickets" ? (
              <div className="flex flex-col gap-6 p-6">
                <ComplaintHeatmap tickets={filteredTickets} />
                <div className="overflow-x-auto bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-3xl pb-2">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        S.No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Ticket ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Issue Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Severity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-0 ${index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/20" : "bg-transparent"
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="max-w-xs truncate" title={ticket.title}>
                            {ticket.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {ticket.issueCategory || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {ticket.department}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.severity === "high"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : ticket.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                              }`}
                          >
                            {ticket.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${ticket.status === "open"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : ticket.status === "in-progress"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                              }`}
                          >
                            {getTicketStatusIcon(ticket.status)}
                            {ticket.status.replace("-", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-500">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                clearUnread(ticket.id);
                                setChatTicketId(ticket.id);
                              }}
                              className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 rounded-lg hover:bg-indigo-500/30 transition-colors text-xs"
                            >
                              <span className="flex items-center gap-2">
                                Chat
                                {unread[ticket.id] ? (
                                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black">
                                    {unread[ticket.id]}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                const newStatus =
                                  ticket.status === "open"
                                    ? "in-progress"
                                    : ticket.status === "in-progress"
                                      ? "resolved"
                                      : "open";
                                updateTicket(ticket.id, { status: newStatus });
                              }}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors text-xs"
                            >
                              Update Status
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this ticket?"
                                  )
                                ) {
                                  deleteTicket(ticket.id);
                                }
                              }}
                              className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                {/* Chat Sidebar */}
                {chatTicketId && (
                  <div className="fixed inset-0 z-50">
                    <div
                      className="absolute inset-0 bg-black/50"
                      onClick={() => setChatTicketId(null)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="w-full max-w-2xl h-[80vh] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4">
                        <TicketChat
                          ticketId={chatTicketId}
                          role="admin"
                          onClose={() => setChatTicketId(null)}
                          title={`Ticket Chat • ${chatTicketId}`}
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gradient-to-r dark:from-blue-50 dark:to-cyan-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        S.No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        UHID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        Mobile
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        Overall Rating
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {(currentData as FeedbackData[]).map((item, index) => (
                      <tr
                        key={item.id || `feedback-${index}`}
                        className={`group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-0 ${index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/20" : "bg-transparent"
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {item.uhid}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {item.mobile}
                        </td>
                        <td className="px-6 py-4 text-sm">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${item.overallExperience === "Excellent"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : item.overallExperience === "Good"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              }`}
                          >
                            <span className="text-sm">
                              {item.overallExperience === "Excellent"
                                ? "😊"
                                : item.overallExperience === "Good"
                                  ? "😐"
                                  : "😞"}
                            </span>
                            {item.overallExperience}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats - Only show for feedbacks or tickets view */}
        {
          (mainView === "feedbacks" || mainView === "tickets") && (
            <div className="mt-8">
              {mainView === "tickets" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                      Total Tickets
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tickets.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                      Open Tickets
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tickets.filter((t) => t.status === "open").length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">
                      Resolved Tickets
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tickets.filter((t) => t.status === "resolved").length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                      {dateFilter.isActive
                        ? "Filtered Submissions"
                        : "Total Submissions"}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {filteredFeedback.opd.length + filteredFeedback.ipd.length}
                    </p>
                    {dateFilter.isActive && (
                      <p className="text-sm text-green-600 dark:text-green-500/80 mt-1">
                        of {feedback.opd.length + feedback.ipd.length} total
                      </p>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                      OPD Feedback
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {filteredFeedback.opd.length}
                    </p>
                    {dateFilter.isActive && (
                      <p className="text-sm text-blue-600 dark:text-blue-500/80 mt-1">
                        of {feedback.opd.length} total
                      </p>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">
                      IPD Feedback
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {filteredFeedback.ipd.length}
                    </p>
                    {dateFilter.isActive && (
                      <p className="text-sm text-purple-600 dark:text-purple-500/80 mt-1">
                        of {feedback.ipd.length} total
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminPanel;
