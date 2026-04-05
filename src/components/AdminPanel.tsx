import React, { useState, useEffect } from "react";
import DaywiseAnalysisPage from "./DaywiseAnalysisPage";
import FeedbackQuestionsEditor from "./FeedbackQuestionsEditor";
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
  Bell,
  Plus,
  Edit,
  Trash2,
  Stethoscope,
  Image as ImageIcon,
  ExternalLink,
  EyeOff,
  Settings,
  MessageSquareQuote,
  ArrowLeft,
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
  AuthUser,
  getAuthToken,
  HospitalSettings,
  getHospitalSettings,
  updateHospitalSettings,
  Testimonial,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  deleteAllTestimonials,
} from "../services/apiService";
import { useTickets, Ticket } from "../hooks/useTickets";
import ComplaintHeatmap from "./ComplaintHeatmap";
import TicketChat from "./TicketChat";
import ThemeToggle from "./ThemeToggle";
import { useChatNotifications } from "../hooks/useChatNotifications";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface AdminPanelProps {
  onSettingsUpdate?: () => void;
  onNavigate?: (tab: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSettingsUpdate, onNavigate }) => {
  // State to show/hide daywise analysis page
  const [showDaywisePage, setShowDaywisePage] = useState(false);
  
  // State to show/hide Feedback Questions Editor
  // State to show/hide Feedback Questions Editor
  const [showQuestionsEditor, setShowQuestionsEditor] = useState(false);

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
  const [mainView, setMainView] = useState<"feedbacks" | "tickets" | "floors" | "doctors" | "departments" | "settings" | "testimonials">("feedbacks");

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

  // Testimonials management states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialFormData, setTestimonialFormData] = useState<Testimonial>({
    name: "",
    role: "",
    hospital: "",
    text: "",
    image: "",
    order_index: 0,
  });

  // Image Cropping States
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropperRef = React.useRef<HTMLDivElement>(null);
  const cropperImgRef = React.useRef<HTMLImageElement>(null);

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
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Hospital settings state
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    hospital_name: "Vikram ENT Hospital",
    hospital_location: "Coimbatore",
    contact_email: "info@vikramhospital.com",
    contact_phone: "+91 422 1234567",
    whatsapp_number: "+91 9876543210",
    chat_support_link: "https://wa.me/919876543210"
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load hospital settings
  const loadHospitalSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await getHospitalSettings();
      if (response.success && response.data) {
        setHospitalSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const response = await updateHospitalSettings(hospitalSettings);
      if (response.success) {
        alert("Settings updated successfully!");
        // Refresh global state
        if (onSettingsUpdate) onSettingsUpdate();
      } else {
        alert(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings");
    } finally {
      setSettingsLoading(false);
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

  // Testimonials handling
  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const response = await getTestimonials();
      if (response.success && response.data) {
        setTestimonials(response.data);
      }
    } catch (error) {
      console.error("Failed to load testimonials:", error);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleCreateOrUpdateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialsLoading(true);
    try {
      let response;
      if (editingTestimonial && editingTestimonial.id) {
        response = await updateTestimonial(editingTestimonial.id, testimonialFormData);
      } else {
        response = await createTestimonial(testimonialFormData);
      }

      if (response.success) {
        alert(editingTestimonial ? "Testimonial updated!" : "Testimonial created!");
        setShowTestimonialForm(false);
        setEditingTestimonial(null);
        setTestimonialFormData({ name: "", role: "", hospital: "", text: "", image: "", order_index: 0 });
        loadTestimonials();
      } else {
        alert("Failed to save testimonial");
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const response = await deleteTestimonial(id);
      if (response.success) {
        loadTestimonials();
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleDeleteAllTestimonials = async () => {
    if (!window.confirm("DANGER: Are you sure you want to delete ALL testimonials? This action cannot be undone.")) return;
    if (!window.confirm("FINAL CONFIRMATION: Please confirm again that you want to permanently delete every testimonial.")) return;
    
    setTestimonialsLoading(true);
    try {
      const response = await deleteAllTestimonials();
      if (response.success) {
        alert("All testimonials deleted successfully.");
        loadTestimonials();
      } else {
        alert(response.message || "Failed to delete testimonials");
      }
    } catch (error) {
      console.error("Error deleting all testimonials:", error);
      alert("An unexpected error occurred while deleting testimonials.");
    } finally {
      setTestimonialsLoading(false);
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
        loadHospitalSettings();
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
      setLoginError("Please enter both email and password");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await login({ email, password });
      
      if (response.success && response.data?.user) {
        setLoginSuccess(true);
        setIsLoggingIn(false);
        
        const userData = response.data.user;
        const token = response.data.token;

        if (token) localStorage.setItem("authToken", token);
        localStorage.setItem("authUser", JSON.stringify(userData));
        setCurrentUser(userData);

        setTimeout(() => {
          setIsAuthenticated(true);
          setLoginSuccess(false);
        }, 1500);
      } else {
        setLoginError(response.message || "Invalid credentials. Please try again.");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login attempt failed:", error);
      setLoginError("Login failed. Please check your connection.");
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

  const handleTestimonialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result as string);
        setShowCropper(true);
        setCropPosition({ x: 0, y: 0 });
        setCropScale(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = () => {
    if (!cropperImgRef.current || !cropperRef.current) return;
    
    const canvas = document.createElement('canvas');
    const size = 400; // Final resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const img = cropperImgRef.current;
      const maskSize = 300; // The size of the circle in the UI
      
      // Calculate how much of the original image is visible in the 300x300 container
      // then scale that to the 400x400 canvas
      const scaleFactor = img.naturalWidth / (img.width);
      
      // The math effectively maps the UI container state to the natural image pixels
      const drawX = (cropPosition.x - (img.width - maskSize)/2) * (img.naturalWidth / img.width);
      const drawY = (cropPosition.y - (img.height - maskSize)/2) * (img.naturalHeight / img.naturalHeight);
      
      // Simplified: Just draw what's visible in the container
      // Actually, let's use a simpler approach: draw the current view onto canvas
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw centered with scaling
      const renderSize = size * cropScale;
      const offsetX = (size - renderSize) / 2 + (cropPosition.x * (size / maskSize));
      const offsetY = (size - renderSize) / 2 + (cropPosition.y * (size / maskSize));
      
      ctx.drawImage(img, offsetX, offsetY, renderSize, renderSize * (img.naturalHeight / img.naturalWidth));
      
      setTestimonialFormData({
        ...testimonialFormData,
        image: canvas.toDataURL('image/webp', 0.8)
      });
      setShowCropper(false);
    }
  };

  const handleCropperDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    
    setCropPosition({
      x: cropPosition.x + dx,
      y: cropPosition.y + dy
    });
    
    setDragStart({ x: clientX, y: clientY });
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

  // Generate and download daily report as PDF for CEO
  const sendReportToCEO = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const todayDate = today.toISOString().split("T")[0];

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(25, 25, 25);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DAILY PERFORMANCE REPORT", 15, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Period: ${todayStr}`, 15, 30);

    // Summary Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Summary", 15, 55);

    const todayOPD = feedback.opd.filter((f) => f.date === todayDate).length;
    const todayIPD = feedback.ipd.filter((f) => f.date === todayDate).length;
    const todayTickets = tickets.filter((t) => {
      const ticketDate = new Date(t.createdAt).toISOString().split("T")[0];
      return ticketDate === todayDate;
    }).length;

    const allTodayFeedback = [
      ...feedback.opd.filter((f) => f.date === todayDate),
      ...feedback.ipd.filter((f) => f.date === todayDate),
    ];
    const totalFeedback = allTodayFeedback.length;

    // Summary Table
    autoTable(doc, {
      startY: 60,
      head: [["Category", "Volume"]],
      body: [
        ["OPD Feedback Received", todayOPD.toString()],
        ["IPD Feedback Received", todayIPD.toString()],
        ["Total Feedbacks Today", totalFeedback.toString()],
        ["New Support Tickets", todayTickets.toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Rating Distribution Section
    const excellent = allTodayFeedback.filter(
      (f) => f.overallExperience === "Excellent"
    ).length;
    const good = allTodayFeedback.filter(
      (f) => f.overallExperience === "Good"
    ).length;
    const fair = allTodayFeedback.filter(
      (f) => f.overallExperience === "Fair" || f.overallExperience === "Average"
    ).length;
    const poor = allTodayFeedback.filter(
      (f) => f.overallExperience === "Poor"
    ).length;

    const ratingData = [
      [
        "Excellent",
        excellent.toString(),
        totalFeedback > 0 ? `${((excellent / totalFeedback) * 100).toFixed(1)}%` : "0%",
      ],
      [
        "Good",
        good.toString(),
        totalFeedback > 0 ? `${((good / totalFeedback) * 100).toFixed(1)}%` : "0%",
      ],
      [
        "Fair/Average",
        fair.toString(),
        totalFeedback > 0 ? `${((fair / totalFeedback) * 100).toFixed(1)}%` : "0%",
      ],
      [
        "Poor",
        poor.toString(),
        totalFeedback > 0 ? `${((poor / totalFeedback) * 100).toFixed(1)}%` : "0%",
      ],
    ];

    doc.setFontSize(16);
    doc.text("Patient Experience Ratings", 15, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Rating", "Count", "Percentage"]],
      body: ratingData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105] },
    });

    // Ticket Status Section
    const openTickets = tickets.filter((t) => t.status === "open").length;
    const inProgressTickets = tickets.filter(
      (t) => t.status === "in-progress"
    ).length;
    const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

    doc.setFontSize(16);
    doc.text("Ticket Management Status", 15, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Status", "Current Count"]],
      body: [
        ["Open Tickets", openTickets.toString()],
        ["In Progress", inProgressTickets.toString()],
        ["Resolved Tickets", resolvedTickets.toString()],
        ["Total Database Tickets", tickets.length.toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [245, 158, 11] },
    });

    // Footer with generated time
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by Admin Dashboard on ${new Date().toLocaleString()} | Confidential Daily Report`,
      15,
      footerY
    );

    // Save/Download the PDF
    doc.save(`CEO_Daily_Report_${todayDate}.pdf`);
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

  // Show login form if not authenticated
  if (!isAuthenticated) {
    console.log("Rendering login view. State:", { isLoggingIn, loginSuccess });
    return (
      <div className="min-h-screen bg-white dark:bg-[#030303] flex items-center justify-center p-4 lg:p-6">
        <div className="bg-gray-50 dark:bg-[#0c0c0c]/80 backdrop-blur-md rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[1200px] min-h-[500px] lg:min-h-[700px] flex flex-col lg:flex-row relative border border-gray-200 dark:border-white/10">

          {/* Left Side - Hero/Illustration */}

          {/* Left Side - Hero/Illustration (Interactive Shapes) */}
          <div className="w-full h-48 lg:h-auto lg:w-1/2 bg-gray-100 dark:bg-[#080808] flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-full absolute inset-0">
              <LoginShapes focusedInput={focusedInput} emailLength={email.length} />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#0c0c0c]/50">

            {/* Logo area */}
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-[#1a1a1a] rounded-xl mb-4 text-white dark:text-indigo-400 border dark:border-white/10">
                <div className="w-6 h-1 bg-white dark:bg-indigo-400 rounded-full"></div>
                <div className="absolute w-1 h-6 bg-white dark:bg-indigo-400 rounded-full"></div>
              </div>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Admin Login</h1>
              <p className="text-gray-500 dark:text-gray-400">Please enter your credentials to access the panel</p>
            </div>

            {loginSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-green-600 font-bold text-lg animate-pulse">Verification successful! Redirecting...</p>
              </div>
            ) : isLoggingIn ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">Authenticating...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a]/50"
                    placeholder="admin@hospital.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a]/50"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center justify-center gap-2"
                >
                  Sign In
                  <Eye className="h-5 w-5" />
                </button>

                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                    Secure Administrative Access
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
    <>
    <div className="w-full min-h-screen bg-white dark:bg-[#030303] text-gray-900 dark:text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full p-4 sm:p-8">
        {/* Header */}
        <div className="bg-white dark:bg-[#0c0c0c]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <Database className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Feedback Admin Panel
            </h1>
          </div>

          <div className="flex gap-4 flex-wrap items-center">
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Dashboard
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-all duration-300 font-bold"
            >
              <X className="h-4 w-4" />
              Logout
            </button>

            <button
              onClick={loadFeedback}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 font-bold shadow-sm"
            >
              <Eye className="h-4 w-4 text-indigo-500" />
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
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
            >
              <Download className="h-4 w-4 text-purple-500" />
              Export {mainView === "tickets" ? "TICKETS" : activeTab.toUpperCase()} Excel
            </button>

            <button
              onClick={sendReportToCEO}
              className="flex items-center gap-2 bg-emerald-50 dark:bg-green-500/20 border border-emerald-200 dark:border-green-500/50 text-emerald-700 dark:text-green-400 px-4 py-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-green-500/30 transition-all duration-300 font-bold shadow-sm"
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
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg transform ${mainView === "feedbacks"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white scale-105 shadow-xl border border-indigo-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-2" />
              Filter Feedbacks
            </button>
          )}
          {isViewAllowed("tickets") && (
            <button
              onClick={() => {
                setMainView("tickets");
                setActiveTab("tickets");
              }}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg transform ${mainView === "tickets"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-xl border border-purple-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-2" />
              View Tickets
            </button>
          )}
          {isViewAllowed("doctors") && (
            <button
              onClick={() => {
                setMainView("doctors");
                loadDoctors();
              }}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg transform ${mainView === "doctors"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-105 shadow-xl border border-indigo-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-2" />
              Manage Doctors
            </button>
          )}
          {isViewAllowed("testimonials") && (
            <button
              onClick={() => {
                setMainView("testimonials");
                loadTestimonials();
              }}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg transform ${mainView === "testimonials"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-105 shadow-xl border border-blue-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <MessageSquareQuote className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-2" />
              Manage Testimonials
            </button>
          )}
          {isViewAllowed("settings") && (
            <button
              onClick={() => {
                setMainView("settings");
                loadHospitalSettings();
              }}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg transform ${mainView === "settings"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white scale-105 shadow-xl border border-teal-500/50"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-2" />
              Hospital Settings
            </button>
          )}

          {currentUser?.role === 'COO' && (
            <div className="flex gap-4 flex-wrap w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDaywisePage(true)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-black text-sm md:text-base transition-all duration-300 shadow-lg transform ${showDaywisePage
                  ? "bg-blue-600 text-white scale-105 shadow-xl border border-blue-500/50"
                  : "bg-blue-50 dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 hover:scale-105"
                  }`}
              >
                <BarChart3 className="h-5 w-5 inline-block mr-2" />
                Show Day Wise Analysis
              </button>
              

              <button
                onClick={() => setShowQuestionsEditor(true)}
                className="flex-1 md:flex-none px-6 py-4 rounded-xl font-black text-sm md:text-base transition-all duration-300 shadow-lg transform bg-violet-50 dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-500/50 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-gray-700 hover:scale-105"
              >
                <Edit className="h-5 w-5 inline-block mr-2" />
                Edit Feedback Questions
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



        {/* Settings Section - Only show when mainView is "settings" */}
        {mainView === "settings" && (
          <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-teal-500/20 rounded-2xl">
                <Settings className="h-8 w-8 text-teal-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hospital Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage hospital name and contact information</p>
              </div>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Hospital Name</label>
                  <input
                    type="text"
                    value={hospitalSettings.hospital_name}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, hospital_name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="Enter hospital name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Location</label>
                  <input
                    type="text"
                    value={hospitalSettings.hospital_location}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, hospital_location: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="Enter location (e.g. Coimbatore)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Contact Email</label>
                  <input
                    type="email"
                    value={hospitalSettings.contact_email}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, contact_email: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="Email address for links"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Contact Phone</label>
                  <input
                    type="text"
                    value={hospitalSettings.contact_phone}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, contact_phone: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="Phone number for links"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={hospitalSettings.whatsapp_number}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, whatsapp_number: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="WhatsApp number with country code"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Chat Support Link</label>
                  <input
                    type="text"
                    value={hospitalSettings.chat_support_link}
                    onChange={(e) => setHospitalSettings({...hospitalSettings, chat_support_link: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-800 dark:text-white"
                    placeholder="Direct link for chat support"
                  />
                </div>
              </div>

              {/* Hospital Stats Section */}
              <div className="mt-8 border-t border-gray-200 dark:border-white/5 pt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Hero Section Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Years of Experience</label>
                    <input
                      type="number"
                      value={hospitalSettings.years_experience || 0}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, years_experience: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Expert Doctors</label>
                    <input
                      type="number"
                      value={hospitalSettings.expert_doctors || 0}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, expert_doctors: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Successful Procedures</label>
                    <input
                      type="text"
                      value={hospitalSettings.successful_procedures}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, successful_procedures: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-800 dark:text-white"
                      placeholder="e.g. 5,00,000+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Lives Touched</label>
                    <input
                      type="text"
                      value={hospitalSettings.lives_touched}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, lives_touched: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-800 dark:text-white"
                      placeholder="e.g. 50,00,000+"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-10 py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl hover:shadow-teal-500/20 transition-all flex items-center gap-2"
                >
                  {settingsLoading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials Management Section - Only show when mainView is "testimonials" */}
        {mainView === "testimonials" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <MessageSquareQuote className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Testimonials</h2>
                  <div className="flex items-center gap-3 mt-1 cursor-pointer select-none group/toggle"
                    onClick={async () => {
                      const newValue = !hospitalSettings.show_testimonials;
                      setHospitalSettings({...hospitalSettings, show_testimonials: newValue});
                      const response = await updateHospitalSettings({...hospitalSettings, show_testimonials: newValue});
                      if (response.success && onSettingsUpdate) onSettingsUpdate();
                    }}
                  >
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${hospitalSettings.show_testimonials ? 'bg-blue-500' : 'bg-gray-400'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all transform ${hospitalSettings.show_testimonials ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover/toggle:text-blue-400 transition-colors">
                      {hospitalSettings.show_testimonials ? 'Visible on Dashboard' : 'Hidden from Dashboard'}
                    </span>
                    {hospitalSettings.show_testimonials ? <Eye className="h-4 w-4 text-blue-400 opacity-50" /> : <EyeOff className="h-4 w-4 text-gray-500 opacity-50" />}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {testimonials.length > 0 && (
                  <button 
                    onClick={handleDeleteAllTestimonials}
                    disabled={testimonialsLoading}
                    className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete All
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEditingTestimonial(null);
                    setTestimonialFormData({ name: "", role: "", hospital: "", text: "", image: "", order_index: (testimonials.length + 1) });
                    setShowTestimonialForm(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Add Testimonial
                </button>
              </div>
            </div>

            {/* Testimonial Form Modal */}
            {showTestimonialForm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
                  <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
                    </h3>
                    <button 
                      onClick={() => setShowTestimonialForm(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                    <form onSubmit={handleCreateOrUpdateTestimonial} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Doctor Name</label>
                        <input
                          type="text"
                          required
                          value={testimonialFormData.name}
                          onChange={(e) => setTestimonialFormData({...testimonialFormData, name: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="Dr. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Role/Designation</label>
                        <input
                          type="text"
                          required
                          value={testimonialFormData.role}
                          onChange={(e) => setTestimonialFormData({...testimonialFormData, role: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="ENT Specialist"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Hospital (Optional)</label>
                        <input
                          type="text"
                          value={testimonialFormData.hospital}
                          onChange={(e) => setTestimonialFormData({...testimonialFormData, hospital: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="City Medical Center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Display Order</label>
                        <input
                          type="number"
                          value={testimonialFormData.order_index}
                          onChange={(e) => setTestimonialFormData({...testimonialFormData, order_index: parseInt(e.target.value)})}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Testimonial Text</label>
                      <textarea
                        required
                        rows={4}
                        value={testimonialFormData.text}
                        onChange={(e) => setTestimonialFormData({...testimonialFormData, text: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                        placeholder="Write the testimonial content here..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Testimonial Image (URL or Upload)</label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="url"
                          value={testimonialFormData.image}
                          onChange={(e) => setTestimonialFormData({...testimonialFormData, image: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="https://example.com/image.jpg"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTestimonialImageUpload}
                            className="hidden"
                            id="testimonial-image-upload"
                          />
                          <label
                            htmlFor="testimonial-image-upload"
                            className="flex items-center gap-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-6 py-3 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all cursor-pointer w-fit text-sm font-bold shadow-sm"
                          >
                            <ImageIcon className="h-5 w-5" />
                            Upload from Device
                          </label>
                        </div>
                      </div>
                      
                      {testimonialFormData.image && (
                        <div className="mt-4 flex items-center gap-6 p-4 bg-blue-500/5 rounded-3xl border border-blue-500/10 w-fit">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                            <img 
                              src={testimonialFormData.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Image Preview</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[150px] leading-tight">This photo will appear in the circle next to the doctor's name</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={testimonialsLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {testimonialsLoading ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

            {/* Testimonials List */}
            {testimonialsLoading && testimonials.length === 0 ? (
              <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="bg-white dark:bg-gray-800/40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <MessageSquareQuote className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Testimonials</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md pb-6">
                  Add patient or doctor testimonials to build trust. You can start by loading our sample testimonials and then customize them.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={async () => {
                      setTestimonialsLoading(true);
                      try {
                        const defaults = [
                          { 
                            name: `Dr. Pradnya Gajallewar`, 
                            role: `Consultant and Anesthesiologist`, 
                            hospital: `Bethany Hospital Thane`, 
                            text: `I thank Dr.Vishal Jadhav for your Knowledge and guidance in bringing my project to a good shape. I have already had some positive feedback about my project from some of my friends.`, 
                            image: `https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80`, 
                            order_index: 1 
                          },
                          { 
                            name: `Dr. Rajesh Kumar`, 
                            role: `Senior Surgeon`, 
                            hospital: `City Medical Center`, 
                            text: `The clinical management system has significantly improved our workflow. The attention to detail and professional support provided by the team at Vikram ENT is exceptional.`, 
                            image: `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80`, 
                            order_index: 2 
                          },
                          { 
                            name: `Dr. Anita Sharma`, 
                            role: `ENT Specialist`, 
                            hospital: `Global Health Hospital`, 
                            text: `I highly recommend the specialized training and facilities at Vikram ENT. It has been a pleasure collaborating on complex cases and witnessing the 'Flow of Healing' firsthand.`, 
                            image: `https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=150&q=80`, 
                            order_index: 3 
                          }
                        ];
                        for (const item of defaults) {
                          await createTestimonial(item);
                        }
                        loadTestimonials();
                      } catch (error) {
                        console.error("Error seeding testimonials:", error);
                      } finally {
                        setTestimonialsLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all transition-all hover:scale-105"
                  >
                    <Star className="h-5 w-5" />
                    Load Sample Testimonials
                  </button>
                  <button 
                    onClick={() => {
                      setEditingTestimonial(null);
                      setTestimonialFormData({ name: "", role: "", hospital: "", text: "", image: "", order_index: 1 });
                      setShowTestimonialForm(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                  >
                    <Plus className="h-5 w-5" />
                    Add Your Custom One
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all duration-300 shadow-lg group">
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src={t.image || 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80'} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/20"
                        alt={t.name}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{t.name}</h4>
                        <p className="text-xs text-blue-500 font-medium truncate">{t.role}</p>
                        <p className="text-[10px] text-gray-500 truncate">{t.hospital}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-6 line-clamp-4 font-medium leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                      <button 
                        onClick={() => {
                          setEditingTestimonial(t);
                          setTestimonialFormData(t);
                          setShowTestimonialForm(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => t.id && handleDeleteTestimonial(t.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs - Only show for feedbacks view */}
        {mainView === "feedbacks" && (
          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl w-fit shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("opd")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 transform ${activeTab === "opd"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              OPD ({filteredFeedback.opd.length})
            </button>
            <button
              onClick={() => setActiveTab("ipd")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 transform ${activeTab === "ipd"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              IPD ({filteredFeedback.ipd.length})
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
      {/* Circular Image Cropper Modal */}
      {showCropper && rawImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Customize Profile Photo</h3>
                <p className="text-sm text-gray-500 mt-1">Center the face inside the circular guide</p>
              </div>
              <button 
                onClick={() => setShowCropper(false)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-10 flex flex-col items-center">
              <div 
                ref={cropperRef}
                className="relative w-[300px] h-[300px] bg-gray-100 dark:bg-black rounded-full overflow-hidden cursor-move touch-none border-8 border-blue-500/10 shadow-2xl"
                onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={handleCropperDrag}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY }); }}
                onTouchMove={handleCropperDrag}
                onTouchEnd={() => setIsDragging(false)}
              >
                <img 
                  ref={cropperImgRef}
                  src={rawImage}
                  alt="Crop Target"
                  className="absolute pointer-events-none max-w-none origin-center"
                  style={{
                    transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.width > img.height) {
                       img.style.height = '300px';
                       img.style.width = 'auto';
                    } else {
                       img.style.width = '300px';
                       img.style.height = 'auto';
                    }
                  }}
                />
                {/* Circular Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none ring-[100px] ring-black/60 rounded-full" />
                <div className="absolute inset-0 pointer-events-none border-4 border-blue-500 rounded-full" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent opacity-50" />
              </div>
              
              <div className="w-full mt-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Adjust Zoom</span>
                    <span className="text-xs font-bold text-blue-500 px-3 py-1 bg-blue-500/10 rounded-full">{Math.round(cropScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="0.01"
                    value={cropScale}
                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowCropper(false)}
                    className="flex-1 py-5 px-6 rounded-3xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleApplyCrop}
                    className="flex-1 py-5 px-6 rounded-3xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Save Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

      {/* Feedback Questions Editor Modal - COO only */}
      {showQuestionsEditor && (
        <FeedbackQuestionsEditor onClose={() => setShowQuestionsEditor(false)} />
      )}
    </>
  );
};


export default AdminPanel;
