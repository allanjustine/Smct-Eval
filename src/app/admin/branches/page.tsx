"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toastMessages } from "@/lib/toastMessages";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";
import apiService from "@/lib/apiService";
import EvaluationsPagination from "@/components/paginationComponent";

interface Branches {
  id: number;
  branch_code: string;
  branch_name: string;
  branch: string;
  acronym: string;
  managers_count: string;
  employees_count: string;
}
interface newBranch {
  branch_code: string;
  branch_name: string;
  branch: string;
  acronym: string;
}

export default function DepartmentsTab() {
  const [branches, setBranches] = useState<Branches[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [branchesToDelete, setBranchesToDelete] = useState<Branches | null>(
    null
  );
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);

  //add inputs
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<newBranch>({
    branch_code: "",
    branch_name: "",
    branch: "",
    acronym: "",
  });

  useEffect(() => {
    if (!isAddModalOpen) {
      setFormData({
        branch_code: "",
        branch_name: "",
        branch: "",
        acronym: "",
      });
      setErrors({});
    }
  }, [isAddModalOpen]);

  const validation = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.branch_code) {
      newErrors.branch_code = "Branch code required";
    }
    if (!formData.branch_name) {
      newErrors.branch_name = "Branch name required";
    }
    if (!formData.branch) {
      newErrors.branch = "Branch required";
    }
    if (!formData.acronym) {
      newErrors.acronym = "Branch acronym required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof newBranch,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Use dialog animation hook (0.4s to match EditUserModal speed)
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });

  // Function to load data
  const loadData = async (search: string) => {
    try {
      const response = await apiService.getTotalEmployeesBranch(
        search,
        currentPage,
        itemsPerPage
      );

      // Handle different response structures
      let branchesData: Branches[] = [];
      let total = 0;
      let lastPage = 1;
      let perPageValue = itemsPerPage;

      if (response) {
        // If response has data property (paginated response)
        if (response.data && Array.isArray(response.data)) {
          branchesData = response.data;
          total = response.total || 0;
          lastPage = response.last_page || 1;
          perPageValue = response.per_page || itemsPerPage;
        }
        // If response is directly an array
        else if (Array.isArray(response)) {
          branchesData = response;
          total = response.length;
          lastPage = 1;
          perPageValue = response.length;
        }
        // If response has branches property
        else if (response.branches && Array.isArray(response.branches)) {
          branchesData = response.branches;
          total = response.total || response.branches.length;
          lastPage = response.last_page || 1;
          perPageValue = response.per_page || itemsPerPage;
        }
      }

      setBranches(branchesData);
      setOverviewTotal(total);
      setTotalPages(lastPage);
      setPerPage(perPageValue);
    } catch (error) {
      console.error("Error loading branches:", error);
      // Set empty array on error to prevent undefined errors
      setBranches([]);
      setOverviewTotal(0);
      setTotalPages(1);
      setPerPage(itemsPerPage);
    }
  };

  // Load departments and employees when component mounts
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await loadData(searchTerm);
      } catch (error) {
        console.error("Error initializing departments:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchTerm === "" ? currentPage : setCurrentPage(1);
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      await refreshData();
    };

    fetchData();
  }, [debouncedSearchTerm, currentPage]);

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadData(searchTerm);
    } catch (error) {
      console.error("❌ Error refreshing branches:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to handle adding a new department
  const handleAddBranch = async () => {
    if (!validation()) {
      return console.log("nice try");
    }
    if (validation()) {
      try {
        await apiService.addBranch(formData);
        loadData(searchTerm);
        toastMessages.generic.success(
          "Success " + formData.branch_name + " has been added",
          "A new department has been save."
        );
        setErrors({});
        setIsAddModalOpen(false);
      } catch (error: any) {
        if (error.response?.data?.errors) {
          const backendErrors: Record<string, string> = {};

          Object.keys(error.response.data.errors).forEach((field) => {
            backendErrors[field] = error.response.data.errors[field][0];
          });
          setErrors(backendErrors);
        }
      }
    }
  };

  // Function to handle deleting a department
  const handleDeleteBranches = async () => {
    if (!branchesToDelete) return;

    try {
      if (
        Number(branchesToDelete.employees_count) +
          Number(branchesToDelete.managers_count) !==
        0
      ) {
        toastMessages.generic.warning(
          "Department Deleted revoked",
          `Deletion failed: "${
            branchesToDelete.branch_name + "/ " + branchesToDelete.branch_code
          }" has employees linked to it.`
        );
        // Close modal and reset state when deletion fails
        setIsDeleteModalOpen(false);
        setBranchesToDelete(null);
        // Refresh data to ensure we have the latest branch info
        await loadData(searchTerm);
        return;
      } else {
        // Set deleting state to show skeleton animation
        setDeletingBranchId(branchesToDelete.id);
        
        // Close modal immediately
        setIsDeleteModalOpen(false);
        
        // Wait 2 seconds to show skeleton animation
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Actually delete the branch
        await apiService.deleteBranches(branchesToDelete.id);
        
        // Refresh data first, then reset deleting state after data loads
        await loadData(searchTerm);
        setDeletingBranchId(null);
        
        toastMessages.generic.success(
          "Department Deleted",
          `"${
            branchesToDelete.branch_name + "/ " + branchesToDelete.branch_code
          }" has been deleted successfully.`
        );
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      setDeletingBranchId(null);
      toastMessages.generic.error(
        "Error",
        "Failed to delete department. Please try again."
      );
    } finally {
      setBranchesToDelete(null);
    }
  };

  // Show loading skeleton on initial load
  if (loading) {
    return (
      <div className="relative  overflow-y-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card key={`skeleton-dept-${index}`} className="animate-pulse">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <Skeleton className="h-6 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <Skeleton className="h-6 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative  overflow-y-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/2">
              <CardTitle>Branches</CardTitle>
              <CardDescription>
                View and manage branches information
              </CardDescription>
              <div className="relative flex-1 mt-5">
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
                  placeholder="Search by branch, branch code, branch name, acronym"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
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
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 hover:text-white cursor-pointer cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                Add Branch
              </Button>
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-green-700 hover:text-white cursor-pointer cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isRefreshing ? (
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
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isRefreshing && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-white/80">
                <div className="flex flex-col items-center gap-3 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
                  <div className="relative">
                    {/* Spinning ring */}
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                    {/* Logo in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src="/smct.png"
                        alt="SMCT Logo"
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Refreshing...
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Render all branches in their original order */}
              {branches && Array.isArray(branches) && branches.length > 0
                ? branches.map((branch) => {
                    const isDeleting = deletingBranchId === branch.id;
                    return (
                      <Card key={branch.id} className={isDeleting ? "animate-slide-out-right bg-red-50 border-red-200" : ""}>
                        {isDeleting ? (
                          <>
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-5 w-24 rounded-full" />
                                  <Skeleton className="h-8 w-8 rounded" />
                                </div>
                              </div>
                              <Skeleton className="h-4 w-40 mt-2" />
                              <Skeleton className="h-4 w-32 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-100 rounded-lg">
                                  <Skeleton className="h-6 w-12 mx-auto mb-2" />
                                  <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                                <div className="text-center p-3 bg-gray-100 rounded-lg">
                                  <Skeleton className="h-6 w-12 mx-auto mb-2" />
                                  <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                              </div>
                            </CardContent>
                          </>
                        ) : (
                          <>
                            <CardHeader>
                              <CardTitle className="flex justify-between items-center">
                                {branch.branch_name + " /" + branch.branch_code}
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {branch.employees_count} employees
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setBranchesToDelete(branch);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    disabled={deletingBranchId !== null}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardTitle>
                              <CardDescription>
                                Branch: {branch.branch}
                              </CardDescription>
                              <CardDescription>
                                Acronym: {branch.acronym}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">
                                    {branch.employees_count}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Employees
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">
                                    {branch.managers_count}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Managers
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    );
                  })
                : null}
            </div>
          </div>
          {branches && Array.isArray(branches) && branches.length === 0 && (
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
              <div className="text-gray-500 text-center">
                {searchTerm ? (
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
                      Records will appear here when evaluations are submitted
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Pagination Controls */}
          {overviewTotal > itemsPerPage && (
            <EvaluationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={overviewTotal}
              perPage={perPage}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Branch Modal */}
      <Dialog open={isAddModalOpen} onOpenChangeAction={setIsAddModalOpen}>
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <DialogHeader className="pb-4">
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch in the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-2">
            <div className="space-y-2">
              <Label htmlFor="branchName" className="text-sm font-medium">
                Branch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="branchName"
                placeholder="Enter branch name"
                value={formData.branch_name}
                onChange={(e) =>
                  handleInputChange(
                    "branch_name",
                    e.target.value.toLocaleUpperCase()
                  )
                }
                style={{ textTransform: "uppercase" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddBranch();
                  }
                }}
                autoFocus
              />
              {errors?.branch_name && (
                <p className="text-sm text-red-500">{errors?.branch_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode" className="text-sm font-medium">
                Branch Code
              </Label>
              <Input
                id="branchCode"
                placeholder="Enter branch code (optional)"
                value={formData.branch_code}
                onChange={(e) =>
                  handleInputChange("branch_code", e.target.value.toUpperCase())
                }
                style={{ textTransform: "uppercase" }}
              />
              {errors?.branch_code && (
                <p className="text-sm text-red-500">{errors?.branch_code}</p>
              )}
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label
                htmlFor="records-approval-status"
                className="text-sm font-medium"
              >
                Branch
              </Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => handleInputChange("branch", value)}
              >
                <SelectTrigger className="w-48 cursor-pointer">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Des Appliance Plaza, Inc.">
                    Des Appliance Plaza, Inc.
                  </SelectItem>
                  <SelectItem value="Des Strong Motors, Inc.">
                    Des Strong Motors, Inc.
                  </SelectItem>
                  <SelectItem value="Honda Des, Inc.">
                    Honda Des, Inc.
                  </SelectItem>
                  <SelectItem value="Head Office">Head Office</SelectItem>
                  <SelectItem value="Strong Moto Centrum, Inc.">
                    Strong Moto Centrum, Inc.
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors?.branch && (
                <p className="text-sm text-red-500">{errors?.branch}</p>
              )}
            </div>
            <div className="w-full md:w-48 space-y-2 mb-2">
              <Label
                htmlFor="records-approval-status"
                className="text-sm font-medium"
              >
                Acronym
              </Label>
              <Select
                value={formData.acronym}
                onValueChange={(value) => handleInputChange("acronym", value)}
              >
                <SelectTrigger className="w-48 cursor-pointer">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAP">DAP</SelectItem>
                  <SelectItem value="DSM">DSM</SelectItem>
                  <SelectItem value="HD">HD</SelectItem>
                  <SelectItem value="HO">HO</SelectItem>
                  <SelectItem value="KIA">KIA</SelectItem>
                  <SelectItem value="SMCT">SMCT</SelectItem>
                </SelectContent>
              </Select>
              {errors?.acronym && (
                <p className="text-sm text-red-500">{errors?.acronym}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-6 px-2">
            <div className="flex justify-end space-x-4 w-full cursor-pointer">
              <Button
                variant="outline"
                onClick={() => {
                  setErrors({});
                  setIsAddModalOpen(false);
                }}
                className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                Cancel
              </Button>
              <Button
                onClick={() => handleAddBranch()}
                className="bg-green-500 text-white hover:bg-green-600 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Branch
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChangeAction={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setBranchesToDelete(null);
          }
        }}
      >
        <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
          <DialogHeader className="pb-4 bg-red-50 rounded-lg ">
            <DialogTitle className="text-red-800 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Delete {branchesToDelete?.branch_name} Branch
            </DialogTitle>
            <DialogDescription className="text-red-700">
              This action cannot be undone. Are you sure you want to permanently
              delete this department?
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
                    <li>This branch record</li>
                    <li>All users under this branch</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="font-medium">Branch Details:</p>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-medium">Branch Name:</span>{" "}
                    {branchesToDelete?.branch_name}
                  </p>
                  <p>
                    <span className="font-medium">No. of employees:</span>{" "}
                    {(isNaN(Number(branchesToDelete?.employees_count)) ? 0 : Number(branchesToDelete?.employees_count)) +
                      (isNaN(Number(branchesToDelete?.managers_count)) ? 0 : Number(branchesToDelete?.managers_count))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 px-2">
            <div className="flex justify-end space-x-4 w-full cursor-pointer">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setBranchesToDelete(null);
                }}
                className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-red-700 text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleDeleteBranches()}
              >
                ❌ Delete Permanently
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
