"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import EditUserModal from "@/components/EditUserModal";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { toastMessages } from "@/lib/toastMessages";
import apiService from "@/lib/apiService";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";
import EvaluationsPagination from "@/components/paginationComponent";
import ViewEmployeeModal from "@/components/ViewEmployeeModal";
import { User, useAuth } from "@/contexts/UserContext";
import { Combobox } from "@/components/ui/combobox";
import EvaluationForm from "@/components/evaluation";
import EvaluationTypeModal from "@/components/EvaluationTypeModal";
import ManagerEvaluationForm from "@/components/evaluation/ManagerEvaluationForm";
import BranchEvaluationForm from "@/components/evaluation/BranchEvaluationForm";
import RankNfileHo from "@/components/evaluation/RankNfileHo";
import BasicHo from "@/components/evaluation/BasicHo";

interface Employee {
  id: number;
  fname: string;
  lname: string;
  emp_id: number;
  email: string;
  positions: any;
  departments: any;
  branches: any;
  hireDate: Date;
  roles: any;
  username: string;
  password: string;
  is_active: string;
  avatar?: string | null;
  bio?: string | null;
  contact?: string;
  created_at: string;
  updated_at?: string;
}

interface RoleType {
  id: string;
  name: string;
}

export default function UserManagementTab() {
  const { user } = useAuth();
  
  // Check if evaluator's branch is HO (Head Office)
  const isEvaluatorHO = () => {
    if (!user?.branches) return false;
    
    // Handle branches as array
    if (Array.isArray(user.branches)) {
      const branch = user.branches[0];
      if (branch) {
        const branchName = branch.branch_name?.toUpperCase() || "";
        const branchCode = branch.branch_code?.toUpperCase() || "";
        return branchName === "HO" || branchCode === "HO" || branchName.includes("HEAD OFFICE");
      }
    }
    
    // Handle branches as object
    if (typeof user.branches === 'object') {
      const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
      const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
      return branchName === "HO" || branchCode === "HO" || branchName.includes("HEAD OFFICE");
    }
    
    return false;
  };

  const isHO = isEvaluatorHO();
  
  // Check if employee being evaluated is Area Manager with HO branch
  const isEmployeeAreaManagerWithHO = (employee: User | null): boolean => {
    if (!employee) return false;
    
    // Check position - look for "Area Manager" in various possible fields
    const positionName = (
      employee.positions?.label || 
      employee.positions?.name || 
      (employee as any).position ||
      ""
    ).toLowerCase().trim();
    
    const isAreaManager = positionName === "area manager" || positionName.includes("area manager");
    
    if (!isAreaManager) return false;
    
    // Check branch - look for "HO" in various possible fields
    let branchName = "";
    if (employee.branches) {
      if (Array.isArray(employee.branches)) {
        branchName = (employee.branches[0]?.branch_name || employee.branches[0]?.name || "").toUpperCase();
      } else if (typeof employee.branches === 'object') {
        branchName = ((employee.branches as any)?.branch_name || (employee.branches as any)?.name || "").toUpperCase();
      }
    } else if ((employee as any).branch) {
      branchName = String((employee as any).branch).toUpperCase();
    }
    
    const isHOBranch = 
      branchName === "HO" || 
      branchName === "HEAD OFFICE" ||
      branchName.includes("HEAD OFFICE") ||
      branchName.includes("HO");
    
    return isAreaManager && isHOBranch;
  };
  
  const [pendingRegistrations, setPendingRegistrations] = useState<User[]>([]);

  const [activeRegistrations, setActiveRegistrations] = useState<User[]>([]);
  const [tab, setTab] = useState<"active" | "new">("active");
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [activeTotalItems, setActiveTotalItems] = useState(0);
  const [pendingTotalItems, setPendingTotalItems] = useState(0);

  //data
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [positionsData, setPositionData] = useState<any[]>([]);
  const [branchesData, setBranchesData] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEvaluationTypeModalOpen, setIsEvaluationTypeModalOpen] =
    useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [evaluationType, setEvaluationType] = useState<
    "employee" | "manager" | null
  >(null);

  // Use dialog animation hook (0.4s to match EditUserModal speed)
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  //filters for active users
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [debouncedActiveSearchTerm, setDebouncedActiveSearchTerm] =
    useState(activeSearchTerm);
  const [roleFilter, setRoleFilter] = useState("0"); // Default to "All Roles"
  const [debouncedRoleFilter, setDebouncedRoleFilter] = useState(roleFilter);
  //filters for pending users
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [debouncedPendingSearchTerm, setDebouncedPendingSearchTerm] =
    useState(pendingSearchTerm);
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedStatusFilter, setDebouncedStatusFilter] =
    useState(statusFilter);
  //pagination
  const [currentPageActive, setCurrentPageActive] = useState(1);
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [totalActivePages, setTotalActivePages] = useState(1);
  const [totalPendingPages, setTotalPendingPages] = useState(1);
  const [perPage, setPerPage] = useState(0);
  //data to view
  const [employeeToView, setEmployeeToView] = useState<User | null>(null);
  const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false);
  const [selectedEmployeeForEvaluation, setSelectedEmployeeForEvaluation] =
    useState<User | null>(null);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);

  // Track when page change started for pending users
  const pendingPageChangeStartTimeRef = useRef<number | null>(null);

  const loadPendingUsers = async (
    searchValue: string,
    statusFilter: string
  ) => {
    try {
      const response = await apiService.getPendingRegistrations(
        searchValue,
        statusFilter,
        currentPagePending,
        itemsPerPage
      );

      setPendingRegistrations(response.data);
      setPendingTotalItems(response.total);
      setTotalPendingPages(response.last_page);
      setPerPage(response.per_page);
    } catch (error) {
      console.error("Error loading pending users:", error);
    } finally {
      // If this was a page change, ensure minimum display time (2 seconds)
      if (pendingPageChangeStartTimeRef.current !== null) {
        const elapsed = Date.now() - pendingPageChangeStartTimeRef.current;
        const minDisplayTime = 2000; // 2 seconds
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
          setIsPageLoading(false);
          pendingPageChangeStartTimeRef.current = null;
        }, remainingTime);
      }
    }
  };

  // Track when page change started for active users
  const activePageChangeStartTimeRef = useRef<number | null>(null);

  const loadActiveUsers = async (searchValue: string, roleFilter: string) => {
    try {
      const response = await apiService.getActiveRegistrations(
        searchValue,
        roleFilter,
        currentPageActive,
        itemsPerPage
      );

      setActiveRegistrations(response.data);
      setActiveTotalItems(response.total);
      setTotalActivePages(response.last_page);
      setPerPage(response.per_page);
    } catch (error) {
      console.error("Error loading active users:", error);
    } finally {
      // If this was a page change, ensure minimum display time (2 seconds)
      if (activePageChangeStartTimeRef.current !== null) {
        const elapsed = Date.now() - activePageChangeStartTimeRef.current;
        const minDisplayTime = 2000; // 2 seconds
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
          setIsPageLoading(false);
          activePageChangeStartTimeRef.current = null;
        }, remainingTime);
      }
    }
  };

  //render when page reload not loading not everySearch or Filters
  useEffect(() => {
    const mountData = async () => {
      setRefresh(true);
      try {
        const [positions, branches, departments] = await Promise.all([
          apiService.getPositions(),
          apiService.getBranches(),
          apiService.getDepartments(),
        ]);
        setPositionData(positions);
        setBranchesData(branches);
        setDepartmentData(departments);
        const roles = await apiService.getAllRoles();
        setRoles(roles);
        await loadActiveUsers(activeSearchTerm, roleFilter);
        await loadPendingUsers(pendingSearchTerm, statusFilter);
      } catch (error) {
        console.error("Error refreshing data:", error);
        setRefresh(false);
      } finally {
        setRefresh(false);
      }
    };
    mountData();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (tab === "active") {
        await loadActiveUsers(activeSearchTerm, roleFilter);
      }
      if (tab === "new") {
        await loadPendingUsers(pendingSearchTerm, statusFilter);
      }
    };

    load();
  }, [tab]);

  //mount every activeSearchTerm changes and RoleFilter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tab === "active") {
        activeSearchTerm === "" ? currentPageActive : setCurrentPageActive(1);
        setDebouncedActiveSearchTerm(activeSearchTerm);
        setDebouncedRoleFilter(roleFilter);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [activeSearchTerm, roleFilter]);

  // Fetch API whenever debounced active search term changes
  useEffect(() => {
    const fetchData = async () => {
      if (tab === "active") {
        await loadActiveUsers(debouncedActiveSearchTerm, debouncedRoleFilter);
      }
    };

    fetchData();
  }, [debouncedActiveSearchTerm, debouncedRoleFilter, currentPageActive]);

  //mount every pendingSearchTerm changes and statusFilter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tab === "new") {
        pendingSearchTerm === ""
          ? currentPagePending
          : setCurrentPagePending(1);
        setDebouncedPendingSearchTerm(pendingSearchTerm);
        setDebouncedStatusFilter(statusFilter);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [pendingSearchTerm, statusFilter]);

  // Fetch API whenever debounced pending search term changes
  useEffect(() => {
    const fetchData = async () => {
      if (tab === "new") {
        await loadPendingUsers(
          debouncedPendingSearchTerm,
          debouncedStatusFilter
        );
      }
    };

    fetchData();
  }, [debouncedPendingSearchTerm, debouncedStatusFilter, currentPagePending]);

  // Function to refresh user data
  const refreshUserData = async (showLoading = false) => {
    try {
      setRefresh(true);
      if (tab === "new") {
        await loadPendingUsers(pendingSearchTerm, statusFilter);
      }
      if (tab === "active") {
        await loadActiveUsers(activeSearchTerm, roleFilter);
      }

      if (showLoading) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
      toastMessages.generic.error(
        "Refresh Failed",
        "Failed to refresh user data. Please try again."
      );
    } finally {
      setRefresh(false);
    }
  };

  // Handlers
  const openEditModal = async (user: any) => {
    try {
      setUserToEdit(user);
      setIsEditModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const openDeleteModal = (employee: User) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: any) => {
    try {
      // Convert user object to FormData for API
      const formData = new FormData();
      Object.keys(updatedUser).forEach((key) => {
        if (updatedUser[key] !== undefined && updatedUser[key] !== null) {
          // Skip these keys - we'll append them with _id suffix separately
          if (
            key === "position" ||
            key === "branch" ||
            key === "role" ||
            key === "department"
          ) {
            return;
          }
          if (key === "avatar" && updatedUser[key] instanceof File) {
            formData.append(key, updatedUser[key]);
          } else {
            formData.append(key, String(updatedUser[key]));
          }
        }
      });

      // Append position as position_id if it exists
      if (updatedUser.position !== undefined && updatedUser.position !== null) {
        formData.append("position_id", String(updatedUser.position));
      }

      // Append branch as branch_id if it exists
      if (updatedUser.branch !== undefined && updatedUser.branch !== null) {
        formData.append("branch_id", String(updatedUser.branch));
      }

      // Append role as roles if it exists
      if (updatedUser.role !== undefined && updatedUser.role !== null) {
        formData.append("roles", String(updatedUser.role));
      }

      // Append department as department_id if it exists
      if (
        updatedUser.department !== undefined &&
        updatedUser.department !== null
      ) {
        formData.append("department_id", String(updatedUser.department));
      }

      await apiService.updateEmployee(formData, updatedUser.id);

      // Refresh user data to update the table immediately
      await refreshUserData(false);

      // Refresh dashboard data to get updated information

      // Show success toast
      toastMessages.user.updated(updatedUser.name);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          toastMessages.generic.error(
            "Update Failed",
            error.response.data.errors[field][0]
          );
        });
      }
    }
  };

  const handleDeleteEmployee = async (employee: any) => {
    try {
      // Set deleting state to show skeleton animation
      setDeletingUserId(employee.id);

      // Close modal immediately
      setIsDeleteModalOpen(false);

      // Wait 2 seconds to show skeleton animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Actually delete the user
      await apiService.deleteUser(employee.id);

      // Refresh data first, then reset deleting state after data loads
      await loadActiveUsers(activeSearchTerm, roleFilter);
      setDeletingUserId(null);

      toastMessages.user.deleted(employee.fname);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeletingUserId(null);
      toastMessages.generic.error(
        "Error",
        "Failed to delete user. Please try again."
      );
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleApproveRegistration = async (
    registrationId: number,
    registrationName: string
  ) => {
    try {
      await apiService.approveRegistration(registrationId);
      await loadPendingUsers(pendingSearchTerm, statusFilter);
      toastMessages.user.approved(registrationName);
    } catch (error) {
      console.error("Error approving registration:", error);
      toastMessages.generic.error(
        "Approval Error",
        "An error occurred while approving the registration. Please try again."
      );
    }
  };

  const handleRejectRegistration = async (
    registrationId: number,
    registrationName: string
  ) => {
    try {
      await apiService.rejectRegistration(registrationId);
      await loadPendingUsers(pendingSearchTerm, statusFilter);
      toastMessages.user.rejected(registrationName);
    } catch (error) {
      console.error("Error rejecting registration:", error);
      toastMessages.generic.error(
        "Rejection Error",
        "An error occurred while rejecting the registration. Please try again."
      );
    }
  };

  const handleAddUser = async (newUser: any) => {
    try {
      // Convert plain object to FormData - matching register page pattern
      const formDataToUpload = new FormData();
      formDataToUpload.append("fname", newUser.fname);
      formDataToUpload.append("lname", newUser.lname);
      formDataToUpload.append("username", newUser.username);
      // Remove dash from employee_id before sending (keep only numbers)
      formDataToUpload.append(
        "employee_id",
        newUser.employee_id.replace(/-/g, "")
      );
      formDataToUpload.append("email", newUser.email);
      formDataToUpload.append("contact", newUser.contact);
      if (newUser.date_hired) {
        formDataToUpload.append("date_hired", newUser.date_hired);
      }
      formDataToUpload.append("position_id", String(newUser.position_id));
      formDataToUpload.append("branch_id", String(newUser.branch_id));
      formDataToUpload.append("department_id", String(newUser.department_id));
      formDataToUpload.append("password", newUser.password);
      // role_id is only for admin/HR adding users (not in register)
      formDataToUpload.append("role_id", String(newUser.role_id));

      const addUser = await apiService.addUser(formDataToUpload);

      await refreshUserData();

      toastMessages.user.created(newUser.fname);
      setIsAddUserModalOpen(false);
    } catch (error: any) {
      console.error("Error adding user:", error);
      console.error("Error response:", error.response?.data);
      toastMessages.generic.error(
        "Add Failed",
        error.response?.data?.message || "Failed to add user. Please try again."
      );
      throw error;
    }
  };

  // Handle page change for active users
  const handleActivePageChange = (page: number) => {
    setIsPageLoading(true);
    activePageChangeStartTimeRef.current = Date.now();
    setCurrentPageActive(page);
  };

  // Handle page change for pending users
  const handlePendingPageChange = (page: number) => {
    setIsPageLoading(true);
    pendingPageChangeStartTimeRef.current = Date.now();
    setCurrentPagePending(page);
  };

  // Get role color based on role name
  const getRoleColor = (roleName: string | undefined): string => {
    if (!roleName)
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300";

    const role = roleName.toLowerCase();
    if (role === "admin") {
      return "bg-red-100 text-red-800 hover:bg-red-200 border-red-300";
    } else if (role === "hr") {
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300";
    } else if (role === "evaluator") {
      return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300";
    } else {
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300";
    }
  };

  // Handle tab change with refresh
  const handleTabChange = async (tab: "active" | "new") => {
    try {
      setTab(tab);
      await refreshUserData(true);
    } catch (error) {
      console.log(error);
    } finally {
      setRefresh(false);
    }
  };

  return (
    <div className="relative overflow-y-auto pr-2 min-h-[400px]">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage system users and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={tab === "active" ? "default" : "outline"}
              onClick={() => handleTabChange("active")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span>👥</span>
              Active Users ({activeTotalItems})
            </Button>
            <Button
              variant={tab === "new" ? "default" : "outline"}
              onClick={() => handleTabChange("new")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span>🆕</span>
              New Registrations ({pendingTotalItems})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Users Tab */}
      {tab === "active" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Approved Registrations</CardTitle>
            <CardDescription>List of Active Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="flex space-x-4 w-5/6">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <Input
                      placeholder="Search users..."
                      className=" pl-10"
                      value={activeSearchTerm}
                      onChange={(e) => setActiveSearchTerm(e.target.value)}
                    />
                    {activeSearchTerm && (
                      <button
                        onClick={() => setActiveSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div>
                    <Select
                      value={roleFilter}
                      onValueChange={(value) => {
                        setRoleFilter(value);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    {roleFilter !== "0" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRoleFilter("0");
                        }}
                        className="text-red-500 bg-amber-50"
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 w-1/6">
                  <Button
                    variant="outline"
                    onClick={() => refreshUserData(true)}
                    disabled={refresh}
                    className="flex items-center bg-blue-500 text-white hover:bg-blue-700 hover:text-white gap-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    {refresh ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 font-bold"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white hover:bg-green-700 hover:text-white gap-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    <Plus className="h-5 w-5 font-bold " />
                    Add User
                  </Button>
                </div>
              </div>

              {/* Role and Status Color Indicators */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Role Indicators:
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-red-700 text-white hover:bg-red-700 border-red-300"
                    >
                      Admin
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-700 text-white hover:bg-blue-700 border-blue-300"
                    >
                      HR
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-700 text-white hover:bg-green-700 border-green-300"
                    >
                      Evaluator
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gray-700 text-gray-100 hover:bg-gray-700 border-gray-300"
                    >
                      Employee
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Status Indicators:
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-green-700 text-white hover:bg-green-700 border-green-300"
                      >
                      ✨ New Added 
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-700 text-white hover:bg-blue-700 border-blue-300"
                    >
                      🕐 Recently Added
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="relative overflow-y-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refresh || isPageLoading ? (
                      Array.from({ length: itemsPerPage }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : activeRegistrations &&
                      Array.isArray(activeRegistrations) &&
                      activeRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-4">
                            <img
                              src="/not-found.gif"
                              alt="No data"
                              className="w-25 h-25 object-contain"
                              style={{
                                imageRendering: "auto",
                                willChange: "auto",
                                transform: "translateZ(0)",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                            />
                            <div className="text-gray-500">
                              {activeSearchTerm ? (
                                <>
                                  <p className="text-base font-medium mb-1">
                                    No results found
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    Try adjusting your search or filters
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-base font-medium mb-1">
                                    No evaluation records to display
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    Records will appear here when evaluations
                                    are submitted
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : activeRegistrations &&
                      Array.isArray(activeRegistrations) &&
                      activeRegistrations.length > 0 ? (
                      activeRegistrations?.map((employee) => {
                        const isDeleting = deletingUserId === employee.id;
                        const createdDate = employee.created_at
                          ? new Date(employee.created_at)
                          : null;
                        let isNew = false;
                        let isRecentlyAdded = false;

                        if (createdDate !== null) {
                          const now = new Date();
                          const minutesDiff =
                            (now.getTime() - createdDate.getTime()) /
                            (1000 * 60);
                          const hoursDiff = minutesDiff / 60;
                          isNew = hoursDiff <= 30;
                          isRecentlyAdded = hoursDiff > 30 && hoursDiff <= 40;
                        }

                        return (
                          <TableRow
                            key={employee.id}
                            className={
                              isDeleting
                                ? "animate-slide-out-right bg-red-100 border-l-4 border-l-red-600"
                                : isNew
                                ? "bg-green-50 border-l-4 border-l-green-500 hover:bg-green-100"
                                : isRecentlyAdded
                                ? "bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            }
                          >
                            {isDeleting ? (
                              <>
                                <TableCell className="font-medium bg-red-300">
                                  <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell className="bg-red-300">
                                  <Skeleton className="h-4 w-40" />
                                </TableCell>
                                <TableCell className="bg-red-300">
                                  <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell className="bg-red-300">
                                  <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell className="bg-red-300">
                                  <Skeleton className="h-5 w-16 rounded-full" />
                                </TableCell>
                                <TableCell className="bg-red-300">
                                  <div className="flex space-x-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                  </div>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {employee.fname + " " + employee.lname}
                                    </span>
                                    {isNew && (
                                      <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 font-semibold">
                                        ✨ New
                                      </Badge>
                                    )}
                                    {isRecentlyAdded && !isNew && (
                                      <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 font-semibold">
                                        🕐 Recent
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>
                                  {employee.positions?.label || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {(employee.branches &&
                                    Array.isArray(employee.branches) &&
                                    employee.branches[0]?.branch_name) ||
                                    "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getRoleColor(
                                      employee.roles &&
                                        Array.isArray(employee.roles) &&
                                        employee.roles[0]?.name
                                    )}
                                  >
                                    {(employee.roles &&
                                      Array.isArray(employee.roles) &&
                                      employee.roles[0]?.name) ||
                                      "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-200 cursor-pointer hover:scale-110 transition-transform duration-200"
                                      onClick={() => {
                                        setEmployeeToView(employee);
                                        setIsViewEmployeeModalOpen(true);
                                      }}
                                      disabled={deletingUserId !== null}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-200 cursor-pointer hover:scale-110 transition-transform duration-200"
                                      onClick={() => {
                                        setIsEvaluationTypeModalOpen(true);
                                        setSelectedEmployeeForEvaluation(
                                          employee
                                        );
                                      }}
                                      title="Evaluate employee performance"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-200 cursor-pointer hover:scale-120 transition-transform duration-200"
                                      onClick={() => openEditModal(employee)}
                                      disabled={deletingUserId !== null}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-200 cursor-pointer hover:scale-120 transition-transform duration-200"
                                      onClick={() => openDeleteModal(employee)}
                                      disabled={deletingUserId !== null}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })
                    ) : null}
                  </TableBody>
                </Table>
              </div>
              <div>
                {tab === "active" && (
                  <div>
                    <EvaluationsPagination
                      currentPage={currentPageActive}
                      totalPages={totalActivePages}
                      total={activeTotalItems}
                      perPage={perPage}
                      onPageChange={handleActivePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Registrations Tab Content */}
      {tab === "new" && (
        <div className="relative mt-4">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>New Registrations</CardTitle>
              <CardDescription>
                Review and approve new user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <div className="relative flex-1 max-w-md">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                      <Input
                        placeholder="Search new registrations..."
                        className="w-64 pl-10"
                        value={pendingSearchTerm}
                        onChange={(e) => setPendingSearchTerm(e.target.value)}
                      />

                      {pendingSearchTerm && (
                        <button
                          onClick={() => setPendingSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Clear search"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                    >
                      <SelectTrigger className="w-48 cursor-pointer">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Status</SelectItem>
                        <SelectItem value="pending">
                          Pending Verification
                        </SelectItem>
                        <SelectItem value="declined">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => refreshUserData(true)}
                      disabled={refresh}
                      className="flex items-center gap-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-700 hover:text-white hover:scale-105 transition-transform duration-200"
                    >
                      {refresh ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
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
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5 font-bold"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Status Color Indicator */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Status Indicators:
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                    >
                      ⚡ New (≤24h)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                    >
                      🕐 Recent (24-48h)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                    >
                      ✗ Rejected
                    </Badge>
                  </div>
                </div>

                <div className="relative max-h-[500px] overflow-y-auto overflow-x-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm border-b border-gray-200">
                      <TableRow>
                        <TableHead className="px-6 py-3">Name</TableHead>
                        <TableHead className="px-6 py-3">Email</TableHead>
                        <TableHead className="px-6 py-3">Position</TableHead>
                        <TableHead className="px-6 py-3">
                          Registration Date
                        </TableHead>
                        <TableHead className="px-6 py-3">Status</TableHead>
                        <TableHead className="px-6 py-3">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                      {refresh || isPageLoading ? (
                        Array.from({ length: itemsPerPage }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : pendingRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center gap-4">
                              <img
                                src="/not-found.gif"
                                alt="No data"
                                className="w-25 h-25 object-contain"
                                style={{
                                  imageRendering: "auto",
                                  willChange: "auto",
                                  transform: "translateZ(0)",
                                  backfaceVisibility: "hidden",
                                  WebkitBackfaceVisibility: "hidden",
                                }}
                              />
                              <div className="text-gray-500">
                                {pendingSearchTerm ? (
                                  <>
                                    <p className="text-base font-medium mb-1">
                                      No results found
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Try adjusting your search or filters
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-base font-medium mb-1">
                                      No new registrations
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      New registrations will appear here
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pendingRegistrations &&
                        Array.isArray(pendingRegistrations) &&
                        pendingRegistrations.length > 0 ? (
                        pendingRegistrations.map((account) => {
                          // Check if registration is new (within 24 hours) or recent (24-48 hours)
                          if (!account.created_at) return;
                          const registrationDate = new Date(account.created_at);
                          const now = new Date();
                          const hoursDiff =
                            (now.getTime() - registrationDate.getTime()) /
                            (1000 * 60 * 60);
                          const isNew = hoursDiff <= 24;
                          const isRecent = hoursDiff > 24 && hoursDiff <= 48;
                          const isRejected = account.is_active === "declined";

                          return (
                            <TableRow
                              key={account.id}
                              className={
                                isRejected
                                  ? "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100"
                                  : isNew
                                  ? "bg-yellow-50 border-l-4 border-l-yellow-500 hover:bg-yellow-100"
                                  : isRecent
                                  ? "bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100"
                                  : "hover:bg-gray-50"
                              }
                            >
                              <TableCell className="px-6 py-3 font-medium">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {account.fname + " " + account.lname}
                                  </span>
                                  {!isRejected && isNew && (
                                    <Badge className="bg-yellow-500 text-white text-xs px-2 py-0.5 font-semibold">
                                      ⚡ New
                                    </Badge>
                                  )}
                                  {!isRejected && isRecent && !isNew && (
                                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 font-semibold">
                                      🕐 Recent
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-3">
                                {account.email}
                              </TableCell>
                              <TableCell className="px-6 py-3">
                                {account.positions?.label || "N/A"}
                              </TableCell>
                              <TableCell className="px-6 py-3">
                                {new Date(
                                  account.created_at
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="px-6 py-3">
                                <Badge
                                  className={
                                    account.is_active === "declined"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  }
                                >
                                  {account.is_active === "declined"
                                    ? "REJECTED"
                                    : "PENDING VERIFICATION"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 py-3">
                                <div className="flex space-x-2">
                                  {account.is_active === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white bg-green-500 hover:text-white hover:bg-green-600 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={() =>
                                          handleApproveRegistration(
                                            Number(account.id),
                                            account.fname
                                          )
                                        }
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white bg-red-500 hover:bg-red-600 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={() =>
                                          handleRejectRegistration(
                                            Number(account.id),
                                            account.fname
                                          )
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {account.is_active === "declined" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                      onClick={() =>
                                        handleApproveRegistration(
                                          Number(account.id),
                                          account.fname
                                        )
                                      }
                                    >
                                      Approve
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  {tab === "new" && (
                    <div>
                      <EvaluationsPagination
                        currentPage={currentPagePending}
                        totalPages={totalPendingPages}
                        total={pendingTotalItems}
                        perPage={perPage}
                        onPageChange={handlePendingPageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userToEdit}
        onSave={handleSaveUser}
        departments={departmentData}
        branches={branchesData}
        positions={positionsData}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChangeAction={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setEmployeeToDelete(null);
          }
        }}
      >
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <DialogHeader className="pb-4 bg-red-50 rounded-lg ">
            <DialogTitle className="text-red-800 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Delete Employee
            </DialogTitle>
            <DialogDescription className="text-red-700">
              This action cannot be undone. Are you sure you want to permanently
              delete {employeeToDelete?.fname}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-2 mt-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-sm text-red-700">
                  <p className="font-medium">
                    Warning: This will permanently delete:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Employee profile and data</li>
                    <li>All evaluation records</li>
                    <li>Access permissions</li>
                    <li>Associated files and documents</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="font-medium">Employee Details:</p>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {employeeToDelete?.fname + " " + employeeToDelete?.lname}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {employeeToDelete?.email}
                  </p>
                  <p>
                    <span className="font-medium">Position:</span>{" "}
                    {employeeToDelete?.positions.label}
                  </p>
                  <p>
                    <span className="font-medium">Branch:</span>{" "}
                    {employeeToDelete?.branches?.branch_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 px-2">
            <div className="flex justify-end space-x-4 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEmployeeToDelete(null);
                }}
                className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeletingEmployee}
                className={`bg-blue-600 hover:bg-red-700 text-white cursor-pointer
    hover:scale-110 transition-transform duration-200
    ${isDeletingEmployee ? "opacity-70 cursor-not-allowed hover:scale-100" : ""}
  `}
                onClick={async () => {
                  if (!employeeToDelete) return;

                  setIsDeletingEmployee(true);

                  try {
                    await handleDeleteEmployee(employeeToDelete);
                  } finally {
                    setIsDeletingEmployee(false);
                  }
                }}
              >
                {isDeletingEmployee ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>❌ Delete Permanently</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
        }}
        onSave={handleAddUser}
        departments={departmentData}
        branches={branchesData}
        positions={positionsData}
        roles={roles}
      />

      {employeeToView && (
        <ViewEmployeeModal
          isOpen={isViewEmployeeModalOpen}
          onCloseAction={() => {
            setIsViewEmployeeModalOpen(false);
            setEmployeeToView(null);
          }}
          employee={employeeToView}
          onStartEvaluationAction={() => {
            // Not used in admin, but required by component
            setIsViewEmployeeModalOpen(false);
            setEmployeeToView(null);
          }}
          onViewSubmissionAction={() => {
            // Not used in admin, but required by component
          }}
          designVariant="admin"
        />
      )}
      <EvaluationTypeModal
        isOpen={isEvaluationTypeModalOpen}
        onCloseAction={() => {
          setIsEvaluationTypeModalOpen(false);
          if (!evaluationType) {
            setSelectedEmployee(null);
          }
        }}
        onSelectEmployeeAction={() => {
          const employee = selectedEmployeeForEvaluation;
          if (!employee) {
            console.error("No employee selected!");
            return;
          }
          setEvaluationType("employee");
          setIsEvaluationTypeModalOpen(false);

          setIsEvaluationModalOpen(true);
        }}
        onSelectManagerAction={() => {
          const employee = selectedEmployeeForEvaluation;
          if (!employee) {
            console.error("No employee selected!");
            return;
          }
          setEvaluationType("manager");
          setIsEvaluationTypeModalOpen(false);

          setIsEvaluationModalOpen(true);
        }}
        employeeName={
          selectedEmployeeForEvaluation
            ? `${selectedEmployeeForEvaluation?.fname || ""} ${selectedEmployeeForEvaluation?.lname || ""}`.trim()
            : ""
        }
      />

      <Dialog
        open={isEvaluationModalOpen}
        onOpenChangeAction={(open) => {
          if (!open) {
            setIsEvaluationModalOpen(false);
            setSelectedEmployee(null);
            setEvaluationType(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[101vh] overflow-hidden p-0 evaluation-container">
          {selectedEmployeeForEvaluation && evaluationType === "employee" && (
            <>
              {isHO && !isEmployeeAreaManagerWithHO(selectedEmployeeForEvaluation) ? (
                <RankNfileHo
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setSelectedEmployee(null);
                    setEvaluationType(null);
                  }}
                />
              ) : (
                <BranchEvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setSelectedEmployee(null);
                    setEvaluationType(null);
                  }}
                />
              )}
            </>
          )}
          {selectedEmployeeForEvaluation && evaluationType === "manager" && (
            <>
              {isHO && !isEmployeeAreaManagerWithHO(selectedEmployeeForEvaluation) ? (
                <BasicHo
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setSelectedEmployee(null);
                    setEvaluationType(null);
                  }}
                />
              ) : (
                <BranchEvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setSelectedEmployee(null);
                    setEvaluationType(null);
                  }}
                />
              )}
            </>
          )}
          {/* {selectedEmployee && !evaluationType && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">
                      Please select an evaluation type... (Debug: employee=
                      {selectedEmployee?.name}, type={evaluationType})
                    </p>
                  </div>
                )} */}
          {/* {!selectedEmployee && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">
                      No employee selected (Debug: evaluationType={evaluationType})
                    </p>
                  </div>
                )} */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
