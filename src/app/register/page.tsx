"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import SignaturePad, { SignaturePadRef } from "@/components/SignaturePad";
import { AlertDialog } from "@/components/ui/alert-dialog";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import apiService from "@/lib/apiService";
import { withPublicPage } from "@/hoc";
import { dataURLtoFile } from "@/utils/data-url-to-file";
import { Eye, EyeOff } from "lucide-react";

interface FormDataType {
  fname: string;
  lname: string;
  username: string;
  employee_id: string;
  email: string;
  contact: string;
  date_hired: string;
  position_id: number | string;
  branch_id: number | string;
  department_id?: number | string;
  password: string;
  password_confirmation: string;
  signature: string;
}

function RegisterPage() {
  const [isRegisterButtonClicked, setIsRegisterButtonClicked] = useState(false);
  const [positions, setPositions] = useState<
    { value: string; label: string }[]
  >([]);
  const [branches, setBranches] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [departments, setDepartments] = useState<
    { value: string; label: string }[]
  >([]);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    description: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState<FormDataType>({
    fname: "",
    lname: "",
    username: "",
    employee_id: "",
    email: "",
    contact: "",
    date_hired: "",
    department_id: "",
    position_id: 0,
    branch_id: 0,
    password: "",
    password_confirmation: "",
    signature: "",
  });
  const [signatureError, setSignatureError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: any;
  }>({});
  const signaturePadRef = useRef<SignaturePadRef>(null);

  // Helper function to check if branch is HO, Head Office, or none
  const isBranchHOOrNone = (branchId: string | number): boolean => {
    if (!branchId) return false;

    // Find the branch from branches array
    const branch = branches.find((b) => {
      const branchValue = String(b.value || "")
        .toLowerCase()
        .trim();
      const branchLabel = String(b.label || "")
        .toLowerCase()
        .trim();
      const branchIdStr = String(branchId).toLowerCase().trim();
      return branchValue === branchIdStr || branchLabel === branchIdStr;
    });

    if (!branch) return false;

    const branchName = branch.label.toLowerCase().trim();
    // Check for various HO/Head Office variations
    return (
      branchName === "ho" ||
      branchName === "head office /ho" ||
      branchName === "head office" ||
      branchName.includes("head office") ||
      branchName === "none" ||
      branchName === "none ho" ||
      branchName.startsWith("ho") ||
      branchName.startsWith("ho-") ||
      branchName.endsWith("/ho")
    );
  };

  // Helper function to check if position is Branch Manager or Area Manager
  const isManagerPosition = (positionId: string | number): boolean => {
    if (!positionId) return false;

    // Find the position from positions array
    const position = positions.find((p) => {
      const positionValue = String(p.value || "")
        .toLowerCase()
        .trim();
      const positionLabel = String(p.label || "")
        .toLowerCase()
        .trim();
      const positionIdStr = String(positionId).toLowerCase().trim();
      return positionValue === positionIdStr || positionLabel === positionIdStr;
    });

    if (!position) return false;

    const positionName = position.label.toLowerCase().trim();
    // Check for Branch Manager or Area Manager
    return (
      positionName === "branch manager" ||
      positionName === "area manager" ||
      positionName.includes("branch manager") ||
      positionName.includes("area manager")
    );
  };

  // Load positions from client data service.api
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch positions using API service
        const positionsDataFromAPI = await apiService.getPositions();

        // Fetch departments using API service
        const departmentsDataFromAPI = await apiService.getDepartments();

        // Fetch branches using API service
        const branchDataFromAPI = await apiService.getBranches();
        // Convert from {id, name} to {value, label} format for Combobox

        setPositions(positionsDataFromAPI);
        setDepartments(departmentsDataFromAPI);
        setBranches(branchDataFromAPI);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Data will remain empty if API fails
      }
    };

    fetchData();
  }, []);

  const showAlert = (
    title: string,
    description: string,
    type: "success" | "error" | "warning" | "info",
    onConfirm?: () => void,
  ) => {
    setAlertDialog({
      open: true,
      title,
      description,
      type,
      onConfirm: onConfirm || (() => {}),
    });
  };

  // Real-time validation functions
  const validateField = (fieldName: string, value: string) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;
      case "employee_id":
        if (value && !/^\d{4}-\d{6}$/.test(value)) {
          errors.employee_id = "Format: 1234-567890 (4 digits, dash, 6 digits)";
        } else {
          delete errors.employee_id;
        }
        break;
      case "password":
        if (value && value.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password =
            "Password must contain uppercase, lowercase, and number";
        } else {
          delete errors.password;
        }
        break;
      case "password_confirmation":
        if (value && value !== formData.password) {
          errors.password_confirmation = "Passwords do not match";
        } else {
          delete errors.password_confirmation;
        }
        break;
      case "contact":
        if (value) {
          if (!/^\d{11}$/.test(value)) {
            errors.contact = "Contact number must be exactly 11 digits";
          } else if (!value.startsWith("09")) {
            errors.contact = "Contact number must start with 09";
          } else {
            delete errors.contact;
          }
        } else {
          delete errors.contact;
        }
        break;
      default:
        if (value.trim() === "") {
          errors[fieldName] = "This field is required";
        } else {
          delete errors[fieldName];
        }
    }

    setFieldErrors(errors);
  };

  const handleRegisterSubmit = async (e: any) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fname.trim()) {
      showAlert("Missing Information", "First name is required!", "error");
      return;
    }

    if (!formData.lname.trim()) {
      showAlert("Missing Information", "Last name is required!", "error");
      return;
    }

    if (!formData.username.trim()) {
      showAlert("Missing Information", "Username is required!", "error");
      return;
    }

    if (!formData.employee_id.trim()) {
      showAlert("Missing Information", "Employee ID is required!", "error");
      return;
    }

    // Validate Employee ID format (1234-567890)
    const employeeIdRegex = /^\d{4}-\d{6}$/;
    if (!employeeIdRegex.test(formData.employee_id)) {
      showAlert(
        "Invalid Employee ID",
        "Employee ID must be in format: 1234-567890 (4 digits, dash, 6 digits)",
        "error",
      );
      return;
    }

    if (!formData.email.trim()) {
      showAlert("Missing Information", "Email is required!", "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert(
        "Invalid Email",
        "Please enter a valid email address!",
        "error",
      );
      return;
    }

    if (!formData.contact.trim()) {
      showAlert("Missing Information", "Contact number is required!", "error");
      return;
    }

    // Validate contact number format (must be 11 digits starting with 09)
    const contactRegex = /^09\d{9}$/;
    if (!contactRegex.test(formData.contact)) {
      if (formData.contact.length !== 11) {
        showAlert(
          "Invalid Contact Number",
          "Contact number must be exactly 11 digits!",
          "error",
        );
      } else if (!formData.contact.startsWith("09")) {
        showAlert(
          "Invalid Contact Number",
          "Contact number must start with 09!",
          "error",
        );
      } else {
        showAlert(
          "Invalid Contact Number",
          "Please enter a valid contact number!",
          "error",
        );
      }
      return;
    }

    if (!formData.date_hired.trim()) {
      showAlert("Missing Information", "Date hired is required!", "error");
      return;
    }

    if (!formData.position_id) {
      showAlert("Missing Information", "Please select your position!", "error");
      return;
    }

    if (!formData.branch_id) {
      showAlert("Missing Information", "Please select your branch!", "error");
      return;
    }

    // Department is only required if branch IS HO/Head Office AND position is NOT Branch Manager or Area Manager
    if (
      isBranchHOOrNone(formData.branch_id) &&
      !isManagerPosition(formData.position_id) &&
      !formData.department_id
    ) {
      showAlert(
        "Missing Information",
        "Department is required for Head Office branches!",
        "error",
      );
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      showAlert(
        "Password Mismatch",
        "Passwords do not match! Please try again.",
        "error",
      );
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      showAlert(
        "Password Too Short",
        "Password must be at least 8 characters long!",
        "warning",
      );
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      showAlert(
        "Weak Password",
        "Password must contain at least one uppercase letter, one lowercase letter, and one number!",
        "warning",
      );
      return;
    }

    // Validate signature - check both formData and ref (SignaturePad stores locally)
    const signatureToValidate =
      signaturePadRef.current?.getSignature() || formData.signature;
    if (!signatureToValidate) {
      setSignatureError(true);
      showAlert(
        "Signature Required",
        "Please draw your digital signature to complete the registration!",
        "warning",
      );
      return;
    }

    setIsRegisterButtonClicked(true);
    // Then send the POST request with the user registration data

    // Get the current signature from SignaturePad (may be local, not in formData yet)
    const currentSignature =
      signaturePadRef.current?.getSignature() || formData.signature;

    const formDataToUpload = new FormData();

    formDataToUpload.append("fname", formData?.fname);
    formDataToUpload.append("lname", formData.lname);
    formDataToUpload.append("username", formData.username);
    // Remove dash from employee_id before sending (keep only numbers)
    formDataToUpload.append(
      "employee_id",
      formData.employee_id.replace(/-/g, ""),
    );
    formDataToUpload.append("email", formData.email);
    formDataToUpload.append("contact", formData.contact);
    formDataToUpload.append("date_hired", formData.date_hired);
    formDataToUpload.append("position_id", String(formData.position_id));
    formDataToUpload.append("branch_id", String(formData.branch_id));
    formDataToUpload.append("department_id", String(formData.department_id));
    formDataToUpload.append("password", formData.password);
    formDataToUpload.append(
      "password_confirmation",
      formData.password_confirmation,
    );

    // Convert signature data URL to File object (PNG) for binary upload
    if (currentSignature) {
      try {
        const signatureFile = dataURLtoFile(currentSignature, "signature.png");

        // Verify file was created correctly
        if (!signatureFile || !(signatureFile instanceof File)) {
          throw new Error("Failed to create signature file");
        }

        // Ensure file has valid size
        if (signatureFile.size === 0) {
          throw new Error("Signature file is empty");
        }

        formDataToUpload.append("signature", signatureFile);

        const data =
          await apiService.createPendingRegistration(formDataToUpload);

        showAlert(
          "Registration Successful!",
          "Account registration submitted successfully! Your registration is pending approval. You will be notified once approved.",
          "success",
          () => {
            // Reset form
            setFormData({
              fname: "",
              lname: "",
              username: "",
              employee_id: "",
              email: "",
              contact: "",
              date_hired: "",
              position_id: 0,
              department_id: "",
              branch_id: 0,
              password: "",
              password_confirmation: "",
              signature: "",
            });
            setSignatureError(false);
            // Redirect to login page
            window.location.href = "/";
          },
        );
      } catch (error: any) {
        if (error.response?.data?.errors) {
          const backendErrors: Record<string, string> = {};

          Object.keys(error.response.data.errors).forEach((field) => {
            backendErrors[field] = error.response.data.errors[field][0];
          });
          setFieldErrors(backendErrors);
        }
        setIsRegisterButtonClicked(false);
      }
    } else {
      console.warn("⚠️ No signature in formData");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50 to-blue-600"></div>

      {/* Single Geometric Pattern Overlay - Gradient from left to right */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Gradient mask for fading effect */}
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                style={{ stopColor: "rgba(255,255,255,0)", stopOpacity: 0 }}
              />
              <stop
                offset="30%"
                style={{ stopColor: "rgba(255,255,255,0)", stopOpacity: 0 }}
              />
              <stop
                offset="60%"
                style={{ stopColor: "rgba(255,255,255,0.3)", stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgba(255,255,255,1)", stopOpacity: 1 }}
              />
            </linearGradient>

            {/* Single hexagon pattern */}
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="100"
              height="87"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="50,8 75,25 75,62 50,79 25,62 25,25"
                fill="rgba(59, 130, 246, 0.12)"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>

          {/* Apply single pattern with gradient mask */}
          <rect
            width="100%"
            height="100%"
            fill="url(#hexagons)"
            mask="url(#patternMask)"
          />

          {/* Create mask for gradient effect */}
          <mask id="patternMask">
            <rect width="100%" height="100%" fill="url(#fadeGradient)" />
          </mask>
        </svg>
      </div>

      {/* Single Geometric Elements - Hexagons only */}
      <div className="absolute top-20 right-20 w-24 h-24 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,10 80,30 80,70 50,90 20,70 20,30"
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="absolute bottom-32 right-40 w-20 h-20 opacity-35">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 85,25 85,75 50,95 15,75 15,25"
            fill="rgba(59, 130, 246, 0.15)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="absolute top-40 left-20 w-16 h-16 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,15 75,35 75,65 50,85 25,65 25,35"
            fill="rgba(59, 130, 246, 0.08)"
            stroke="rgba(59, 130, 246, 0.15)"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Right side additional hexagons */}
      <div className="absolute top-1/2 right-10 w-12 h-12 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,10 80,30 80,70 50,90 20,70 20,30"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.25)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      <div className="absolute bottom-1/2 right-20 w-10 h-10 opacity-25">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,10 80,30 80,70 50,90 20,70 20,30"
            fill="rgba(59, 130, 246, 0.12)"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="0.6"
          />
        </svg>
      </div>
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <PageTransition>
            <Card className="w-full max-w-lg shadow-2xl transform scale-105 bg-white/95 backdrop-blur-sm border-0 relative z-10">
              <CardHeader className="space-y-4">
                {/* Logo at the top of the card */}
                <div className="flex justify-center mb-4">
                  <Link href="/" className="flex items-center space-x-2">
                    <img
                      src="/smct.png"
                      alt="SMCT Group of Companies"
                      className="h-16 w-auto"
                    />
                  </Link>
                </div>
                <CardTitle className="text-2xl text-center text-blue-700">
                  Create your account
                </CardTitle>
                <CardDescription className="text-center">
                  Join us to start your performance evaluation journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fname">First name</Label>
                        <Input
                          id="fname"
                          placeholder="John"
                          value={formData.fname}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              fname: e.target.value,
                            });
                            validateField("fname", e.target.value);
                          }}
                          className={fieldErrors?.fname ? "border-red-500" : ""}
                        />
                        {fieldErrors?.fname && (
                          <p className="text-sm text-red-500">
                            {fieldErrors.fname}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lname">Last name</Label>
                        <Input
                          id="lname"
                          placeholder="Doe"
                          value={formData.lname}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              lname: e.target.value,
                            });
                            validateField("lname", e.target.value);
                          }}
                          className={fieldErrors?.lname ? "border-red-500" : ""}
                        />
                        {fieldErrors?.lname && (
                          <p className="text-sm text-red-500">
                            {fieldErrors?.lname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className={
                          fieldErrors?.username ? "border-red-500" : ""
                        }
                      />
                      {fieldErrors?.username && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        placeholder="****-******"
                        value={formData.employee_id}
                        onChange={(e) => {
                          // Remove all non-numeric characters except dash
                          let value = e.target.value.replace(/[^\d-]/g, "");

                          // Remove all dashes first
                          value = value.replace(/-/g, "");

                          // Limit to 10 digits (4 + 6)
                          value = value.slice(0, 10);

                          // Add dash after first 4 digits
                          if (value.length > 4) {
                            value = value.slice(0, 4) + "-" + value.slice(4);
                          }

                          setFormData({ ...formData, employee_id: value });
                          validateField("employee_id", value);
                        }}
                        onKeyPress={(e) => {
                          // Only allow numbers
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={11}
                        className={
                          fieldErrors?.employee_id ? "border-red-500" : ""
                        }
                      />
                      {fieldErrors?.employee_id && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.employee_id}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, email: value });
                          // Only validate if the email looks complete (has @ and at least one character after it)
                          // This prevents showing errors while typing
                          if (value.includes("@") && value.length > 3) {
                            validateField("email", value);
                          } else if (value === "") {
                            // Clear error if field is empty
                            const errors = { ...fieldErrors };
                            delete errors.email;
                            setFieldErrors(errors);
                          }
                        }}
                        onBlur={(e) => {
                          // Validate on blur to catch any remaining issues
                          validateField("email", e.target.value);
                        }}
                        className={fieldErrors?.email ? "border-red-500" : ""}
                      />
                      {fieldErrors?.email && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="09123456789"
                        value={formData.contact}
                        onChange={(e) => {
                          // Only allow numbers and limit to 11 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                          setFormData({ ...formData, contact: value });
                          validateField("contact", value);
                        }}
                        onKeyPress={(e) => {
                          // Prevent non-numeric input
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={11}
                        className={fieldErrors?.contact ? "border-red-500" : ""}
                      />
                      {fieldErrors?.contact && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.contact}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="date_hired">Date Hired</Label>
                      <Input
                        id="date_hired"
                        type="date"
                        value={formData.date_hired}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            date_hired: e.target.value,
                          });
                          validateField("date_hired", e.target.value);
                        }}
                        className={
                          fieldErrors?.date_hired
                            ? "border-red-500 cursor-pointer"
                            : ""
                        }
                      />
                      {fieldErrors?.date_hired && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.date_hired}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Combobox
                        options={positions}
                        value={formData.position_id}
                        onValueChangeAction={(value) => {
                          const newFormData = {
                            ...formData,
                            position_id: value,
                          };
                          // Clear department if position is Branch Manager or Area Manager
                          if (isManagerPosition(value)) {
                            newFormData.department_id = "";
                          }
                          setFormData(newFormData);
                        }}
                        placeholder="Select your position"
                        searchPlaceholder="Search positions..."
                        emptyText="No positions found."
                        className="w-full cursor-pointer hover:scale-101 transition-all duration-300"
                      />
                      {fieldErrors?.position_id && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.contact}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Combobox
                        options={branches}
                        value={formData.branch_id}
                        onValueChangeAction={(value) => {
                          // Clear department if branch is NOT HO/Head Office
                          const newFormData = { ...formData, branch_id: value };
                          if (!isBranchHOOrNone(value)) {
                            newFormData.department_id = "";
                          }
                          setFormData(newFormData);
                        }}
                        placeholder="Select your branch"
                        searchPlaceholder="Search branches..."
                        emptyText="No branches found."
                        className="w-full cursor-pointer hover:scale-101 transition-all duration-300"
                      />
                      {fieldErrors?.branch_id && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.contact}
                        </p>
                      )}
                    </div>

                    {/* Department - Show only if branch is HO, Head Office, or none, AND position is NOT Branch Manager or Area Manager */}
                    {isBranchHOOrNone(formData.branch_id) &&
                      !isManagerPosition(formData.position_id) && (
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Combobox
                            options={departments}
                            value={String(formData.department_id)}
                            onValueChangeAction={(value) =>
                              setFormData({ ...formData, department_id: value })
                            }
                            placeholder="Select your department"
                            searchPlaceholder="Search departments..."
                            emptyText="No departments found."
                            className="w-1/2 cursor-pointer hover:scale-105 transition-all duration-300"
                            disabled={isManagerPosition(formData.position_id)}
                          />
                          {fieldErrors?.department_id && (
                            <p className="text-sm text-red-500">
                              {fieldErrors?.department_id}
                            </p>
                          )}
                        </div>
                      )}

                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Password</Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            });
                            validateField("password", e.target.value);
                          }}
                          className={
                            fieldErrors?.password
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {fieldErrors?.password && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          type={showPasswordConfirmation ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password_confirmation}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              password_confirmation: e.target.value,
                            });
                            validateField(
                              "password_confirmation",
                              e.target.value,
                            );
                          }}
                          className={
                            fieldErrors?.password_confirmation
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordConfirmation(
                              !showPasswordConfirmation,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label={
                            showPasswordConfirmation
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPasswordConfirmation ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {fieldErrors?.password_confirmation && (
                        <p className="text-sm text-red-500">
                          {fieldErrors?.password_confirmation}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature">Digital Signature *</Label>
                      <SignaturePad
                        ref={signaturePadRef}
                        value={formData.signature}
                        onChangeAction={(signature) => {
                          // Clear signature when null is passed (from Clear button)
                          setFormData({
                            ...formData,
                            signature: signature || "",
                          });
                          if (signature && signatureError) {
                            setSignatureError(false);
                          } else if (!signature) {
                            // Clear signature error when signature is cleared
                            setSignatureError(false);
                          }
                        }}
                        className="w-full"
                        required={true}
                        hasError={signatureError}
                        hideRequestReset={true}
                      />
                      <p className="text-sm text-gray-500">
                        By drawing your signature above, you agree to the terms
                        and conditions of this registration.
                      </p>
                      {fieldErrors?.signature && (
                        <small className="text-red-500">
                          {fieldErrors?.signature}
                        </small>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className={`w-full bg-blue-600 text-white hover:bg-green-700 transition-all duration-300 cursor-pointer hover:scale-110 ${
                        isRegisterButtonClicked
                          ? "transform scale-95 bg-blue-700 shadow-inner"
                          : "hover:scale-105 hover:shadow-lg active:scale-95"
                      }`}
                      disabled={isRegisterButtonClicked}
                    >
                      {isRegisterButtonClicked ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </div>
                </form>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        </div>
      </main>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChangeAction={(open) =>
          setAlertDialog((prev) => ({ ...prev, open }))
        }
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
        onConfirm={alertDialog.onConfirm}
        confirmText="OK"
      />
    </div>
  );
}

// Wrap with HOC for public page with transitions
// redirectIfAuthenticated: true means logged-in users will be redirected to their dashboard
export default withPublicPage(RegisterPage, { redirectIfAuthenticated: true });
