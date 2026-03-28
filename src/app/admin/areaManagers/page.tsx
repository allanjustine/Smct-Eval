"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/apiService";
import { toastMessages } from "@/lib/toastMessages";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  branch?: string;
  contact?: string;
  isActive?: boolean;
  role: string;
}

export default function AreaManagersTab() {
  const { withErrorHandling } = useErrorHandler({
    showToast: true,
    logToConsole: true,
  });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [selectedAreaManager, setSelectedAreaManager] =
    useState<Employee | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<
    { id: string; name: string }[]
  >([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState<{
    areaManager: Employee | null;
    branches: { id: string; name: string }[];
  }>({ areaManager: null, branches: [] });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [areaManagerToEdit, setAreaManagerToEdit] = useState<Employee | null>(
    null
  );
  const [editSelectedBranches, setEditSelectedBranches] = useState<
    { id: string; name: string }[]
  >([]);
  const [showEditSuccessDialog, setShowEditSuccessDialog] = useState(false);
  const [editSuccessData, setEditSuccessData] = useState<{
    areaManager: Employee | null;
    branches: { id: string; name: string }[];
  }>({ areaManager: null, branches: [] });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaManagerToDelete, setAreaManagerToDelete] =
    useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaManagersPage, setAreaManagersPage] = useState(1);
  const [areaManagersData, setAreaManagersData] = useState<Employee[]>([]);
  const [loadingAreaManagers, setLoadingAreaManagers] = useState(true);
  const [areaManagersRefreshing, setAreaManagersRefreshing] = useState(false);
  const itemsPerPage = 8;
  const [isSavingAreaManagerEdit, setIsSavingAreaManagerEdit] = useState(false);
  const [isDeletingAreaManager, setIsDeletingAreaManager] = useState(false);

  // Use dialog animation hook (0.4s to match EditUserModal speed)
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });

  // Load area managers from API
  // Helper function to normalize area manager data
  const normalizeAreaManagerData = (data: any[]): Employee[] => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => {
      // Handle branches - API returns branches array
      let branchValue = "";
      if (item.branches && Array.isArray(item.branches)) {
        branchValue = item.branches
          .map((b: any) => b.name || b.branch_name || b.label || b.code || b)
          .filter((b: any) => b) // Remove empty values
          .join(", ");
      } else if (item.branch) {
        if (Array.isArray(item.branch)) {
          branchValue = item.branch
            .map((b: any) => b.name || b.label || b)
            .join(", ");
        } else if (typeof item.branch === "object") {
          branchValue =
            item.branch.name ||
            item.branch.branch_name ||
            item.branch.label ||
            "";
        } else {
          branchValue = String(item.branch);
        }
      }

      // Handle position - API returns positions object with label
      let positionValue = "";
      if (item.positions && typeof item.positions === "object") {
        positionValue =
          item.positions.label ||
          item.positions.name ||
          item.positions.value ||
          "";
      } else if (item.position) {
        if (typeof item.position === "object") {
          positionValue =
            item.position.label ||
            item.position.name ||
            item.position.value ||
            "";
        } else {
          positionValue = String(item.position);
        }
      } else if (item.position_id) {
        positionValue = String(item.position_id);
      }

      // Handle department - API returns departments object with department_name
      let departmentValue = "";
      if (item.departments && typeof item.departments === "object") {
        departmentValue =
          item.departments.department_name ||
          item.departments.name ||
          item.departments.label ||
          "";
      } else if (item.department) {
        if (typeof item.department === "object") {
          departmentValue =
            item.department.department_name ||
            item.department.name ||
            item.department.label ||
            "";
        } else {
          departmentValue = String(item.department);
        }
      } else if (item.department_id) {
        departmentValue = String(item.department_id);
      }

      // Handle role - API returns roles array with name
      let roleValue = "";
      if (item.roles && Array.isArray(item.roles)) {
        roleValue = item.roles
          .map((r: any) => r.name || r.label || r)
          .filter((r: any) => r) // Remove empty values
          .join(", ");
      } else if (item.role) {
        if (Array.isArray(item.role)) {
          roleValue = item.role
            .map((r: any) => r.name || r.label || r)
            .join(", ");
        } else if (typeof item.role === "object") {
          roleValue = item.role.name || item.role.label || "";
        } else {
          roleValue = String(item.role);
        }
      }

      // Handle name - construct from fname/lname to ensure proper spacing
      let nameValue = "";
      const fname = item.fname || "";
      const lname = item.lname || "";
      if (fname || lname) {
        nameValue = `${fname} ${lname}`.trim();
      } else if (item.full_name) {
        // If full_name exists but fname/lname don't, use full_name
        nameValue = item.full_name;
      } else if (item.name) {
        nameValue = item.name;
      } else {
        nameValue = item.username || "";
      }

      // Handle isActive - API returns is_active as string "active" or boolean
      let isActiveValue = true;
      if (item.isActive !== undefined) {
        isActiveValue = item.isActive;
      } else if (item.is_active !== undefined) {
        if (typeof item.is_active === "string") {
          isActiveValue = item.is_active.toLowerCase() === "active";
        } else {
          isActiveValue = Boolean(item.is_active);
        }
      } else if (item.status !== undefined) {
        isActiveValue = item.status !== "inactive";
      }

      return {
        id: item.id || item.employeeId || item.user_id || item.emp_id,
        name: nameValue,
        email: item.email || "",
        position: positionValue,
        department: departmentValue,
        branch: branchValue,
        contact: item.contact || item.phone || item.contact_number || "",
        role: roleValue,
        isActive: isActiveValue,
      };
    });
  };

  // Load area managers from API
  const loadAreaManagers = async () => {
    setLoadingAreaManagers(true);
    try {
      const data = await apiService.getAllAreaManager();
      console.log("Area Managers API Response:", data);

      const normalizedData = normalizeAreaManagerData(data);
      console.log("Normalized Area Managers Data:", normalizedData);

      setAreaManagersData(normalizedData);
    } catch (error) {
      console.error("Error loading area managers:", error);
      // Set empty array if API fails - no fallback needed
      setAreaManagersData([]);
    } finally {
      setLoadingAreaManagers(false);
    }
  };

  // Load area managers on mount
  useEffect(() => {
    loadAreaManagers();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setAreaManagersRefreshing(true);
    try {
      await loadAreaManagers();
    } finally {
      setAreaManagersRefreshing(false);
    }
  };

  // Memoized area managers (use API data)
  const areaManagers = useMemo(() => {
    return areaManagersData;
  }, [areaManagersData]);

  // Filter area managers based on search term
  const filteredAreaManagers = useMemo(() => {
    if (!searchTerm) return areaManagers;

    const searchLower = searchTerm.toLowerCase();
    return areaManagers.filter((manager: Employee) => {
      const nameMatch = manager.name?.toLowerCase().includes(searchLower);
      const branchMatch = manager.branch?.toLowerCase().includes(searchLower);
      return nameMatch || branchMatch;
    });
  }, [areaManagers, searchTerm]);

  // Pagination calculations
  const areaManagersTotal = filteredAreaManagers.length;
  const areaManagersTotalPages = Math.ceil(areaManagersTotal / itemsPerPage);
  const areaManagersStartIndex = (areaManagersPage - 1) * itemsPerPage;
  const areaManagersEndIndex = areaManagersStartIndex + itemsPerPage;
  const areaManagersPaginated = filteredAreaManagers.slice(
    areaManagersStartIndex,
    areaManagersEndIndex
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setAreaManagersPage(1);
  }, [searchTerm]);

  // Helper function to generate pagination pages
  const generatePaginationPages = (
    currentPage: number,
    totalPages: number
  ): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    if (currentPage <= 3) {
      // Show first 5 pages, ellipsis, last page
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Show first page, ellipsis, last 5 pages
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
      pages.push(1);
      pages.push("ellipsis");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  // Load branches data
  const loadBranches = async (): Promise<{ id: string; name: string }[]> => {
    // Don't reload if branches are already loaded
    if (branches.length > 0 && !branchesLoading) {
      return branches;
    }

    setBranchesLoading(true);

    const result = await withErrorHandling(
      async () => {
        const branchesData = await apiService.getBranches();
        // Normalize the data format - handle both {id, name} and {value, label} formats
        const normalizedBranches = branchesData.map((branch: any) => {
          if ("id" in branch && "name" in branch) {
            return { id: branch.id, name: branch.name };
          } else if ("value" in branch && "label" in branch) {
            // Extract branch code from label if it contains " /"
            const labelParts = branch.label.split(" /");
            return {
              id: branch.value,
              name: labelParts[0] || branch.label,
            };
          }
          return {
            id: String(branch.id || branch.value || ""),
            name: String(branch.name || branch.label || ""),
          };
        });
        setBranches(normalizedBranches);
        return normalizedBranches;
      },
      {
        errorTitle: "Failed to Load Branches",
        errorMessage: "Unable to load branches. Please try again.",
        showSuccessToast: false,
      }
    );

    setBranchesLoading(false);
    return result || [];
  };

  // Add custom CSS for success dialog content animations (checkmark, ripple, etc.)
  // Note: Container animations are now handled by useDialogAnimation hook
  useEffect(() => {
    const styleId = "area-managers-success-animations";
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      return; // Styles already injected
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* Success Dialog Content Animations */
      @keyframes successScale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes drawCheckmark {
        0% {
          stroke-dashoffset: 20;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      
      @keyframes successRipple {
        0% {
          transform: scale(1);
          opacity: 0.5;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
      
      .animate-success-scale {
        animation: successScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      
      .animate-success-checkmark {
        animation: drawCheckmark 0.5s ease-out 0.3s forwards;
      }
      
      .animate-success-ripple {
        animation: successRipple 1s ease-out 0.2s;
      }
      
      .animate-draw-checkmark {
        animation: drawCheckmark 0.5s ease-out 0.3s forwards;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Auto-close success dialog after 2 seconds
  useEffect(() => {
    if (showSuccessDialog) {
      const timer = setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessDialog]);

  // Auto-close edit success dialog after 2 seconds
  useEffect(() => {
    if (showEditSuccessDialog) {
      const timer = setTimeout(() => {
        setShowEditSuccessDialog(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showEditSuccessDialog]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Area Managers</CardTitle>
              <CardDescription>
                List of all area managers in the organization
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={areaManagersRefreshing || loadingAreaManagers}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              title="Refresh area managers data"
            >
              {areaManagersRefreshing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Refreshing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Refresh</span>
                </div>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full md:w-1/3">
              <Label
                htmlFor="area-managers-search"
                className="text-sm font-medium mb-2 block"
              >
                Search
              </Label>
              <div className="relative">
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
                  id="area-managers-search"
                  placeholder="Search by name or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                    aria-label="Clear search"
                    type="button"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
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
            </div>
          </div>
          <div className="relative max-h-[600px] overflow-y-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-1/3">Name</TableHead>
                  <TableHead className="w-1/3 text-center">Branches</TableHead>
                  <TableHead className="w-1/3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAreaManagers ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="py-4">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : areaManagersPaginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
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
                          {searchTerm ? (
                            <>
                              <p className="text-base font-medium mb-1">
                                No area managers found matching "{searchTerm}"
                              </p>
                              <p className="text-sm text-gray-400">
                                Try adjusting your search term
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-base font-medium mb-1">
                                No area managers found
                              </p>
                              <p className="text-sm text-gray-400">
                                Area managers will appear here once added
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  areaManagersPaginated.map((manager: Employee) => {
                    // Parse branches - handle both comma-separated string and single branch
                    const branchList = manager.branch
                      ? manager.branch
                          .split(", ")
                          .filter((b: string) => b.trim())
                      : [];

                    return (
                      <TableRow key={manager.id}>
                        <TableCell className="py-4 font-medium">
                          {manager.name}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          {branchList.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-2">
                              {branchList.map(
                                (branch: string, index: number) => (
                                  <Badge
                                    key={index}
                                    className="bg-blue-600 text-white"
                                  >
                                    {branch}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white bg-blue-600 hover:text-white hover:bg-blue-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={async () => {
                                setAreaManagerToEdit(manager);
                                setIsEditModalOpen(true);
                                // Load branches first and wait for them
                                const loadedBranches = await loadBranches();
                                // Then parse existing branches after branches are loaded
                                if (manager.branch && loadedBranches) {
                                  const existingBranches = manager.branch
                                    .split(", ")
                                    .map((name: string) => {
                                      // Try to find matching branch from loaded branches
                                      const branch = loadedBranches.find(
                                        (b: { id: string; name: string }) =>
                                          b.name === name.trim()
                                      );
                                      return (
                                        branch || { id: "", name: name.trim() }
                                      );
                                    })
                                    .filter(
                                      (b: { id: string; name: string }) =>
                                        b.id || b.name
                                    );
                                  setEditSelectedBranches(existingBranches);
                                } else {
                                  setEditSelectedBranches([]);
                                }
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white bg-red-500 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => {
                                setAreaManagerToDelete(manager);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {areaManagersTotal > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {areaManagersStartIndex + 1} to{" "}
                {Math.min(areaManagersEndIndex, areaManagersTotal)} of{" "}
                {areaManagersTotal} area managers
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setAreaManagersPage((prev) => Math.max(1, prev - 1));
                      }}
                      className={
                        areaManagersPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer bg-blue-500 text-white hover:bg-blue-700 hover:text-white"
                      }
                    />
                  </PaginationItem>
                  {generatePaginationPages(
                    areaManagersPage,
                    areaManagersTotalPages
                  ).map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setAreaManagersPage(page);
                          }}
                          isActive={areaManagersPage === page}
                          className={
                            areaManagersPage === page
                              ? "cursor-pointer bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                              : "cursor-pointer bg-blue-500 text-white hover:bg-blue-700 hover:text-white"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setAreaManagersPage((prev) =>
                          Math.min(areaManagersTotalPages, prev + 1)
                        );
                      }}
                      className={
                        areaManagersPage === areaManagersTotalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer bg-blue-500 text-white hover:bg-blue-700 hover:text-white"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Area Managers List Modal */}
      <Dialog open={isListModalOpen} onOpenChangeAction={setIsListModalOpen}>
        <DialogContent
          className={`max-w-4xl max-h-[90vh] p-6 flex flex-col ${dialogAnimationClass}`}
        >
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Area Managers List</DialogTitle>
                <DialogDescription>
                  Complete list of all area managers in the organization
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsListModalOpen(false)}
                className="h-10 w-10 p-0 hover:bg-gray-100 bg-blue-600 text-white rounded-full hover:text-white hover:bg-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            {areaManagers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No area managers found
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-2/3 px-6">Name</TableHead>
                        <TableHead className="w-1/3 text-center px-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {areaManagers.map((manager: Employee) => (
                        <TableRow key={manager.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium py-3 px-6">
                            {manager.name}
                          </TableCell>
                          <TableCell className="py-3 text-center px-6">
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm"
                              onClick={async () => {
                                // Store the selected area manager
                                setSelectedAreaManager(manager);
                                // Load branches first (in background) to prevent loading state flicker
                                await loadBranches();
                                // Close the Area Managers modal
                                setIsListModalOpen(false);
                                // Use double requestAnimationFrame for smoother transition (allows DOM to update)
                                requestAnimationFrame(() => {
                                  requestAnimationFrame(() => {
                                    setIsBranchesModalOpen(true);
                                  });
                                });
                              }}
                            >
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Branches List Modal */}
      <Dialog
        open={isBranchesModalOpen}
        onOpenChangeAction={setIsBranchesModalOpen}
      >
        <DialogContent
          className={`max-w-4xl max-h-[90vh] p-6 flex flex-col ${dialogAnimationClass}`}
        >
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Branches List</DialogTitle>
                <DialogDescription>
                  Complete list of all branches in the organization
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBranchesModalOpen(false);
                  setShowConfirmation(false);
                  setSelectedBranches([]);
                }}
                className="h-10 w-10 p-0 hover:bg-gray-100 bg-blue-600 text-white rounded-full hover:text-white hover:bg-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            {/* Confirmation Indicator */}
            {showConfirmation &&
              selectedBranches.length > 0 &&
              selectedAreaManager && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Add Area Manager
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Add{" "}
                        <span className="font-semibold">
                          {selectedAreaManager.name}
                        </span>{" "}
                        to:
                      </p>
                      <div className="mt-2 space-y-1">
                        {selectedBranches.map((branch) => (
                          <div
                            key={branch.id}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs text-blue-600">•</span>
                            <span className="text-sm text-blue-700 font-medium">
                              {branch.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedBranches([]);
                        setShowConfirmation(false);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={async () => {
                        if (
                          !selectedAreaManager ||
                          selectedBranches.length === 0
                        )
                          return;

                        await withErrorHandling(
                          async () => {
                            // Store data for success message
                            setSuccessData({
                              areaManager: selectedAreaManager,
                              branches: [...selectedBranches],
                            });

                            // Update user branch assignments using dedicated API endpoint
                            const formData = new FormData();
                            // Add each branch ID to the form data
                            selectedBranches.forEach((branch) => {
                              formData.append("branch_ids[]", branch.id);
                            });

                            // Use updateUserBranch API endpoint for branch assignments
                            await apiService.updateUserBranch(
                              selectedAreaManager.id,
                              formData
                            );

                            // Close the branches modal after confirmation
                            setIsBranchesModalOpen(false);
                            setShowConfirmation(false);
                            // Show success dialog
                            setShowSuccessDialog(true);
                            // Clear selections after a delay
                            setTimeout(() => {
                              setSelectedBranches([]);
                            }, 100);

                            // Show success toast
                            toastMessages.generic.success(
                              "Branch Assignment Successful",
                              `${
                                selectedAreaManager.name
                              } has been assigned to ${
                                selectedBranches.length
                              } ${
                                selectedBranches.length === 1
                                  ? "branch"
                                  : "branches"
                              }.`
                            );

                            // Reload area managers data to update the table
                            const reloadedData =
                              await apiService.getAllAreaManager();
                            const normalizedData =
                              normalizeAreaManagerData(reloadedData);
                            setAreaManagersData(normalizedData);
                          },
                          {
                            errorTitle: "Assignment Failed",
                            errorMessage:
                              "Failed to assign branches. Please try again.",
                            showSuccessToast: false, // We show custom success toast above
                          }
                        );
                      }}
                    >
                      Confirm ({selectedBranches.length})
                    </Button>
                  </div>
                </div>
              )}

            {branchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No branches found
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-2/5">Branch Name</TableHead>
                        <TableHead className="w-2/5 text-center">
                          Branch ID
                        </TableHead>
                        <TableHead className="w-1/5 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium py-3">
                            {branch.name}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {branch.id}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex justify-center">
                              <Button
                                className={`${
                                  selectedBranches.some(
                                    (b) => b.id === branch.id
                                  )
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                                size="sm"
                                onClick={() => {
                                  // Check if branch is already selected
                                  const isSelected = selectedBranches.some(
                                    (b) => b.id === branch.id
                                  );

                                  if (isSelected) {
                                    // Remove from selection
                                    setSelectedBranches(
                                      selectedBranches.filter(
                                        (b) => b.id !== branch.id
                                      )
                                    );
                                    if (selectedBranches.length === 1) {
                                      setShowConfirmation(false);
                                    }
                                  } else {
                                    // Add to selection
                                    setSelectedBranches([
                                      ...selectedBranches,
                                      branch,
                                    ]);
                                    setShowConfirmation(true);
                                  }
                                }}
                              >
                                {selectedBranches.some(
                                  (b) => b.id === branch.id
                                )
                                  ? "Added"
                                  : "Add"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChangeAction={() => {}}>
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative mb-4">
              <div className="animate-success-ripple absolute inset-0 rounded-full bg-green-200"></div>
              <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-success-scale">
                <svg
                  className="w-8 h-8 text-green-600 animate-success-checkmark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="20"
                    strokeDashoffset="20"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Success!
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {successData.areaManager && successData.branches.length > 0 && (
                <>
                  {successData.areaManager.name} has been assigned to{" "}
                  {successData.branches.map((b) => b.name).join(", ")}
                </>
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Area Manager Modal */}
      <Dialog open={isEditModalOpen} onOpenChangeAction={setIsEditModalOpen}>
        <DialogContent
          className={`max-w-xl max-h-[90vh] p-6 flex flex-col ${dialogAnimationClass}`}
        >
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Edit Branch Assignment</DialogTitle>
                <DialogDescription>
                  Update branch assignments for {areaManagerToEdit?.name}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setAreaManagerToEdit(null);
                  setEditSelectedBranches([]);
                }}
                className="h-10 w-10 p-0 hover:bg-gray-100 bg-blue-600 text-white rounded-full hover:text-white hover:bg-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {/* Current Assignment Display */}
            {areaManagerToEdit && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Assignment:
                </p>
                <p className="text-sm text-gray-600">
                  {areaManagerToEdit.branch || "No branches assigned"}
                </p>
              </div>
            )}

            {/* Branches Selection */}
            {branchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No branches found
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-2/5">Branch Name</TableHead>
                        <TableHead className="w-2/5 text-center">
                          Branch ID
                        </TableHead>
                        <TableHead className="w-1/5 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => {
                        const isSelected = editSelectedBranches.some(
                          (b) => b.id === branch.id
                        );
                        return (
                          <TableRow
                            key={branch.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium py-3">
                              {branch.name}
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {branch.id}
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="flex justify-center">
                                <Button
                                  className={`${
                                    isSelected
                                      ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                      : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                  }`}
                                  size="sm"
                                  onClick={() => {
                                    if (isSelected) {
                                      setEditSelectedBranches(
                                        editSelectedBranches.filter(
                                          (b) => b.id !== branch.id
                                        )
                                      );
                                    } else {
                                      setEditSelectedBranches([
                                        ...editSelectedBranches,
                                        branch,
                                      ]);
                                    }
                                  }}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Selected Branches Summary */}
            {editSelectedBranches.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-shrink-0">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected Branches ({editSelectedBranches.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {editSelectedBranches.map((branch) => (
                    <Badge key={branch.id} className="bg-blue-600 text-white">
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 text-white cursor-pointer bg-red-500 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                setIsEditModalOpen(false);
                setAreaManagerToEdit(null);
                setEditSelectedBranches([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex cursor-pointer items-center gap-2 hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isSavingAreaManagerEdit}
              onClick={async () => {
                if (!areaManagerToEdit) {
                  toastMessages.generic.error(
                    "Validation Error",
                    "No area manager selected."
                  );
                  return;
                }

                setIsSavingAreaManagerEdit(true);

                try {
                  await withErrorHandling(
                    async () => {
                      // Remove existing branches
                      await apiService.removeUserBranches(areaManagerToEdit.id);

                      // Add selected branches
                      if (editSelectedBranches.length > 0) {
                        const formData = new FormData();
                        editSelectedBranches.forEach((branch) => {
                          formData.append("branch_ids[]", String(branch.id));
                        });

                        await apiService.updateUserBranch(
                          areaManagerToEdit.id,
                          formData
                        );
                      }

                      // Update UI immediately
                      const branchNames =
                        editSelectedBranches.length > 0
                          ? editSelectedBranches.map((b) => b.name).join(", ")
                          : "";

                      setAreaManagersData((prevData) =>
                        prevData.map((manager) =>
                          manager.id === areaManagerToEdit.id
                            ? { ...manager, branch: branchNames }
                            : manager
                        )
                      );

                      // Reload in background
                      apiService
                        .getAllAreaManager()
                        .then((reloadedData) => {
                          setAreaManagersData(
                            normalizeAreaManagerData(reloadedData)
                          );
                        })
                        .catch(() => {});

                      setEditSuccessData({
                        areaManager: areaManagerToEdit,
                        branches: [...editSelectedBranches],
                      });

                      setIsEditModalOpen(false);
                      setAreaManagerToEdit(null);
                      setEditSelectedBranches([]);
                      setShowEditSuccessDialog(true);

                      toastMessages.generic.success(
                        "Branch Assignment Updated",
                        `${areaManagerToEdit.name}'s branch assignment has been updated.`
                      );
                    },
                    {
                      errorTitle: "Update Failed",
                      errorMessage:
                        "Failed to update branch assignment. Please try again.",
                      showSuccessToast: false,
                    }
                  );
                } finally {
                  setIsSavingAreaManagerEdit(false);
                }
              }}
            >
              {isSavingAreaManagerEdit && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSavingAreaManagerEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Success Dialog */}
      <Dialog
        open={showEditSuccessDialog}
        onOpenChangeAction={setShowEditSuccessDialog}
      >
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-success-scale">
                <svg
                  className="w-12 h-12 text-green-600 animate-success-checkmark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    strokeDasharray="20"
                    strokeDashoffset="20"
                    className="animate-draw-checkmark"
                  />
                </svg>
              </div>
              {/* Ripple effect */}
              <div className="absolute inset-0 bg-green-200 rounded-full animate-success-ripple opacity-0"></div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Updated!
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                {editSuccessData.areaManager &&
                  editSuccessData.branches.length > 0 && (
                    <>
                      <span className="font-semibold">
                        {editSuccessData.areaManager.name}
                      </span>
                      's branch assignment has been updated to{" "}
                      {editSuccessData.branches.length}{" "}
                      {editSuccessData.branches.length === 1
                        ? "branch"
                        : "branches"}
                      .
                    </>
                  )}
              </DialogDescription>
              <p className="text-sm text-gray-500 mt-2">
                Closing automatically...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Area Manager Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChangeAction={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setAreaManagerToDelete(null);
          }
        }}
      >
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <DialogHeader className="pb-4 bg-red-50 rounded-lg">
            <DialogTitle className="text-red-800 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Delete Branch Assignment
            </DialogTitle>
            <DialogDescription className="text-red-700">
              This action cannot be undone. Are you sure you want to permanently
              remove branch assignments for {areaManagerToDelete?.name}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-6 px-2">
            <div className="flex justify-end space-x-4 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAreaManagerToDelete(null);
                }}
                className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeletingAreaManager}
                className={`bg-blue-600 hover:bg-red-700 text-white flex items-center gap-2 shadow-lg transition-all duration-300 ${
                  isDeletingAreaManager
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer hover:scale-110 hover:shadow-xl"
                }`}
                onClick={async () => {
                  if (!areaManagerToDelete) return;

                  setIsDeletingAreaManager(true);

                  try {
                    await withErrorHandling(
                      async () => {
                        // Remove all branch assignments
                        await apiService.removeUserBranches(
                          areaManagerToDelete.id
                        );

                        // Reload area managers
                        const reloadedData =
                          await apiService.getAllAreaManager();
                        const normalizedData =
                          normalizeAreaManagerData(reloadedData);
                        setAreaManagersData(normalizedData);

                        // Success toast
                        toastMessages.generic.success(
                          "Branch Assignment Removed",
                          `${areaManagerToDelete.name}'s branch assignment has been removed.`
                        );

                        // Close modal
                        setIsDeleteModalOpen(false);
                        setAreaManagerToDelete(null);
                      },
                      {
                        errorTitle: "Delete Failed",
                        errorMessage:
                          "Failed to remove branch assignment. Please try again.",
                        showSuccessToast: false,
                      }
                    );
                  } finally {
                    setIsDeletingAreaManager(false);
                  }
                }}
              >
                {isDeletingAreaManager ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>🗑️</span>
                )}
                {isDeletingAreaManager ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
